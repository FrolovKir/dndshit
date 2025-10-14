import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Удалить cookies
  response.cookies.delete('session');
  response.cookies.delete('userId');

  return response;
}

