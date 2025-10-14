import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Обновить сцену
 * PATCH /api/scenes/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = params;
    const body = await request.json();
    const { title, description, sceneType, order } = body;

    const sceneExisting = await prisma.scene.findUnique({ where: { id }, include: { project: true } });
    if (!sceneExisting || sceneExisting.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scene = await prisma.scene.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(sceneType && { sceneType }),
        ...(order !== undefined && { order }),
      },
    });

    return NextResponse.json({ scene });
  } catch (error: any) {
    console.error('Error updating scene:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update scene' },
      { status: 500 }
    );
  }
}

/**
 * Удалить сцену
 * DELETE /api/scenes/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = params;

    const sceneExisting = await prisma.scene.findUnique({ where: { id }, include: { project: true } });
    if (!sceneExisting || sceneExisting.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.scene.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting scene:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete scene' },
      { status: 500 }
    );
  }
}


