# ⚙️ Настройка переменных окружения

## Создание .env файла

Создайте файл `.env` в корне проекта:

```env
# База данных
# Для разработки (SQLite):
DATABASE_URL="file:./dev.db"

# Для production (PostgreSQL):
# DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"

# AI API Keys (хотя бы один)
# DeepSeek (рекомендуется, дешевле в ~10 раз)
DEEPSEEK_API_KEY="sk-your-deepseek-key-here"

# OpenAI (обязательно для DALL-E 3 изображений)
OPENAI_API_KEY="sk-your-openai-key-here"

# Environment
NODE_ENV="development"

# Demo User ID (для тестирования без авторизации)
DEMO_USER_ID="demo-user-001"
```

---

## Получение API ключей

### DeepSeek (рекомендуется)

1. Перейдите на [platform.deepseek.com](https://platform.deepseek.com)
2. Зарегистрируйтесь
3. API Keys → Create new key
4. Скопируйте ключ (начинается с `sk-`)
5. Добавьте в `.env`: `DEEPSEEK_API_KEY="sk-..."`

**Стоимость:** ~$0.14-0.28 за 1M токенов (в 10 раз дешевле OpenAI!)

### OpenAI (для DALL-E 3)

1. Перейдите на [platform.openai.com](https://platform.openai.com/api-keys)
2. Войдите или зарегистрируйтесь
3. Create new secret key
4. Скопируйте ключ (начинается с `sk-`)
5. Добавьте в `.env`: `OPENAI_API_KEY="sk-..."`

**Стоимость:**
- GPT-4o-mini: ~$0.15-0.60 за 1M токенов
- DALL-E 3: ~$0.040-0.080 за изображение

---

## Переключение баз данных

### Development (SQLite)

```env
DATABASE_URL="file:./dev.db"
```

Затем:
```bash
npx prisma db push
npm run dev
```

### Production (PostgreSQL)

```env
DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
```

Затем:
```bash
npx prisma migrate deploy  # Применить миграции
npm run build              # Собрать проект
npm start                  # Запустить production сервер
```

---

## Проверка настройки

### Проверка подключения к БД:

```bash
npx prisma db pull
```

Если успешно — база данных доступна.

### Проверка AI API:

Запустите сервер и попробуйте сгенерировать:
- NPC (проверит DeepSeek/OpenAI)
- Изображение (проверит OpenAI DALL-E)

---

## Mock режим (без API ключей)

Если не указаны API ключи, приложение работает в **Mock режиме**:
- Генерирует демо-данные
- Не требует реальных API
- Подходит для ознакомления

**Ограничения Mock режима:**
- ❌ Нет реальной генерации через AI
- ❌ Нет генерации изображений
- ✅ Все остальные функции работают (таблицы, балансировщик, CRUD)

---

## Безопасность

⚠️ **НИКОГДА не коммитьте .env файл в Git!**

Файл `.env` уже добавлен в `.gitignore`.

Для production используйте:
- Vercel → Environment Variables
- Railway → Variables
- Render → Environment
- Или переменные окружения сервера

---

## Пример конфигурации для разных окружений

### `.env.development` (локальная разработка)
```env
DATABASE_URL="file:./dev.db"
DEEPSEEK_API_KEY="sk-..."
NODE_ENV="development"
```

### `.env.production` (production)
```env
DATABASE_URL="postgresql://..."
DEEPSEEK_API_KEY="sk-..."
OPENAI_API_KEY="sk-..."
NODE_ENV="production"
```

---

**Готово! Теперь можно деплоить на production.** 🚀

