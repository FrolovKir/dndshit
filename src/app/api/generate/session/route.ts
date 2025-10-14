import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { SESSION_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { theme, setting, level, playerCount, atmosphericDescription } = body;

    // Создаем промпт
    const userPrompt = SESSION_PROMPT({ theme, setting, level, playerCount, atmosphericDescription });
    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов (оцениваем общий расход в ~8192 токенов для полной кампании)
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 8192);
    
    if (!creditCheck.allowed) {
      return NextResponse.json(
        { error: creditCheck.message || 'Insufficient tokens' },
        { status: 402 }
      );
    }

    // Вызываем LLM (максимальный лимит DeepSeek = 8192)
    const response = await llm.complete([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ], {
      temperature: 0.8,
      maxTokens: 8192, // Максимум для DeepSeek API
    });

    // Логируем ответ для отладки
    console.log('=== LLM Response ===');
    console.log('Length:', response.content.length);
    console.log('First 500 chars:', response.content.substring(0, 500));
    console.log('Last 500 chars:', response.content.substring(response.content.length - 500));
    
    // Парсим JSON ответ
    let sessionData;
    try {
      // Пытаемся извлечь JSON из ответа (на случай если есть лишний текст)
      let jsonContent = response.content.trim();
      
      // Если ответ начинается с ```json, извлекаем JSON
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      sessionData = JSON.parse(jsonContent);
      
      // Логируем распарсенные данные
      console.log('=== Parsed Data ===');
      console.log('Title:', sessionData.title);
      console.log('Scenes count:', sessionData.scenes?.length || 0);
      console.log('NPCs count:', sessionData.npcs?.length || 0);
      
    } catch (e) {
      console.error('JSON Parse Error:', e);
      console.error('Failed to parse:', response.content.substring(0, 1000));
      
      // Если не JSON, оборачиваем в простой объект
      sessionData = {
        title: 'Сгенерированная кампания',
        synopsis: response.content,
        setting: setting || 'Forgotten Realms',
        themes: [theme || 'adventure'],
        estimatedSessions: 8,
        recommendedLevel: level || '1-5',
        mainPlotPoints: [],
        scenes: [],
        npcs: [],
      };
    }

    // Создаем проект в БД
    const project = await prisma.project.create({
      data: {
        userId,
        title: sessionData.title,
        synopsis: sessionData.synopsis,
        setting: sessionData.setting,
        description: `Кампания на ${sessionData.estimatedSessions} сессий для уровней ${sessionData.recommendedLevel}`,
      },
    });

    // Создаем сцены, если они есть
    let createdScenes = 0;
    console.log('=== Creating Scenes ===');
    console.log('Scenes array:', sessionData.scenes);
    console.log('Is array:', Array.isArray(sessionData.scenes));
    
    if (sessionData.scenes && Array.isArray(sessionData.scenes)) {
      console.log('Processing', sessionData.scenes.length, 'scenes');
      for (const sceneData of sessionData.scenes) {
        try {
          console.log('Creating scene:', sceneData.title);
          await prisma.scene.create({
            data: {
              projectId: project.id,
              title: sceneData.title || 'Без названия',
              description: sceneData.description || '',
              sceneType: sceneData.sceneType || 'story',
              order: sceneData.order || createdScenes + 1,
            },
          });
          createdScenes++;
          console.log('✓ Scene created:', sceneData.title);
        } catch (err) {
          console.error('✗ Error creating scene:', sceneData.title, err);
        }
      }
    } else {
      console.log('⚠️ No scenes array found or not an array');
    }
    console.log('Total scenes created:', createdScenes);

    // Создаем NPC, если они есть
    let createdNpcs = 0;
    console.log('=== Creating NPCs ===');
    console.log('NPCs array:', sessionData.npcs);
    console.log('Is array:', Array.isArray(sessionData.npcs));
    
    if (sessionData.npcs && Array.isArray(sessionData.npcs)) {
      console.log('Processing', sessionData.npcs.length, 'NPCs');
      for (const npcData of sessionData.npcs) {
        try {
          console.log('Creating NPC:', npcData.name);
          await prisma.nPC.create({
            data: {
              projectId: project.id,
              name: npcData.name || 'Безымянный NPC',
              race: npcData.race,
              class: npcData.class,
              level: npcData.level,
              alignment: npcData.alignment,
              personality: npcData.personality || npcData.role,
              backstory: npcData.backstory,
              appearance: npcData.appearance,
              motivations: npcData.motivations,
              stats: npcData.stats ? JSON.stringify(npcData.stats) : null,
            },
          });
          createdNpcs++;
          console.log('✓ NPC created:', npcData.name);
        } catch (err) {
          console.error('✗ Error creating NPC:', npcData.name, err);
        }
      }
    } else {
      console.log('⚠️ No NPCs array found or not an array');
    }
    console.log('Total NPCs created:', createdNpcs);

    // Создаем энкаунтеры из боевых сцен
    let createdEncounters = 0;
    if (sessionData.scenes && Array.isArray(sessionData.scenes)) {
      for (const sceneData of sessionData.scenes) {
        if (sceneData.sceneType === 'combat' && sceneData.monsters && Array.isArray(sceneData.monsters)) {
          try {
            await prisma.encounter.create({
              data: {
                projectId: project.id,
                title: sceneData.title || 'Боевой энкаунтер',
                description: sceneData.description || '',
                encounterType: 'combat',
                difficulty: 'medium',
                monsters: JSON.stringify(sceneData.monsters),
                environment: '',
                tactics: '',
                rewards: null,
                estimatedLevel: parseInt(level?.split('-')[0] || '3'),
              },
            });
            createdEncounters++;
          } catch (err) {
            console.error('Error creating encounter:', err);
          }
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
      'session',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    return NextResponse.json({
      success: true,
      project,
      sessionData,
      tokensUsed: response.totalTokens,
      stats: {
        scenesCreated: createdScenes,
        npcsCreated: createdNpcs,
        encountersCreated: createdEncounters,
      },
    });
  } catch (error: any) {
    console.error('Error generating session:', error);
    
    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'session',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate session' },
      { status: 500 }
    );
  }
}

