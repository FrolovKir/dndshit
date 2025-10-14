import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { SCENE_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { projectId, sceneContext, previousScenes, tone } = body;

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
${projectDetails.themes ? `Темы: ${projectDetails.themes.join(', ')}` : ''}

НОВАЯ СЦЕНА:
${sceneContext || 'Создайте интересную сцену для этой кампании'}
${previousScenes ? `\nПредыдущие события: ${previousScenes}` : ''}
`.trim();

    // Создаем промпт
    const userPrompt = SCENE_PROMPT({ 
      sceneContext: enrichedContext, 
      previousScenes: '', 
      tone: tone || projectDetails.atmosphericDescription 
    });
    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 1200);
    
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
      temperature: 0.8,
      maxTokens: 1500,
    });

    // Парсим JSON ответ
    console.log('[SCENE] Raw LLM response:', response.content);
    
    let sceneData;
    try {
      // Очищаем от markdown блоков
      let cleanedContent = response.content.trim();
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      }
      if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.replace(/^```\n?/g, '').replace(/```\n?$/g, '');
      }
      
      console.log('[SCENE] Cleaned content:', cleanedContent);
      sceneData = JSON.parse(cleanedContent);
      console.log('[SCENE] Parsed scene data:', sceneData);
    } catch (e) {
      console.error('[SCENE] Failed to parse JSON:', e);
      console.error('[SCENE] Content was:', response.content);
      sceneData = {
        title: 'Сгенерированная сцена',
        description: response.content,
        sceneType: 'story',
        challenges: [],
        atmosphere: '',
        secrets: [],
      };
    }

    // Получаем текущий порядок сцен
    const scenesCount = await prisma.scene.count({
      where: { projectId },
    });

    // Создаем сцену в БД
    const scene = await prisma.scene.create({
      data: {
        projectId,
        title: sceneData.title,
        description: sceneData.description,
        sceneType: sceneData.sceneType || 'story',
        order: scenesCount + 1,
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
      'scene',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    return NextResponse.json({
      success: true,
      scene,
      sceneData,
      tokensUsed: response.totalTokens,
    });
  } catch (error: any) {
    console.error('Error generating scene:', error);
    
    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'scene',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate scene' },
      { status: 500 }
    );
  }
}

