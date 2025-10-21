# 🚀 Деплой на Production

## Подготовка базы данных

### Шаг 1: Создайте PostgreSQL базу данных

Можете использовать любой из сервисов:
- **Vercel Postgres** (рекомендуется для Vercel деплоя)
- **Supabase** (бесплатный tier)
- **Railway** (простой деплой)
- **Neon** (serverless PostgreSQL)

### Шаг 2: Получите DATABASE_URL

Пример формата:
```
postgresql://username:password@host:5432/database_name?schema=public
```

### Шаг 3: Примените миграции

**Вариант А: Автоматическое применение (рекомендуется)**

```bash
# Установите DATABASE_URL
export DATABASE_URL="postgresql://..."

# Примените все миграции
npx prisma migrate deploy
```

**Вариант Б: Быстрое обновление схемы**

```bash
export DATABASE_URL="postgresql://..."
npx prisma db push
```

**Вариант В: Ручное применение SQL**

Если автоматические миграции не работают, выполните SQL вручную:

```bash
# Подключитесь к PostgreSQL
psql $DATABASE_URL

# Выполните миграции по порядку:
# 1. prisma/migrations/20241014000000_init/migration.sql
# 2. prisma/migrations/20241014000001_add_npc_interaction_fields/migration.sql
# 3. prisma/migrations/20241021000000_add_quests_sessions_playercharacters/migration.sql
```

---

## Переменные окружения

### Обязательные:

```env
DATABASE_URL="postgresql://..."
```

### Рекомендуемые (хотя бы один AI API ключ):

```env
# DeepSeek (дешевле, ~$0.14-0.28/1M токенов)
DEEPSEEK_API_KEY="sk-..."

# OpenAI (для DALL-E 3 изображений обязательно)
OPENAI_API_KEY="sk-..."
```

### Опциональные:

```env
NODE_ENV="production"
DEMO_USER_ID="demo-user-001"  # ID демо-пользователя
```

---

## Деплой на Vercel

### Быстрый способ:

1. **Подключите репозиторий:**
   ```bash
   vercel
   ```

2. **Добавьте БД:**
   - Vercel Dashboard → Storage → Create → Postgres
   - Переменная `DATABASE_URL` добавится автоматически

3. **Добавьте API ключи:**
   - Settings → Environment Variables
   - Добавьте `DEEPSEEK_API_KEY` и `OPENAI_API_KEY`

4. **Деплой:**
   ```bash
   vercel --prod
   ```

5. **Примените миграции:**
   ```bash
   # Через Vercel CLI
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

---

## Деплой на Railway

1. **Создайте проект:**
   - railway.app → New Project → Deploy from GitHub

2. **Добавьте PostgreSQL:**
   - New → Database → PostgreSQL
   - `DATABASE_URL` установится автоматически

3. **Добавьте переменные:**
   - Variables → добавьте `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`

4. **Миграции применятся автоматически** при билде

---

## Структура новых таблиц

### Quest (Квесты)
- Привязаны к проектам
- Типы: investigation, rescue, escort, heist, defense, delivery, assassination, diplomatic
- Связи с NPC и сценами
- Статусы: available, active, completed, failed

### PlayerCharacter (Персонажи игроков)
- Полные характеристики D&D 5e
- HP, AC, скорость, инициатива
- Инвентарь и снаряжение (JSON)
- Заклинания для кастеров (JSON)
- Заметки мастера

### Session (Сессии)
- Автоматическая нумерация
- Заметки мастера
- Решения игроков
- Выданный XP и лут
- Клиффхэнгеры
- Цели на следующую сессию

---

## Проверка после деплоя

### 1. Health check

```bash
curl https://your-app.vercel.app/api/health/db
```

Ответ должен быть:
```json
{"status":"ok","database":"connected"}
```

### 2. Создайте тестовый проект

Зайдите на сайт и:
- Создайте новый проект
- Добавьте персонажа игрока
- Создайте запись сессии
- Сгенерируйте квест

### 3. Проверьте все фичи

- ⚖️ Балансировщик энкаунтеров
- 🎲 Случайные таблицы
- ⚡ Панель импровизации
- 🎨 Визуализация (требует OPENAI_API_KEY)
- 📝 Трекер сессий

---

## Решение проблем

### Ошибка "DATABASE_URL not found"

```bash
# Убедитесь что переменная установлена
echo $DATABASE_URL

# Для Vercel
vercel env ls
```

### Ошибка миграции "Table already exists"

```bash
# Сбросьте состояние миграций
npx prisma migrate resolve --applied "20241021000000_add_quests_sessions_playercharacters"

# Или пересоздайте БД
npx prisma migrate reset  # ВНИМАНИЕ: удалит все данные!
```

### Ошибка "Module not found: @prisma/client"

```bash
# Пересоздайте Prisma Client
npx prisma generate
```

---

## Бэкап данных

### Для SQLite (dev):

```bash
# Скопируйте файл БД
cp prisma/dev.db prisma/dev.db.backup
```

### Для PostgreSQL (production):

```bash
# Через pg_dump
pg_dump $DATABASE_URL > backup.sql

# Для Vercel Postgres
vercel postgres pull
```

---

## Откат миграций (если что-то пошло не так)

```bash
# Откат последней миграции
npx prisma migrate resolve --rolled-back "20241021000000_add_quests_sessions_playercharacters"

# Применение заново
npx prisma migrate deploy
```

---

## Быстрый чеклист деплоя

- [ ] Создана PostgreSQL база данных
- [ ] DATABASE_URL добавлен в environment variables
- [ ] DEEPSEEK_API_KEY или OPENAI_API_KEY добавлены
- [ ] Выполнен `npm run build` локально (проверка)
- [ ] Деплой на платформу (Vercel/Railway/Render)
- [ ] Применены миграции: `npx prisma migrate deploy`
- [ ] Проверен health check: `/api/health/db`
- [ ] Создан тестовый проект
- [ ] Все фичи работают

---

**Готово к production! 🚀**

