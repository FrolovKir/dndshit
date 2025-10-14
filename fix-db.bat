@echo off
echo ===================================
echo Исправление базы данных
echo ===================================
echo.

echo Шаг 1: Обновление Prisma Client...
call npx prisma generate
echo.

echo Шаг 2: Применение миграций...
call npx prisma migrate deploy
echo.

echo Готово! Теперь запустите: npm run dev
pause


