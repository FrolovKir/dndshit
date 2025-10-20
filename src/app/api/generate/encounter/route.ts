import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { ENCOUNTER_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { projectId, encounterType, difficulty, level, environment, context } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Получаем проект из БД для контекста
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Извлекаем детали проекта
    let projectDetails;
    try {
      projectDetails = JSON.parse(project.description || '{}');
    } catch (e) {
      projectDetails = {};
    }

    // Получаем уже существующие энкаунтеры в проекте
    const existingEncounters = await prisma.encounter.findMany({
      where: { projectId },
      select: { title: true, monsters: true },
    });

    // Формируем список монстров из существующих энкаунтеров
    const existingEncountersList = existingEncounters.map((enc) => {
      let monstersText = '';
      try {
        const monsters = JSON.parse(enc.monsters || '[]');
        if (monsters.length > 0) {
          monstersText = ` (монстры: ${monsters.map((m: any) => `${m.count}× ${m.name}`).join(', ')})`;
        }
      } catch (e) {
        // ignore
      }
      return `${enc.title}${monstersText}`;
    });

    // Формируем расширенный контекст с информацией о кампании
    const enrichedContext = `
КОНТЕКСТ КАМПАНИИ:
Название: ${project.title}
Сюжет: ${project.synopsis || 'не указан'}
Сеттинг: ${project.setting || 'Forgotten Realms'}
${projectDetails.atmosphericDescription ? `Атмосфера: ${projectDetails.atmosphericDescription}` : ''}
${projectDetails.mainAntagonist ? `Главный антагонист: ${projectDetails.mainAntagonist.name}` : ''}
${projectDetails.keyLocations ? `Ключевые локации: ${projectDetails.keyLocations.join(', ')}` : ''}

ТРЕБОВАНИЯ К ЭНКАУНТЕРУ:
${context || 'Создайте интересный боевой энкаунтер для этой кампании'}

Энкаунтер должен соответствовать сюжету и атмосфере кампании.
`.trim();

    // Создаем промпт
    const userPrompt = ENCOUNTER_PROMPT({
      encounterType,
      difficulty,
      level: level || parseInt(projectDetails.recommendedLevel?.split('-')[0] || '3'),
      environment,
      context: enrichedContext,
      existingEncounters: existingEncountersList,
    });
    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 1500);
    
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.message || 'Insufficient tokens' },
        { status: 402 }
      );
    }

    // Вызываем LLM
    const response = await llm.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.75,
      maxTokens: 1500,
    });

    // Парсим JSON ответ
    console.log('[ENCOUNTER] Raw LLM response:', response.content);
    
    let encounterData;
    try {
      // Очищаем от markdown блоков
      let cleanedContent = response.content.trim();
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      }
      if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/^```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      console.log('[ENCOUNTER] Cleaned content:', cleanedContent);
      encounterData = JSON.parse(cleanedContent);
      console.log('[ENCOUNTER] Parsed encounter data:', encounterData);
    } catch (e) {
      console.error('[ENCOUNTER] Failed to parse JSON:', e);
      console.error('[ENCOUNTER] Content was:', response.content);
      encounterData = {
        title: 'Сгенерированный энкаунтер',
        encounterType: encounterType || 'combat',
        difficulty: difficulty || 'medium',
        description: response.content,
        monsters: [],
        environment: environment || '',
        tactics: '',
        rewards: null,
        estimatedLevel: level || 3,
      };
    }

    // Создаем энкаунтер в БД
    const encounter = await prisma.encounter.create({
      data: {
        projectId,
        title: encounterData.title,
        description: encounterData.description,
        encounterType: encounterData.encounterType || 'combat',
        difficulty: encounterData.difficulty,
        monsters: encounterData.monsters ? JSON.stringify(encounterData.monsters) : null,
        environment: encounterData.environment,
        tactics: encounterData.tactics,
        rewards: encounterData.rewards ? JSON.stringify(encounterData.rewards) : null,
        estimatedLevel: encounterData.estimatedLevel,
      },
    });

    // Вычитаем токены и логируем
    await deductCredits(userId, {
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      totalTokens: response.totalTokens,
    });

    await logRequest(
      userId,
      'encounter',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    return NextResponse.json({
      success: true,
      encounter,
      encounterData,
      tokensUsed: response.totalTokens,
    });
  } catch (error: any) {
    console.error('Error generating encounter:', error);
    
    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'encounter',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate encounter' },
      { status: 500 }
    );
  }
}

