import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Создать пустой энкаунтер
 * POST /api/encounters
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { projectId, title, encounterType, difficulty, estimatedLevel } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Проверяем владение проектом
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const encounter = await prisma.encounter.create({
      data: {
        projectId,
        title: title || 'Новый энкаунтер',
        description: '',
        encounterType: encounterType || 'combat',
        difficulty: difficulty || 'medium',
        monsters: null,
        environment: '',
        tactics: '',
        rewards: null,
        estimatedLevel: estimatedLevel || 3,
      },
    });

    return NextResponse.json({ encounter });
  } catch (error: any) {
    console.error('Error creating encounter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create encounter' },
      { status: 500 }
    );
  }
}


