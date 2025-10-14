#!/bin/bash

echo "==================================="
echo "DnD GenLab Assistant - Setup"
echo "==================================="
echo ""

echo "[1/4] Установка зависимостей..."
npm install
if [ $? -ne 0 ]; then
    echo "Ошибка при установке зависимостей!"
    exit 1
fi

echo ""
echo "[2/4] Генерация Prisma Client..."
npm run db:generate
if [ $? -ne 0 ]; then
    echo "Ошибка при генерации Prisma Client!"
    exit 1
fi

echo ""
echo "[3/4] Применение схемы базы данных..."
npm run db:push
if [ $? -ne 0 ]; then
    echo "Ошибка при применении схемы БД!"
    exit 1
fi

echo ""
echo "[4/4] Заполнение базы тестовыми данными..."
npm run db:seed
if [ $? -ne 0 ]; then
    echo "Ошибка при заполнении БД!"
    exit 1
fi

echo ""
echo "==================================="
echo "✓ Установка завершена успешно!"
echo "==================================="
echo ""
echo "Для запуска приложения выполните:"
echo "  npm run dev"
echo ""
echo "Или используйте ./start.sh"
echo ""

