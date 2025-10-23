import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/llm';
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
  try {
    const body = (await request.json()) as ImageGenerationParams;
    const { type, description, ...params } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: 'Missing type or description' },
        { status: 400 }
      );
    }

    // Проверка наличия OpenAI API ключа (DALL-E доступен только через OpenAI)
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        {
          error: 'DALL-E 3 requires OpenAI API key',
          message: 'Установите OPENAI_API_KEY в .env файле для генерации изображений',
        },
        { status: 503 }
      );
    }

    // Оценка токенов (промпт генерация + DALL-E стоит дороже)
    // DALL-E 3: 1024x1024 = ~$0.040, 1792x1024 = ~$0.080
    const estimatedTokens = type === 'location' || type === 'scene' ? 2000 : 1000;

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

    console.log('=== Generated DALL-E Prompt ===');
    console.log(promptData.prompt);
    console.log('Size:', promptData.size);

    // Шаг 2: Генерация изображения через DALL-E 3
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: promptData.prompt,
        n: 1,
        size: promptData.size,
        quality: 'standard', // или 'hd' для лучшего качества (дороже)
        style: promptData.style === 'realistic' ? 'natural' : 'vivid',
      }),
    });

    if (!dalleResponse.ok) {
      const error = await dalleResponse.json();
      console.error('DALL-E API error:', error);
      throw new Error(`DALL-E API error: ${error.error?.message || 'Unknown error'}`);
    }

    const dalleData = await dalleResponse.json();
    const temporaryImageUrl = dalleData.data[0].url;
    const revisedPrompt = dalleData.data[0].revised_prompt; // DALL-E может изменить промпт

    console.log('=== DALL-E Response ===');
    console.log('Temporary Image URL:', temporaryImageUrl);
    console.log('Revised prompt:', revisedPrompt);

    // Скачиваем изображение и конвертируем в data URL для постоянного хранения
    const imageResponse = await fetch(temporaryImageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    console.log('Image converted to data URL for permanent storage');

    return NextResponse.json({
      success: true,
      imageUrl,
      originalPrompt: promptData.prompt,
      revisedPrompt,
      type,
      size: promptData.size,
    });
  } catch (error) {
    console.error('Image generation error:', error);

    return NextResponse.json(
      {
        error: 'Image generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

