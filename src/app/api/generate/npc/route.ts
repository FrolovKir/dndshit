import { NextRequest, NextResponse } from 'next/server';
import { llm, parseJsonFromLLM } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { NPC_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { projectId, role, race, npcClass, alignment, context } = body;

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

    // Формируем расширенный контекст с информацией о кампании
    const enrichedContext = `
КОНТЕКСТ КАМПАНИИ:
Название: ${project.title}
Сюжет: ${project.synopsis || 'не указан'}
Сеттинг: ${project.setting || 'Forgotten Realms'}
${projectDetails.atmosphericDescription ? `Атмосфера: ${projectDetails.atmosphericDescription}` : ''}
${projectDetails.mainAntagonist ? `Главный антагонист: ${projectDetails.mainAntagonist.name} - ${projectDetails.mainAntagonist.description}` : ''}

ТРЕБОВАНИЯ К NPC:
${context || 'Создайте интересного персонажа для этой кампании'}

Персонаж должен органично вписываться в сюжет и атмосферу кампании.
`.trim();

    // Создаем промпт
    const userPrompt = NPC_PROMPT({
      role,
      race,
      class: npcClass,
      alignment,
      context: enrichedContext,
    });
    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 1000);
    
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
      temperature: 0.9,
      maxTokens: 1200,
    });

    // Парсим JSON ответ
    console.log('[NPC] Raw LLM response:', response.content);
    
    let npcData;
    try {
      npcData = parseJsonFromLLM(response.content);
      console.log('[NPC] Parsed NPC data:', npcData);
    } catch (e) {
      console.error('[NPC] Failed to parse JSON:', e);
      console.error('[NPC] Content was:', response.content);
      npcData = {
        name: 'Сгенерированный NPC',
        race: race || 'Human',
        class: npcClass || 'Commoner',
        level: 1,
        alignment: alignment || 'Neutral',
        personality: response.content,
        backstory: '',
        appearance: '',
        motivations: '',
        stats: null,
      };
    }

    // Создаем NPC в БД
    const npc = await prisma.nPC.create({
      data: {
        projectId,
        name: npcData.name,
        race: npcData.race,
        class: npcData.class,
        level: npcData.level,
        alignment: npcData.alignment,
        personality: typeof npcData.personality === 'object' 
          ? JSON.stringify(npcData.personality) 
          : npcData.personality,
        backstory: npcData.backstory,
        appearance: npcData.appearance,
        motivations: npcData.motivations,
        stats: npcData.stats ? JSON.stringify(npcData.stats) : null,
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
      'npc',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    return NextResponse.json({
      success: true,
      npc,
      npcData,
      tokensUsed: response.totalTokens,
    });
  } catch (error: any) {
    console.error('Error generating NPC:', error);
    
    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'npc',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate NPC' },
      { status: 500 }
    );
  }
}

