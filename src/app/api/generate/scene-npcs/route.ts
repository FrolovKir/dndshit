import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { SCENE_NPCS_V2_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * ШАГ 3: Генерация 2-3 NPC для конкретной сцены
 * POST /api/generate/scene-npcs
 */
export async function POST(request: NextRequest) {
  let userId = '';
  
  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { sceneId } = body;

    console.log('=== STEP 3: Generating Scene NPCs ===');
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

    // Готовим минимальный JSON сцены для генерации NPC
    const sceneJson = JSON.stringify({
      id: scene.id,
      title: scene.title,
      type: scene.sceneType,
      description: scene.description.replace(/<!-- METADATA: .+? -->/, '').trim(),
      meta: sceneMetadata,
      project: { title: scene.project.title },
    }, null, 2);

    // Извлекаем диапазон уровней из проекта
    const levelRange = projectDetails.levelRange || projectDetails.level || '1-5';

    // Создаем промпт V2
    const userPrompt = SCENE_NPCS_V2_PROMPT({ sceneJson, levelRange });

    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов (2-3 NPC ~3000 токенов)
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 3000);
    
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
      maxTokens: 4096,
    });

    console.log('=== LLM Response ===');
    console.log('Tokens used:', response.totalTokens);

    // Парсим JSON ответ
    let npcsData;
    try {
      let jsonContent = response.content.trim();
      
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      npcsData = JSON.parse(jsonContent);
      
      console.log('Parsed NPCs count:', npcsData.npcs?.length || 0);
      
    } catch (e) {
      console.error('JSON Parse Error:', e);
      
      return NextResponse.json(
        { error: 'Failed to parse LLM response', details: response.content.substring(0, 500) },
        { status: 500 }
      );
    }

    // Создаем NPC в БД
    let createdNpcs = 0;
    const createdNpcIds: string[] = [];

    if (npcsData.npcs && Array.isArray(npcsData.npcs)) {
      for (const npcData of npcsData.npcs) {
        try {
          const npc = await prisma.nPC.create({
            data: {
              projectId: scene.projectId,
              name: npcData.name || 'Безымянный NPC',
              race: npcData.race || undefined,
              class: npcData.class || undefined,
              level: npcData.level || undefined,
              alignment: npcData.alignment || undefined,
              personality: npcData.personality || undefined,
              backstory: npcData.backstory || undefined,
              appearance: npcData.appearance || undefined,
              motivations: npcData.motivations || undefined,
              stats: npcData.stats ? JSON.stringify(npcData.stats) : undefined,
              roleInScene: npcData.role_in_scene || undefined,
              hiddenAgenda: npcData.hidden_agenda || undefined,
              interactionOptions: npcData.interaction_options ? JSON.stringify(npcData.interaction_options) : undefined,
            },
          });
          
          createdNpcs++;
          createdNpcIds.push(npc.id);
          console.log('✓ NPC created:', npcData.name);

        } catch (err) {
          console.error('Error creating NPC:', err);
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
      'scene-npcs',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    console.log(`✅ Created ${createdNpcs} NPCs for scene ${scene.id}`);

    return NextResponse.json({
      success: true,
      npcsCreated: createdNpcs,
      npcIds: createdNpcIds,
      npcsData,
      tokensUsed: response.totalTokens,
    });
  } catch (error: any) {
    console.error('Error generating scene NPCs:', error);
    
    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'scene-npcs',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate scene NPCs' },
      { status: 500 }
    );
  }
}

