import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

/**
 * Создать пустого NPC
 * POST /api/npcs
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { projectId, name, race, npcClass, level, alignment, sceneId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Если указана сцена, подтянем название для метки
    let sceneLabel = '';
    if (sceneId) {
      try {
        const scene = await prisma.scene.findUnique({ where: { id: sceneId } });
        if (scene) {
          sceneLabel = `\nПривязка: сцена "${scene.title}"`;
        }
      } catch {}
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const npc = await prisma.nPC.create({
      data: {
        projectId,
        name: name || 'Новый NPC',
        race: race || 'Human',
        class: npcClass || 'Commoner',
        level: level || 1,
        alignment: alignment || 'Neutral',
        personality: sceneLabel,
        backstory: '',
        appearance: '',
        motivations: '',
        stats: null,
      },
    });

    return NextResponse.json({ npc });
  } catch (error: any) {
    console.error('Error creating NPC:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create NPC' },
      { status: 500 }
    );
  }
}


