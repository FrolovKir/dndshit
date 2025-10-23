import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest } from '@/lib/credits';
import { getUserIdFromRequest } from '@/lib/auth';
import { BALANCED_ENCOUNTER_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import {
  calculateXPBudget,
  calculateAdjustedXP,
  determineDifficulty,
  SRD_MONSTERS,
  CR_TO_XP,
  type Difficulty,
} from '@/lib/encounter-balance';

interface BalanceRequest {
  partyLevel: number;
  partySize: number;
  difficulty: Difficulty;
  environment?: string;
  context?: string;
  generateDetails?: boolean; // Нужно ли генерировать детальное описание через AI
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    userId = getUserIdFromRequest(request);

    const body = (await request.json()) as BalanceRequest;
    const { partyLevel, partySize, difficulty, environment, context, generateDetails } = body;

    if (!partyLevel || !partySize || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required parameters: partyLevel, partySize, difficulty' },
        { status: 400 }
      );
    }

    if (partyLevel < 1 || partyLevel > 20) {
      return NextResponse.json(
        { error: 'Party level must be between 1 and 20' },
        { status: 400 }
      );
    }

    if (partySize < 1 || partySize > 10) {
      return NextResponse.json(
        { error: 'Party size must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Расчёт XP бюджета
    const xpBudget = calculateXPBudget(partyLevel, partySize, difficulty);

    // Подбираем подходящих монстров
    const suitableMonsters = getSuitableMonstersForParty(partyLevel, difficulty);

    // Генерируем несколько вариантов энкаунтеров
    const encounters = generateEncounterVariants(
      suitableMonsters,
      xpBudget,
      partySize,
      partyLevel,
      difficulty
    );

    // Если нужно детальное описание - используем AI
    let detailedEncounter = null;
    let tokensUsed = 0;

    if (generateDetails && encounters.length > 0) {
      const estimatedTokens = 1500;

      // Проверка кредитов
      const creditCheck = await checkCredits(userId, estimatedTokens);
      if (!creditCheck.allowed) {
        return NextResponse.json(
          {
            error: 'Insufficient credits for detailed generation',
            message: creditCheck.message,
            encounters, // Возвращаем базовые варианты без деталей
          },
          { status: 402 }
        );
      }

      // Берём первый вариант для детального описания
      const selectedEncounter = encounters[0];

      const promptText = BALANCED_ENCOUNTER_PROMPT({
        monsters: selectedEncounter.monsters,
        partyLevel,
        partySize,
        difficulty,
        environment,
        context,
      });

      const response = await generateContent([
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptText },
      ]);

      // Парсинг JSON
      try {
        detailedEncounter = JSON.parse(response.content);
      } catch (parseError) {
        console.error('Failed to parse JSON:', response.content);
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          detailedEncounter = JSON.parse(jsonMatch[0]);
        }
      }

      tokensUsed = response.usage.totalTokens;

      // Вычитание токенов
      await deductCredits(userId, response.usage);

      // Логирование
      await logRequest(
        userId,
        'balanced_encounter',
        response.usage,
        response.model,
        true
      );
    }

    return NextResponse.json({
      success: true,
      partyLevel,
      partySize,
      difficulty,
      xpBudget,
      encounters,
      detailedEncounter,
      tokensUsed,
    });
  } catch (error) {
    console.error('Encounter balance error:', error);

    if (userId) {
      try {
        await logRequest(
          userId,
          'balanced_encounter',
          { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          'unknown',
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return NextResponse.json(
      {
        error: 'Encounter balance failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Вспомогательные функции

function getSuitableMonstersForParty(partyLevel: number, difficulty: Difficulty): typeof SRD_MONSTERS {
  // Определяем подходящий диапазон CR
  let minCR: string, maxCR: string;

  if (difficulty === 'easy') {
    minCR = partyLevel <= 4 ? '0' : String(Math.max(1, partyLevel - 4));
    maxCR = String(Math.max(1, partyLevel - 1));
  } else if (difficulty === 'medium') {
    minCR = String(Math.max(1, partyLevel - 2));
    maxCR = String(partyLevel + 1);
  } else if (difficulty === 'hard') {
    minCR = String(Math.max(1, partyLevel - 1));
    maxCR = String(partyLevel + 3);
  } else {
    // deadly
    minCR = String(partyLevel);
    maxCR = String(partyLevel + 5);
  }

  const minXP = CR_TO_XP[minCR] || 0;
  const maxXP = CR_TO_XP[maxCR] || Infinity;

  return SRD_MONSTERS.filter((m) => {
    const xp = CR_TO_XP[m.cr] || 0;
    return xp >= minXP && xp <= maxXP;
  });
}

function generateEncounterVariants(
  monsters: typeof SRD_MONSTERS,
  targetXP: number,
  partySize: number,
  partyLevel: number,
  difficulty: Difficulty
): Array<{
  monsters: Array<{ name: string; cr: string; count: number; type: string }>;
  totalXP: number;
  adjustedXP: number;
  actualDifficulty: Difficulty;
  matchScore: number;
}> {
  const variants: Array<any> = [];

  // Стратегия 1: Один сильный монстр
  const singleBoss = findSingleMonsterEncounter(monsters, targetXP, partySize);
  if (singleBoss) variants.push(singleBoss);

  // Стратегия 2: Группа одинаковых монстров
  const uniformGroup = findUniformGroupEncounter(monsters, targetXP, partySize);
  if (uniformGroup) variants.push(uniformGroup);

  // Стратегия 3: Смешанная группа (босс + миньоны)
  const mixed = findMixedEncounter(monsters, targetXP, partySize);
  if (mixed) variants.push(mixed);

  // Стратегия 4: Несколько средних противников
  const mediumGroup = findMediumGroupEncounter(monsters, targetXP, partySize);
  if (mediumGroup) variants.push(mediumGroup);

  // Сортируем по точности попадания в бюджет
  variants.sort((a, b) => b.matchScore - a.matchScore);

  return variants.slice(0, 5); // Возвращаем топ-5 вариантов
}

function findSingleMonsterEncounter(
  monsters: typeof SRD_MONSTERS,
  targetXP: number,
  partySize: number
): any {
  // Ищем одного монстра, близкого к целевому XP
  for (const monster of monsters) {
    const baseXP = CR_TO_XP[monster.cr] || 0;
    const adjustedXP = calculateAdjustedXP([{ cr: monster.cr, count: 1 }], partySize);

    const matchScore = 1 - Math.abs(adjustedXP - targetXP) / targetXP;

    if (matchScore > 0.7) {
      // Попадание в пределах 30%
      return {
        monsters: [{ name: monster.name, cr: monster.cr, count: 1, type: monster.type }],
        totalXP: baseXP,
        adjustedXP,
        actualDifficulty: 'medium',
        matchScore,
      };
    }
  }
  return null;
}

function findUniformGroupEncounter(
  monsters: typeof SRD_MONSTERS,
  targetXP: number,
  partySize: number
): any {
  // Ищем группу одинаковых монстров
  for (const monster of monsters) {
    const baseXP = CR_TO_XP[monster.cr] || 0;

    // Пробуем разное количество
    for (let count = 2; count <= 10; count++) {
      const adjustedXP = calculateAdjustedXP([{ cr: monster.cr, count }], partySize);
      const matchScore = 1 - Math.abs(adjustedXP - targetXP) / targetXP;

      if (matchScore > 0.7) {
        return {
          monsters: [{ name: monster.name, cr: monster.cr, count, type: monster.type }],
          totalXP: baseXP * count,
          adjustedXP,
          actualDifficulty: 'medium',
          matchScore,
        };
      }
    }
  }
  return null;
}

function findMixedEncounter(
  monsters: typeof SRD_MONSTERS,
  targetXP: number,
  partySize: number
): any {
  // Босс + миньоны
  const sortedMonsters = [...monsters].sort(
    (a, b) => (CR_TO_XP[b.cr] || 0) - (CR_TO_XP[a.cr] || 0)
  );

  for (let i = 0; i < Math.min(5, sortedMonsters.length); i++) {
    const boss = sortedMonsters[i];
    const bossXP = CR_TO_XP[boss.cr] || 0;

    // Берём 30-50% бюджета на босса
    if (bossXP > targetXP * 0.7) continue;

    const remainingXP = targetXP - bossXP;

    // Ищем миньонов
    for (let j = sortedMonsters.length - 1; j >= 0; j--) {
      const minion = sortedMonsters[j];
      const minionXP = CR_TO_XP[minion.cr] || 0;

      if (minionXP > bossXP / 2) continue; // Миньоны должны быть слабее

      // Подбираем количество
      for (let count = 2; count <= 6; count++) {
        const composition = [
          { cr: boss.cr, count: 1 },
          { cr: minion.cr, count },
        ];

        const adjustedXP = calculateAdjustedXP(composition, partySize);
        const matchScore = 1 - Math.abs(adjustedXP - targetXP) / targetXP;

        if (matchScore > 0.7) {
          return {
            monsters: [
              { name: boss.name, cr: boss.cr, count: 1, type: boss.type },
              { name: minion.name, cr: minion.cr, count, type: minion.type },
            ],
            totalXP: bossXP + minionXP * count,
            adjustedXP,
            actualDifficulty: 'medium',
            matchScore,
          };
        }
      }
    }
  }
  return null;
}

function findMediumGroupEncounter(
  monsters: typeof SRD_MONSTERS,
  targetXP: number,
  partySize: number
): any {
  // Группа из 3-5 средних противников
  const midRange = monsters.filter((m) => {
    const xp = CR_TO_XP[m.cr] || 0;
    return xp >= targetXP * 0.15 && xp <= targetXP * 0.4;
  });

  for (const monster of midRange) {
    for (let count = 3; count <= 5; count++) {
      const adjustedXP = calculateAdjustedXP([{ cr: monster.cr, count }], partySize);
      const matchScore = 1 - Math.abs(adjustedXP - targetXP) / targetXP;

      if (matchScore > 0.7) {
        return {
          monsters: [{ name: monster.name, cr: monster.cr, count, type: monster.type }],
          totalXP: (CR_TO_XP[monster.cr] || 0) * count,
          adjustedXP,
          actualDifficulty: 'medium',
          matchScore,
        };
      }
    }
  }
  return null;
}

