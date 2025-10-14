import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [users, projects] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
    ]);

    return NextResponse.json({ ok: true, users, projects });
  } catch (error: any) {
    console.error('DB health error:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || String(error) },
      { status: 500 }
    );
  }
}


