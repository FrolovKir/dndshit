import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { CAMPAIGN_SCENES_V2_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * ШАГ 2: Генерация 10 сцен на основе кампании
 * POST /api/generate/campaign-scenes
 */
export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { projectId, count } = body;

    console.log('=== STEP 2: Generating Campaign Scenes ===');
    console.log('Project ID:', projectId);

    // Получаем проект из БД
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Парсим описание проекта
    let projectDetails;
    try {
      projectDetails = JSON.parse(project.description || '{}');
    } catch (e) {
      projectDetails = {};
    }

    // Создаем промпт V2 на основе foundation JSON
    const foundationJson = JSON.stringify({
      title: project.title,
      setting_overview: project.synopsis,
      world_tone: project.setting,
      ...projectDetails,
    }, null, 2);
    const userPrompt = CAMPAIGN_SCENES_V2_PROMPT({ foundationJson, count });

    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов (10 сцен ~6000 токенов)
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 6000);
    
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
      maxTokens: 8192, // Максимум для DeepSeek
    });

    console.log('=== LLM Response ===');
    console.log('Tokens used:', response.totalTokens);

    // Парсим JSON ответ
    let scenesData;
    try {
      let jsonContent = response.content.trim();
      
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      scenesData = JSON.parse(jsonContent);
      
      console.log('Parsed scenes count:', scenesData.scenes?.length || 0);
      
    } catch (e) {
      console.error('JSON Parse Error:', e);
      
      return NextResponse.json(
        { error: 'Failed to parse LLM response', details: response.content.substring(0, 500) },
        { status: 500 }
      );
    }

    // Создаем сцены в БД
    let createdScenes = 0;
    const createdSceneIds: string[] = [];

    const mapType = (t: string) => {
      const x = (t || '').toLowerCase();
      if (x === 'conflict') return 'combat';
      if (x === 'social') return 'social';
      if (x === 'exploration') return 'exploration';
      if (x === 'moral choice') return 'story';
      if (x === 'discovery') return 'story';
      return 'story';
    };

    if (scenesData.scenes && Array.isArray(scenesData.scenes)) {
      for (const sceneData of scenesData.scenes) {
        try {
          const scene = await prisma.scene.create({
            data: {
              projectId: project.id,
              title: sceneData.title || 'Без названия',
              description: sceneData.description || '',
              sceneType: mapType(sceneData.type),
              order: sceneData.scene_id || createdScenes + 1,
              // Сохраняем доп. данные в поле description как JSON строку в конце
              // Или можно добавить новые поля в схему Prisma
            },
          });
          
          createdScenes++;
          createdSceneIds.push(scene.id);
          console.log('✓ Scene created:', sceneData.title);

          // Сохраняем метаданные сцены отдельно
          const sceneMetadata = {
            goal_for_players: sceneData.goal_for_players,
            world_effect: sceneData.world_effect,
          };

          // Обновляем описание сцены с метаданными
          const descriptionWithMeta = `${sceneData.description}\n\n<!-- METADATA: ${JSON.stringify(sceneMetadata)} -->`;
          await prisma.scene.update({
            where: { id: scene.id },
            data: { description: descriptionWithMeta },
          });

          // Если это боевая сцена с монстрами, создаем заготовку энкаунтера
          if (mapType(sceneData.type) === 'combat') {
            await prisma.encounter.create({
              data: {
                projectId: project.id,
                title: `${sceneData.title} - бой`,
                description: sceneData.description,
                encounterType: 'combat',
                difficulty: 'medium',
                monsters: null,
                environment: '',
                tactics: '',
                rewards: null,
                estimatedLevel: parseInt((projectDetails?.levelRange || '3')?.toString().split('-')[0] || '3'),
              },
            });
          }

        } catch (err) {
          console.error('Error creating scene:', err);
        }
      }
    }

    // Вычитаем токены и логируем
    await deductCredits(userId, {
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      totalTokens: response.totalTokens,
    });

    await logRequest(
      userId,
      'campaign-scenes',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    console.log(`✅ Created ${createdScenes} scenes for project ${project.id}`);

    return NextResponse.json({
      success: true,
      scenesCreated: createdScenes,
      sceneIds: createdSceneIds,
      scenesData,
      tokensUsed: response.totalTokens,
    });
  } catch (error: any) {
    console.error('Error generating campaign scenes:', error);
    
    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'campaign-scenes',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate campaign scenes' },
      { status: 500 }
    );
  }
}

