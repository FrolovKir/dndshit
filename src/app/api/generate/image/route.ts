import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest } from '@/lib/credits';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  IMAGE_CHARACTER_PROMPT,
  IMAGE_LOCATION_PROMPT,
  IMAGE_ITEM_PROMPT,
  IMAGE_SCENE_PROMPT,
  SYSTEM_PROMPT,
} from '@/lib/prompts';

type ImageType = 'character' | 'location' | 'item' | 'scene';

interface ImageGenerationParams {
  type: ImageType;
  description: string;
  // Параметры для персонажа
  race?: string;
  characterClass?: string;
  age?: string;
  mood?: string;
  // Параметры для локации
  locationType?: string;
  timeOfDay?: 'dawn' | 'day' | 'sunset' | 'night';
  weather?: 'clear' | 'fog' | 'rain' | 'snow' | 'storm';
  // Параметры для предмета
  itemType?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  magicalEffect?: string;
  // Параметры для сцены
  scale?: 'duel' | 'skirmish' | 'battle' | 'war';
  environment?: string;
  // Общие параметры
  style?: string;
  atmosphere?: string;
}

export async function POST(request: NextRequest) {
  let userId: string | undefined;
  try {
    userId = getUserIdFromRequest(request);

    const body = (await request.json()) as ImageGenerationParams;
    const { type, description, ...params } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Missing type or description' },
        { status: 400 }
      );
    }

    // Проверка наличия OpenAI API ключа
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        {
          error: 'GPT-4o image generation requires OpenAI API key',
          message: 'Установите OPENAI_API_KEY в .env файле для генерации изображений',
        },
        { status: 503 }
      );
    }

    // Оценка токенов (промпт генерация + GPT-4o image generation)
    const estimatedTokens = type === 'location' || type === 'scene' ? 2000 : 1000;

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

    // Шаг 1: Генерация качественного промпта через LLM
    let promptGenerationText = '';
    switch (type) {
      case 'character':
        promptGenerationText = IMAGE_CHARACTER_PROMPT({
          description,
          race: params.race,
          characterClass: params.characterClass,
          age: params.age,
          style: params.style as any,
          mood: params.mood,
        });
        break;
      case 'location':
        promptGenerationText = IMAGE_LOCATION_PROMPT({
          description,
          locationType: params.locationType,
          timeOfDay: params.timeOfDay,
          weather: params.weather,
          style: params.style as any,
          atmosphere: params.atmosphere,
        });
        break;
      case 'item':
        promptGenerationText = IMAGE_ITEM_PROMPT({
          description,
          itemType: params.itemType,
          rarity: params.rarity,
          style: params.style as any,
          magicalEffect: params.magicalEffect,
        });
        break;
      case 'scene':
        promptGenerationText = IMAGE_SCENE_PROMPT({
          description,
          scale: params.scale,
          environment: params.environment,
          style: params.style as any,
        });
        break;
    }

    const promptResponse = await generateContent([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: promptGenerationText },
    ]);

    // Парсинг промпта
    let promptData: { prompt: string; size: string; style: string };
    try {
      promptData = JSON.parse(promptResponse.content);
    } catch (parseError) {
      console.error('Failed to parse prompt JSON:', promptResponse.content);
      const jsonMatch = promptResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        promptData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse generated prompt as JSON');
      }
    }

    console.log('=== Generated Image Prompt ===');
    console.log(promptData.prompt);
    console.log('Size:', promptData.size);

    // Шаг 2: Генерация изображения через GPT-4o
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        prompt: promptData.prompt,
        n: 1,
        size: promptData.size,
        quality: 'standard',
        style: promptData.style === 'realistic' ? 'natural' : 'vivid',
      }),
    });

    if (!imageResponse.ok) {
      const error = await imageResponse.json();
      console.error('Image generation API error:', error);
      throw new Error(`Image generation API error: ${error.error?.message || 'Unknown error'}`);
    }

    const imageData = await imageResponse.json();
    const temporaryImageUrl = imageData.data[0].url;
    const revisedPrompt = imageData.data[0].revised_prompt;

    console.log('=== Image Generation Response ===');
    console.log('Temporary Image URL:', temporaryImageUrl);
    console.log('Revised prompt:', revisedPrompt);

    // Скачиваем изображение и конвертируем в data URL для постоянного хранения
    const downloadResponse = await fetch(temporaryImageUrl);
    if (!downloadResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBuffer = await downloadResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log('Image converted to data URL for permanent storage');

    // Вычитание токенов (промпт генерация + условная стоимость GPT-4o image generation)
    const totalTokens = promptResponse.usage.totalTokens + estimatedTokens;
    await deductCredits(userId, {
      promptTokens: promptResponse.usage.promptTokens,
      completionTokens: promptResponse.usage.completionTokens + estimatedTokens,
      totalTokens,
    });

    // Логирование
    await logRequest(
      userId,
      `image_${type}`,
      {
        promptTokens: promptResponse.usage.promptTokens,
        completionTokens: promptResponse.usage.completionTokens + estimatedTokens,
        totalTokens,
      },
      'gpt-4o',
      true
    );

    return NextResponse.json({
      success: true,
      imageUrl,
      originalPrompt: promptData.prompt,
      revisedPrompt,
      type,
      size: promptData.size,
      tokensUsed: totalTokens,
      creditsRemaining: creditCheck.remaining - totalTokens,
    });
  } catch (error) {
    console.error('Image generation error:', error);

    // Попытка залогировать ошибку
    if (userId) {
      try {
        await logRequest(
          userId,
          'image_generation',
          { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          'gpt-4o',
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
    }

    return NextResponse.json(
      {
        error: 'Image generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

