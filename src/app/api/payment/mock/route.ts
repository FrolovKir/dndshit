import { NextRequest, NextResponse } from 'next/server';
import { updateTier, TIERS, TierName } from '@/lib/credits';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Mock платежная система (эмуляция YooKassa/CloudPayments)
 */
export async function POST(request: NextRequest) {
  try {
    const currentUserId = getUserIdFromRequest(request);
    const body = await request.json();
    const { tier } = body;
    
    const demoUserId = currentUserId;

    if (!tier || !TIERS[tier as TierName]) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      );
    }

    const tierConfig = TIERS[tier as TierName];

    // Эмулируем успешную оплату (в продакшене здесь будет интеграция с платежкой)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Обновляем тариф пользователя
    await updateTier(demoUserId, tier as TierName);

    return NextResponse.json({
      success: true,
      message: 'Оплата прошла успешно!',
      tier,
      tokens: tierConfig.tokens,
      price: tierConfig.price,
      transactionId: `mock-txn-${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment failed' },
      { status: 500 }
    );
  }
}

/**
 * Получение информации о тарифах
 */
export async function GET() {
  return NextResponse.json({
    tiers: TIERS,
  });
}

