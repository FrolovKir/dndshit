import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Обновить энкаунтер
 * PATCH /api/encounters/[id]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = params;
    const body = await request.json();
    const { 
      title, 
      description, 
      encounterType, 
      difficulty, 
      monsters, 
      environment, 
      tactics, 
      rewards, 
      estimatedLevel 
    } = body;

    const existing = await prisma.encounter.findUnique({ where: { id }, include: { project: true } });
    if (!existing || existing.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const encounter = await prisma.encounter.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(encounterType && { encounterType }),
        ...(difficulty && { difficulty }),
        ...(monsters && { monsters: typeof monsters === 'string' ? monsters : JSON.stringify(monsters) }),
        ...(environment !== undefined && { environment }),
        ...(tactics !== undefined && { tactics }),
        ...(rewards && { rewards: typeof rewards === 'string' ? rewards : JSON.stringify(rewards) }),
        ...(estimatedLevel !== undefined && { estimatedLevel }),
      },
    });

    return NextResponse.json({ encounter });
  } catch (error: any) {
    console.error('Error updating encounter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update encounter' },
      { status: 500 }
    );
  }
}

/**
 * Удалить энкаунтер
 * DELETE /api/encounters/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = params;

    const existing = await prisma.encounter.findUnique({ where: { id }, include: { project: true } });
    if (!existing || existing.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.encounter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting encounter:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete encounter' },
      { status: 500 }
    );
  }
}


