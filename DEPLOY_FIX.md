# Исправление ошибки на деплое

## Проблема

При открытии проекта на production возникает ошибка:
```
The column `NPC.roleInScene` does not exist in the current database.
```

Это происходит потому, что миграции не были применены к production базе данных.

## Решение

### Автоматическое исправление (для будущих деплоев)

Я обновил конфигурацию, теперь миграции будут применяться автоматически при каждом деплое:

1. **package.json**: Команда `build` теперь включает применение миграций
2. **vercel.json**: Добавлена конфигурация для Vercel с правильными настройками Prisma

### Ручное применение миграций на production (текущий деплой)

Если у вас есть доступ к production базе данных, выполните:

#### Вариант 1: Через Vercel CLI

```bash
# Установите Vercel CLI (если еще не установлен)
npm i -g vercel

# Войдите в Vercel
vercel login

# Перейдите в проект
cd dnd-genlab-assistant

# Примените миграции к production БД
vercel env pull .env.production
npx prisma migrate deploy
```

#### Вариант 2: Через консоль базы данных

Выполните SQL напрямую в консоли вашей PostgreSQL базы данных:

```sql
-- Добавление отсутствующих колонок в таблицу NPC
ALTER TABLE "NPC" ADD COLUMN IF NOT EXISTS "roleInScene" TEXT;
ALTER TABLE "NPC" ADD COLUMN IF NOT EXISTS "hiddenAgenda" TEXT;
ALTER TABLE "NPC" ADD COLUMN IF NOT EXISTS "interactionOptions" TEXT;
```

#### Вариант 3: Редеплой проекта

Самый простой способ - просто задеплоить проект заново:

```bash
git add .
git commit -m "fix: add migrations to build process"
git push origin main
```

После пуша на GitHub, Vercel автоматически начнет новый деплой с применением миграций.

## Что было исправлено

### 1. package.json - скрипт build

**Было:**
```json
"build": "next build"
```

**Стало:**
```json
"build": "prisma migrate deploy && prisma generate && next build"
```

Теперь при каждом деплое:
1. Применяются все новые миграции к БД
2. Генерируется Prisma Client
3. Собирается Next.js приложение

### 2. vercel.json - новый файл

Добавлена конфигурация для Vercel с оптимизацией для Prisma:
- Явная команда сборки
- Настройки для query engine
- Оптимизация для serverless окружения

## Проверка после деплоя

После редеплоя проверьте:

1. Откройте приложение
2. Попробуйте открыть любой проект
3. Ошибка `NPC.roleInScene does not exist` должна исчезнуть

## Для разработчиков

Если вы клонируете репозиторий:

1. Установите зависимости: `npm install`
2. Примените миграции: `npm run db:migrate:deploy`
3. Запустите dev сервер: `npm run dev`

## Важные замечания

- ⚠️ Миграции применяются автоматически при каждом деплое
- ⚠️ База данных НЕ очищается, только добавляются новые колонки
- ⚠️ Убедитесь, что DATABASE_URL настроен правильно в Vercel Environment Variables
- ⚠️ Для production используйте PostgreSQL (не SQLite)

## Дополнительная информация

### Проверка статуса миграций

```bash
npx prisma migrate status
```

### Просмотр схемы БД

```bash
npx prisma studio
```

### Откат миграций (только для dev)

```bash
npx prisma migrate reset
```

⚠️ **НИКОГДА не используйте migrate reset на production!**

