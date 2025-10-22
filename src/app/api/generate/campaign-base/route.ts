import { NextRequest, NextResponse } from 'next/server';
import { llm } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest, estimateTokens } from '@/lib/credits';
import { prisma } from '@/lib/prisma';
import { CAMPAIGN_FOUNDATION_PROMPT, SYSTEM_PROMPT } from '@/lib/prompts';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * ШАГ 1: Генерация базового описания кампании
 * POST /api/generate/campaign-base
 */
export async function POST(request: NextRequest) {
  let userId = '';

  try {
    userId = getUserIdFromRequest(request);
    const body = await request.json();
    const {
      overview,
      tone,
      atmospheric,
      setting,
      conflictScale,
      levelRange,
      playerCount,
      playstyle,
      sessionLength,
      experience,
      constraints,
    } = body;

    console.log('=== STEP 1: Generating Campaign Base ===');

    // Создаем промпт
    const userPrompt = CAMPAIGN_FOUNDATION_PROMPT({
      overview,
      tone,
      atmospheric,
      setting,
      conflictScale,
      levelRange,
      playerCount,
      playstyle,
      sessionLength,
      experience,
      constraints,
    });
    const estimatedInputTokens = estimateTokens(SYSTEM_PROMPT + userPrompt);

    // Проверяем лимит токенов (базовое описание ~2000 токенов)
    const creditCheck = await checkCredits(userId, estimatedInputTokens + 2000);

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
      maxTokens: 2048, // Базовое описание не требует много токенов
    });

    console.log('=== LLM Response ===');
    console.log('Tokens used:', response.totalTokens);

    // Парсим JSON ответ
    let campaignData;
    try {
      let jsonContent = response.content.trim();

      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      campaignData = JSON.parse(jsonContent);

      console.log('Parsed campaign:', campaignData.title);

    } catch (e) {
      console.error('JSON Parse Error:', e);

      return NextResponse.json(
        { error: 'Failed to parse LLM response', details: response.content.substring(0, 500) },
        { status: 500 }
      );
    }

    // Создаем проект в БД (сохраняем новый формат как основу кампании)
    const project = await prisma.project.create({
      data: {
        userId,
        title: campaignData.title,
        synopsis: campaignData.setting_overview,
        setting: campaignData.world_tone,
        description: JSON.stringify({
          coreThemeImage: campaignData.core_theme_image,
          mainConflict: campaignData.main_conflict,
          factionsBackground: campaignData.factions_background,
          worldProgression: campaignData.world_progression,
          atmosphericReferences: campaignData.atmospheric_references,
          generatorInput: {
            overview,
            tone,
            atmospheric,
            setting,
            conflictScale,
            levelRange,
            playerCount,
            playstyle,
            sessionLength,
            experience,
            constraints,
          },
        }),
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
      'campaign-base',
      {
        promptTokens: response.promptTokens,
        completionTokens: response.completionTokens,
        totalTokens: response.totalTokens,
      },
      response.model
    );

    console.log('✅ Campaign base created:', project.id);

    return NextResponse.json({
      success: true,
      project,
      campaignData,
      tokensUsed: response.totalTokens,
    });
  } catch (error: any) {
    console.error('Error generating campaign base:', error);

    // Логируем ошибку, если userId был получен
    if (userId) {
      await logRequest(
        userId,
        'campaign-base',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error.message
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate campaign base' },
      { status: 500 }
    );
  }
}

