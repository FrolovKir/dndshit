/**
 * Система управления токенами и лимитами
 */

import { prisma } from './prisma';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CreditCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  tier: string;
  message?: string;
}

/**
 * Тарифные планы
 */
export const TIERS = {
  lite: {
    name: 'Lite',
    tokens: 50000,
    price: 0,
    features: ['Базовая генерация', 'До 10 проектов', 'Экспорт в Markdown'],
  },
  pro: {
    name: 'Pro',
    tokens: 500000,
    price: 990,
    features: [
      'Расширенная генерация',
      'Неограниченные проекты',
      'Экспорт в PDF/JSON',
      'Приоритетная поддержка',
    ],
  },
  studio: {
    name: 'Studio',
    tokens: 2000000,
    price: 2990,
    features: [
      'Максимальная генерация',
      'Все возможности Pro',
      'API доступ',
      'Командная работа',
      'Персональный менеджер',
    ],
  },
} as const;

export type TierName = keyof typeof TIERS;

/**
 * Проверяет, достаточно ли токенов у пользователя
 */
export async function checkCredits(
  userId: string,
  estimatedTokens: number
): Promise<CreditCheck> {
  const budget = await prisma.creditBudget.findUnique({
    where: { userId },
  });

  if (!budget) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      tier: 'none',
      message: 'Бюджет токенов не найден',
    };
  }

  const remaining = budget.totalTokens - budget.usedTokens;
  const allowed = remaining >= estimatedTokens;

  return {
    allowed,
    remaining,
    limit: budget.totalTokens,
    tier: budget.tier,
    message: allowed ? undefined : 'Недостаточно токенов. Обновите тариф.',
  };
}

/**
 * Вычитает использованные токены из бюджета
 */
export async function deductCredits(
  userId: string,
  usage: TokenUsage
): Promise<void> {
  await prisma.creditBudget.update({
    where: { userId },
    data: {
      usedTokens: {
        increment: usage.totalTokens,
      },
    },
  });
}

/**
 * Логирует запрос к LLM
 */
export async function logRequest(
  userId: string,
  requestType: string,
  usage: TokenUsage,
  model: string,
  success: boolean = true,
  errorMessage?: string
): Promise<void> {
  await prisma.requestLog.create({
    data: {
      userId,
      requestType,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      model,
      success,
      errorMessage,
    },
  });
}

/**
 * Оценивает примерное количество токенов (грубая оценка: 1 токен ≈ 4 символа)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Получает статистику использования токенов за период
 */
export async function getUsageStats(userId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.requestLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
  const byType = logs.reduce((acc, log) => {
    acc[log.requestType] = (acc[log.requestType] || 0) + log.totalTokens;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalRequests: logs.length,
    totalTokens,
    byType,
    successRate: logs.filter((l) => l.success).length / logs.length,
  };
}

/**
 * Сбрасывает бюджет токенов (обычно раз в месяц)
 */
export async function resetBudget(userId: string): Promise<void> {
  const budget = await prisma.creditBudget.findUnique({
    where: { userId },
  });

  if (!budget) {
    throw new Error('Budget not found');
  }

  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);

  await prisma.creditBudget.update({
    where: { userId },
    data: {
      usedTokens: 0,
      resetAt: nextReset,
    },
  });
}

/**
 * Обновляет тариф пользователя
 */
export async function updateTier(userId: string, tier: TierName): Promise<void> {
  const tierConfig = TIERS[tier];
  
  await prisma.creditBudget.update({
    where: { userId },
    data: {
      tier,
      totalTokens: tierConfig.tokens,
      usedTokens: 0,
    },
  });
}

