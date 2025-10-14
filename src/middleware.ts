import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пути, которые не требуют авторизации
  const publicPaths = ['/login', '/api/auth/login'];

  // Проверяем, является ли путь публичным
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Если путь публичный, пропускаем
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Проверяем наличие userId в cookies
  const userId = request.cookies.get('userId')?.value;

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!userId) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Пользователь авторизован, пропускаем
  return NextResponse.next();
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

