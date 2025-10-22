import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest } from '@/lib/credits';
import { QUEST_GENERATOR_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

interface QuestGenerationRequest {
  projectId: string;
  questType: 'rescue' | 'investigation' | 'escort' | 'heist' | 'defense' | 'delivery' | 'assassination' | 'diplomatic';
  difficulty: 'easy' | 'medium' | 'hard';
  context?: string;
  partyLevel?: number;
}

export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = (await request.json()) as QuestGenerationRequest;
    const { projectId, questType, difficulty, context, partyLevel } = body;

    if (!projectId || !questType || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, questType, difficulty' },
        { status: 400 }
      );
    }

    // Загружаем проект с контекстом
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        npcs: {
          select: {
            id: true,
            name: true,
            race: true,
            class: true,
            roleInScene: true,
          },
        },
        scenes: {
          select: {
            id: true,
            title: true,
            sceneType: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Оценка токенов
    const estimatedTokens = 2000;

    // Проверка кредитов
    const creditCheck = await checkCredits(userId, estimatedTokens);
    if (!creditCheck.allowed) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: creditCheck.message,
          creditsRemaining: creditCheck.remaining,
        },
        { status: 402 }
      );
    }

    // Подготовка данных для промпта
    const availableNPCs = project.npcs.map((npc) => ({
      name: npc.name,
      role: npc.roleInScene || `${npc.race} ${npc.class}`.trim() || 'NPC',
    }));

    const availableLocations = project.scenes.map((scene) => scene.title);

    // Генерация квеста
    const promptText = QUEST_GENERATOR_PROMPT({
      projectTitle: project.title,
      projectSynopsis: project.synopsis || project.description || '',
      setting: project.setting || 'Forgotten Realms',
      questType,
      difficulty,
      partyLevel,
      availableNPCs: availableNPCs.length > 0 ? availableNPCs : undefined,
      availableLocations: availableLocations.length > 0 ? availableLocations : undefined,
      context,
    });

    console.log('=== Generating Quest ===');
    console.log('Project:', project.title);
    console.log('Type:', questType);
    console.log('Difficulty:', difficulty);

    const response = await generateContent([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: promptText },
    ]);

    // Парсинг JSON
    let questData: any;
    try {
      questData = JSON.parse(response.content);
    } catch (parseError) {
      console.error('Failed to parse JSON:', response.content);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse generated quest as JSON');
      }
    }

    // Находим ID NPC-квестодателя (если он существует в базе)
    let questGiverId: string | null = null;
    if (questData.questGiver?.name) {
      const foundNPC = project.npcs.find(
        (npc) => npc.name.toLowerCase() === questData.questGiver.name.toLowerCase()
      );
      if (foundNPC) {
        questGiverId = foundNPC.id;
      }
    }

    // Связываем с существующими сценами (если упомянуты в описании)
    const relatedSceneIds: string[] = [];
    if (availableLocations.length > 0) {
      project.scenes.forEach((scene) => {
        const descriptionLower = questData.description.toLowerCase();
        if (descriptionLower.includes(scene.title.toLowerCase())) {
          relatedSceneIds.push(scene.id);
        }
      });
    }

    // Сохраняем квест в БД
    const quest = await prisma.quest.create({
      data: {
        projectId,
        title: questData.title,
        questType,
        description: questData.description,
        questGiverId,
        questGiverName: questData.questGiver?.name,
        objective: questData.objective,
        obstacles: JSON.stringify(questData.obstacles),
        rewards: JSON.stringify(questData.rewards),
        complications: JSON.stringify(questData.complications),
        consequences: JSON.stringify(questData.consequences),
        twist: questData.twist,
        difficulty,
        estimatedSessions: questData.estimated_sessions || 1,
        relatedScenes: relatedSceneIds.length > 0 ? JSON.stringify(relatedSceneIds) : null,
      },
    });

    console.log('=== Quest Created ===');
    console.log('ID:', quest.id);
    console.log('Title:', quest.title);

    // Вычитание токенов
    await deductCredits(userId, response.usage);

    // Логирование
    await logRequest(userId, 'quest_generation', response.usage, response.model, true);

    return NextResponse.json({
      success: true,
      quest,
      questData, // Полные данные от AI
      tokensUsed: response.usage.totalTokens,
      creditsRemaining: creditCheck.remaining - response.usage.totalTokens,
    });
  } catch (error) {
    console.error('Quest generation error:', error);

    // Логируем ошибку, если userId был получен
    if (userId) {
      try {
        await logRequest(
          userId,
          'quest_generation',
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
        error: 'Quest generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

