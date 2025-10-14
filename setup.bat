@echo off
echo ===================================
echo DnD GenLab Assistant - Setup
echo ===================================
echo.

echo [1/4] Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo Ошибка при установке зависимостей!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Генерация Prisma Client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo Ошибка при генерации Prisma Client!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Применение схемы базы данных...
call npm run db:push
if %errorlevel% neq 0 (
    echo Ошибка при применении схемы БД!
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Заполнение базы тестовыми данными...
call npm run db:seed
if %errorlevel% neq 0 (
    echo Ошибка при заполнении БД!
    pause
    exit /b %errorlevel%
)

echo.
echo ===================================
echo ✓ Установка завершена успешно!
echo ===================================
echo.
echo Для запуска приложения выполните:
echo   npm run dev
echo.
echo Или используйте start.bat
echo.
pause

