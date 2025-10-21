import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest } from '@/lib/credits';
import {
  QUICK_NAME_PROMPT,
  QUICK_NPC_PROMPT,
  QUICK_EVENT_PROMPT,
  QUICK_LOOT_PROMPT,
  QUICK_LOCATION_PROMPT,
  QUICK_COMPLICATION_PROMPT,
  QUICK_TWIST_PROMPT,
  QUICK_DIALOGUE_PROMPT,
  SYSTEM_PROMPT,
} from '@/lib/prompts';

const DEMO_USER_ID = 'demo-user-001';

// Типы быстрой генерации
type QuickGenerationType =
  | 'name'
  | 'npc'
  | 'event'
  | 'loot'
  | 'location'
  | 'complication'
  | 'twist'
  | 'dialogue';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, params } = body as {
      type: QuickGenerationType;
      params: Record<string, any>;
    };

    if (!type) {
      return NextResponse.json({ error: 'Missing generation type' }, { status: 400 });
    }

    // Оценка токенов (быстрая генерация — мало токенов)
    const estimatedTokens = 500; // Быстрая генерация обычно 300-700 токенов

    // Проверка кредитов
    const creditCheck = await checkCredits(DEMO_USER_ID, estimatedTokens);
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

    // Выбор промпта в зависимости от типа
    let prompt = '';
    switch (type) {
      case 'name':
        prompt = QUICK_NAME_PROMPT(params);
        break;
      case 'npc':
        prompt = QUICK_NPC_PROMPT(params);
        break;
      case 'event':
        prompt = QUICK_EVENT_PROMPT(params);
        break;
      case 'loot':
        prompt = QUICK_LOOT_PROMPT(params);
        break;
      case 'location':
        prompt = QUICK_LOCATION_PROMPT(params);
        break;
      case 'complication':
        prompt = QUICK_COMPLICATION_PROMPT(params);
        break;
      case 'twist':
        prompt = QUICK_TWIST_PROMPT(params);
        break;
      case 'dialogue':
        prompt = QUICK_DIALOGUE_PROMPT(params);
        break;
      default:
        return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
    }

    // Генерация контента
    const response = await generateContent([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ]);

    // Парсинг JSON
    let generatedData: any;
    try {
      generatedData = JSON.parse(response.content);
    } catch (parseError) {
      console.error('Failed to parse JSON:', response.content);
      // Попытка извлечь JSON из текста
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse generated content as JSON');
      }
    }

    // Вычитание токенов
    await deductCredits(DEMO_USER_ID, response.usage);

    // Логирование
    await logRequest(DEMO_USER_ID, `quick_${type}`, response.usage, response.model, true);

    return NextResponse.json({
      success: true,
      type,
      data: generatedData,
      tokensUsed: response.usage.totalTokens,
      creditsRemaining: creditCheck.remaining - response.usage.totalTokens,
    });
  } catch (error) {
    console.error('Quick generation error:', error);
    
    // Попытка залогировать ошибку
    try {
      await logRequest(
        DEMO_USER_ID,
        'quick_generation',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'unknown',
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

