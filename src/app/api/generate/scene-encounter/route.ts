import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { SCENE_ENCOUNTER_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * ШАГ 4: Генерация детального энкаунтера для боевой сцены
 * POST /api/generate/scene-encounter
 */
export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { sceneId } = body;

    console.log('=== STEP 4: Generating Scene Encounter ===');
    console.log('Scene ID:', sceneId);

    // Получаем сцену из БД
    const scene = await prisma.scene.findUnique({
      where: { id: sceneId },
      include: { project: true },
    });

    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    // Извлекаем метаданные из описания
    let sceneMetadata: any = {};
    const metadataMatch = scene.description.match(/<!-- METADATA: (.+?) -->/);
    if (metadataMatch) {
      try {
        sceneMetadata = JSON.parse(metadataMatch[1]);
      } catch (e) {
        console.warn('Failed to parse scene metadata');
      }
    }

    // Парсим описание проекта
    let projectDetails;
    try {
      projectDetails = JSON.parse(scene.project.description || '{}');
    } catch (e) {
      projectDetails = {};
    }

    // Формируем строку с рекомендуемыми монстрами
    const suggestedMonsters = sceneMetadata.monsters && sceneMetadata.monsters.length > 0
      ? sceneMetadata.monsters.map((m: any) => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')
      : undefined;

    // Создаем промпт с контекстом кампании и сцены
    const userPrompt = SCENE_ENCOUNTER_PROMPT({
      campaignTitle: scene.project.title,
      sceneTitle: scene.title,
      sceneDescription: scene.description.replace(/<!-- METADATA: .+? -->/, '').trim(),
      location: sceneMetadata.location || 'Неизвестная локация',
      level: projectDetails.recommendedLevel || '1-5',
      suggestedMonsters,
    });

    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов (детальный энкаунтер ~2500 токенов)
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 2500);
    
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
      temperature: 0.7,
      maxTokens: 3072,
    });

    console.log('=== LLM Response ===');
    console.log('Tokens used:', response.totalTokens);

    // Парсим JSON ответ
    let encounterData;
    try {
      let jsonContent = response.content.trim();
      
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      encounterData = JSON.parse(jsonContent);
      
      console.log('Parsed encounter:', encounterData.title);
      
    } catch (e) {
      console.error('JSON Parse Error:', e);
      
      return NextResponse.json(
        { error: 'Failed to parse LLM response', details: response.content.substring(0, 500) },
        { status: 500 }
      );
    }

    // Создаем или обновляем энкаунтер в БД
    // Сначала проверяем, есть ли уже энкаунтер для этой сцены
    const existingEncounter = await prisma.encounter.findFirst({
      where: {
        projectId: scene.projectId,
        title: { contains: scene.title },
      },
    });

    let encounter;
    if (existingEncounter) {
      // Обновляем существующий
      encounter = await prisma.encounter.update({
        where: { id: existingEncounter.id },
        data: {
          title: encounterData.title,
          description: encounterData.description,
          encounterType: encounterData.encounterType,
          difficulty: encounterData.difficulty,
          monsters: JSON.stringify(encounterData.monsters),
          environment: encounterData.environment,
          tactics: encounterData.tactics,
          rewards: encounterData.rewards ? JSON.stringify(encounterData.rewards) : null,
          estimatedLevel: parseInt(projectDetails.recommendedLevel?.split('-')[0] || '3'),
        },
      });
      console.log('✓ Encounter updated:', encounterData.title);
    } else {
      // Создаем новый
      encounter = await prisma.encounter.create({
        data: {
          projectId: scene.projectId,
          title: encounterData.title,
          description: encounterData.description,
          encounterType: encounterData.encounterType,
          difficulty: encounterData.difficulty,
          monsters: JSON.stringify(encounterData.monsters),
          environment: encounterData.environment,
          tactics: encounterData.tactics,
          rewards: encounterData.rewards ? JSON.stringify(encounterData.rewards) : null,
          estimatedLevel: parseInt(projectDetails.recommendedLevel?.split('-')[0] || '3'),
        },
      });
      console.log('✓ Encounter created:', encounterData.title);
    }

    // Вычитаем токены и логируем
    await deductCredits(userId, {
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      totalTokens: response.totalTokens,
    });

    await logRequest(
      userId,
      'scene-encounter',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    console.log(`✅ Encounter processed for scene ${scene.id}`);

    return NextResponse.json({
      success: true,
      encounter,
      encounterData,
      tokensUsed: response.totalTokens,
    });
  } catch (error: any) {
    console.error('Error generating scene encounter:', error);
    
    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'scene-encounter',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate scene encounter' },
      { status: 500 }
    );
  }
}

