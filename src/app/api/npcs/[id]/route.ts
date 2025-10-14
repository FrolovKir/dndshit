import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Обновить NPC
 * PATCH /api/npcs/[id]
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
      name, 
      race, 
      npcClass, 
      level, 
      alignment, 
      personality, 
      backstory, 
      appearance, 
      motivations,
      stats,
      imageUrl 
    } = body;

    const npcExisting = await prisma.nPC.findUnique({ where: { id }, include: { project: true } });
    if (!npcExisting || npcExisting.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const npc = await prisma.nPC.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(race && { race }),
        ...(npcClass && { class: npcClass }),
        ...(level !== undefined && { level }),
        ...(alignment && { alignment }),
        ...(personality !== undefined && { personality }),
        ...(backstory !== undefined && { backstory }),
        ...(appearance !== undefined && { appearance }),
        ...(motivations !== undefined && { motivations }),
        ...(stats && { stats: typeof stats === 'string' ? stats : JSON.stringify(stats) }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json({ npc });
  } catch (error: any) {
    console.error('Error updating NPC:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update NPC' },
      { status: 500 }
    );
  }
}

/**
 * Удалить NPC
 * DELETE /api/npcs/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(request);
    const { id } = params;

    const npcExisting = await prisma.nPC.findUnique({ where: { id }, include: { project: true } });
    if (!npcExisting || npcExisting.project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.nPC.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting NPC:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete NPC' },
      { status: 500 }
    );
  }
}

