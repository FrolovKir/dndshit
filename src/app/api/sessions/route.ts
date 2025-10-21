import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - создать сессию
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, ...data } = body;

    // Получаем номер следующей сессии
    const lastSession = await prisma.session.findFirst({
      where: { projectId },
      orderBy: { sessionNumber: 'desc' },
    });

    const sessionNumber = lastSession ? lastSession.sessionNumber + 1 : 1;

    const session = await prisma.session.create({
      data: {
        ...data,
        projectId,
        sessionNumber,
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

