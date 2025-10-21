import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - создать персонажа игрока
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const character = await prisma.playerCharacter.create({
      data: body,
    });

    return NextResponse.json({ success: true, character });
  } catch (error) {
    console.error('Error creating player character:', error);
    return NextResponse.json(
      { error: 'Failed to create player character' },
      { status: 500 }
    );
  }
}

