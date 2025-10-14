import { createHash } from 'crypto';
import { NextRequest } from 'next/server';

/**
 * Хеширование пароля с использованием SHA-256
 */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

/**
 * Проверка пароля
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Генерация токена сессии
 */
export function generateSessionToken(): string {
  return createHash('sha256')
    .update(`${Date.now()}-${Math.random()}`)
    .digest('hex');
}

/**
 * Получить userId из cookies запроса
 * @throws {Error} если пользователь не авторизован
 */
export function getUserIdFromRequest(request: NextRequest): string {
  const userId = request.cookies.get('userId')?.value;
  
  if (!userId) {
    throw new Error('Пользователь не авторизован');
  }
  
  return userId;
}

