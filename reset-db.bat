@echo off
echo ===================================
echo Пересоздание базы данных
echo ===================================

echo.
echo ВНИМАНИЕ: Все данные в базе будут удалены!
echo.
choice /C YN /M "Продолжить"
if errorlevel 2 exit /b

echo.
echo [1/2] Полный сброс базы данных и применение миграций...
call npx prisma migrate reset --force

echo.
echo [2/2] Генерация Prisma Client...
call npx prisma generate

echo.
echo ===================================
echo База данных успешно пересоздана!
echo ===================================
echo.
echo Теперь можно запустить приложение через start.bat
pause

