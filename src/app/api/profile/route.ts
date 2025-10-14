import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUsageStats } from '@/lib/credits';
import { getUserIdFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Получить профиль пользователя с информацией о токенах
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        creditBudget: true,
        _count: {
          select: {
            projects: true,
            requestLogs: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Получаем статистику использования
    const stats = await getUsageStats(userId, 30);
    // Убираем возможный дублирующийся ключ totalRequests из spread
    const { totalRequests: _ignoredTotalRequests, ...restStats } = (stats || {}) as any;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      budget: user.creditBudget,
      stats: {
        totalProjects: user._count.projects,
        totalRequests: user._count.requestLogs,
        ...restStats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

