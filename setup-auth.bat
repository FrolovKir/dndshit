@echo off
echo ============================================
echo   Настройка системы авторизации
echo ============================================
echo.

echo [1/3] Применение миграции базы данных...
call npx prisma db push
if errorlevel 1 (
    echo ОШИБКА: Не удалось применить миграцию
    pause
    exit /b 1
)
echo.

echo [2/3] Генерация Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ОШИБКА: Не удалось сгенерировать Prisma Client
    pause
    exit /b 1
)
echo.

echo [3/3] Заполнение базы данных (создание пользователей)...
call npm run db:seed
if errorlevel 1 (
    echo ОШИБКА: Не удалось заполнить базу данных
    pause
    exit /b 1
)
echo.

echo ============================================
echo   Настройка завершена успешно!
echo ============================================
echo.
echo Создан пользователь администратора:
echo   Логин: admin
echo   Пароль: admpass123
echo.
echo Создан демо-пользователь:
echo   Логин: demo
echo   Пароль: demo
echo.
echo Теперь вы можете запустить приложение:
echo   npm run dev
echo.
pause

