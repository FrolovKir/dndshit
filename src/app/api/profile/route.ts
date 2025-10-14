import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUsageStats } from '@/lib/credits';
import { getUserIdFromRequest } from '@/lib/auth';

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
        // totalRequests отчитываем из user._count, а в stats оставим другие поля
        totalRequests: user._count.requestLogs,
        ...(stats ? Object.fromEntries(Object.entries(stats).filter(([k]) => k !== 'totalRequests')) : {}),
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

