import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Создать пустую сцену
 * POST /api/scenes
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { projectId, title, description, sceneType } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Проверяем владение проектом
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Получаем текущий порядок сцен
    const scenesCount = await prisma.scene.count({ where: { projectId } });

    const scene = await prisma.scene.create({
      data: {
        projectId,
        title: title || 'Новая сцена',
        description: description || '',
        sceneType: sceneType || 'story',
        order: scenesCount + 1,
      },
    });

    return NextResponse.json({ scene });
  } catch (error: any) {
    console.error('Error creating scene:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create scene' },
      { status: 500 }
    );
  }
}


