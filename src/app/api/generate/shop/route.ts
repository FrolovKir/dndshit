import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/llm';
import { checkCredits, deductCredits, logRequest } from '@/lib/credits';
import { SYSTEM_PROMPT } from '@/lib/prompts';

const DEMO_USER_ID = process.env.DEMO_USER_ID || 'demo-user-001';

interface ShopGenerationParams {
  shopType: 'general' | 'weapons' | 'armor' | 'magic' | 'alchemy' | 'tavern' | 'blacksmith' | 'temple';
  settlement: 'village' | 'town' | 'city' | 'metropolis';
  wealth: 'poor' | 'modest' | 'comfortable' | 'wealthy' | 'aristocratic';
  specialty?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ShopGenerationParams;
    const { shopType, settlement, wealth, specialty } = body;

    if (!shopType || !settlement || !wealth) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Оценка токенов
    const estimatedTokens = 1500;

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

    // Создание промпта
    const shopPrompt = createShopPrompt(shopType, settlement, wealth, specialty);

    // Генерация
    const response = await generateContent([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: shopPrompt },
    ]);

    // Парсинг результата
    let shopData;
    try {
      shopData = JSON.parse(response.content);
    } catch (parseError) {
      console.error('Failed to parse shop JSON:', response.content);
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        shopData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse generated shop as JSON');
      }
    }

    // Вычитание токенов
    await deductCredits(DEMO_USER_ID, response.usage);

    // Логирование
    await logRequest(
      DEMO_USER_ID,
      'shop_generation',
      response.usage,
      'gpt-4o-mini',
      true
    );

    return NextResponse.json({
      success: true,
      shop: shopData,
      tokensUsed: response.usage.totalTokens,
      creditsRemaining: creditCheck.remaining - response.usage.totalTokens,
    });
  } catch (error) {
    console.error('Shop generation error:', error);

    // Логирование ошибки
    try {
      await logRequest(
        DEMO_USER_ID,
        'shop_generation',
        { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        'gpt-4o-mini',
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      {
        error: 'Shop generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function createShopPrompt(
  shopType: string,
  settlement: string,
  wealth: string,
  specialty?: string
): string {
  const shopTypeLabels = {
    general: 'общий магазин (продукты, инструменты, базовое снаряжение)',
    weapons: 'оружейная лавка',
    armor: 'магазин доспехов и защитного снаряжения',
    magic: 'магазин магических предметов и компонентов',
    alchemy: 'алхимическая лавка (зелья, реагенты)',
    tavern: 'таверна (еда, напитки, комнаты)',
    blacksmith: 'кузница (изготовление и ремонт)',
    temple: 'храм (религиозные услуги, благословения)',
  };

  const settlementLabels = {
    village: 'деревне (население 50-300)',
    town: 'городке (население 300-3000)', 
    city: 'городе (население 3000-25000)',
    metropolis: 'мегаполисе (население 25000+)',
  };

  const wealthLabels = {
    poor: 'бедный район (скудный ассортимент, низкие цены)',
    modest: 'скромный район (базовый ассортимент, средние цены)',
    comfortable: 'комфортный район (хороший ассортимент, справедливые цены)',
    wealthy: 'богатый район (качественные товары, высокие цены)',
    aristocratic: 'аристократический район (эксклюзивные товары, очень высокие цены)',
  };

  return `Создай детальный магазин для D&D 5e со следующими параметрами:

**Тип магазина:** ${shopTypeLabels[shopType as keyof typeof shopTypeLabels]}
**Локация:** ${settlementLabels[settlement as keyof typeof settlementLabels]}
**Уровень богатства:** ${wealthLabels[wealth as keyof typeof wealthLabels]}
${specialty ? `**Специализация:** ${specialty}` : ''}

Верни результат в JSON формате:

\`\`\`json
{
  "name": "Название магазина",
  "type": "Тип заведения",
  "owner": {
    "name": "Имя владельца",
    "race": "Раса",
    "personality": "Краткое описание характера",
    "quirk": "Интересная причуда или особенность"
  },
  "description": "Общее описание магазина (2-3 предложения)",
  "atmosphere": "Описание атмосферы и внешнего вида",
  "specialties": ["список", "специализаций", "магазина"],
  "items": [
    {
      "name": "Название предмета",
      "price": "Цена в золоте",
      "rarity": "common/uncommon/rare/very_rare/legendary",
      "description": "Краткое описание предмета",
      "quantity": число_в_наличии
    }
  ],
  "services": ["список", "дополнительных", "услуг"],
  "rumors": ["слух1", "слух2", "слух3"],
  "hooks": ["зацепка1", "зацепка2"]
}
\`\`\`

**Требования:**
- Создай 8-15 товаров подходящих для типа магазина
- Цены должны соответствовать D&D 5e и уровню богатства
- Включи смесь обычных и интересных предметов
- Владелец должен быть запоминающимся с яркой личностью
- Добавь 2-3 слуха, которые владелец может рассказать
- Включи 2-3 зацепки для приключений связанных с магазином
- Услуги должны соответствовать типу заведения
- Учитывай размер поселения при создании ассортимента

Создавай контент на русском языке в стиле фэнтези D&D.`;
}