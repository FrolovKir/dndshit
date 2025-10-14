# Инструкция по запуску DnD GenLab Assistant

## Требования

- Node.js 18+ 
- npm или yarn

## Установка и запуск

### 1. Установите зависимости

```bash
npm install
```

### 2. Настройте базу данных

```bash
# PostgreSQL (локально)
# 1) Создайте БД dndgenlab в Postgres
# 2) Установите переменную окружения main_db_DATABASE_URL, например:
#    postgresql://postgres:password@localhost:5432/dndgenlab?schema=public
# 3) Выполните миграции и сиды:
npm run db:generate
npm run db:migrate:dev
npm run db:seed
```

### 3. Настройте переменные окружения (опционально)

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Для использования реального OpenAI API добавьте ключ в `.env`:

```
OPENAI_API_KEY=sk-your-key-here
```

**Примечание:** Без API ключа будет использоваться mock-адаптер, который генерирует демонстрационные данные.

### 4. Запустите dev-сервер

```bash
npm run dev
```

Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
dnd-genlab-assistant/
├── prisma/
│   ├── schema.prisma      # Схема базы данных
│   └── seed.ts            # Скрипт заполнения тестовыми данными
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API endpoints
│   │   │   ├── generate/  # Генерация контента (session, scene, npc, encounter)
│   │   │   ├── payment/   # Mock платежная система
│   │   │   ├── profile/   # Профиль пользователя
│   │   │   └── projects/  # CRUD для проектов
│   │   ├── projects/      # Страница просмотра проекта
│   │   ├── profile/       # Страница профиля
│   │   ├── pricing/       # Страница тарифов
│   │   ├── export/        # Страница экспорта
│   │   ├── layout.tsx     # Главный layout
│   │   ├── page.tsx       # Главная страница (дашборд)
│   │   └── globals.css    # Глобальные стили
│   ├── components/        # React компоненты
│   │   ├── Navigation.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   └── Generate*Form.tsx  # Формы генерации
│   └── lib/               # Утилиты и библиотеки
│       ├── prisma.ts      # Prisma Client
│       ├── llm.ts         # LLM адаптер (Mock/OpenAI)
│       ├── credits.ts     # Управление токенами
│       ├── prompts.ts     # Промпты для LLM
│       └── export.ts      # Экспорт в Markdown/PDF/JSON
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Основные функции

### 1. Генерация кампаний

На главной странице выберите таб "Кампания" и заполните форму:
- Тема кампании (опционально)
- Сеттинг (Forgotten Realms, Eberron и т.д.)
- Уровень персонажей
- Количество игроков

Система создаст синопсис кампании с основными сюжетными точками.

### 2. Генерация сцен

Выберите существующий проект и опишите контекст сцены. AI создаст детальное описание места, атмосферы, проверок навыков и секретов.

### 3. Генерация NPC

Укажите роль, расу, класс и мировоззрение (или оставьте пустым для случайной генерации). AI создаст персонажа с предысторией, личностью и характеристиками.

### 4. Генерация энкаунтеров

Выберите тип (боевой, социальный, ловушка, головоломка), сложность и уровень группы. AI создаст энкаунтер с монстрами из SRD 5.1, тактикой и наградами.

### 5. Просмотр проектов

Откройте проект, чтобы увидеть все сцены, NPC и энкаунтеры. Вкладки позволяют переключаться между разными типами контента.

### 6. Экспорт

На странице `/export` выберите проект и формат:
- **Markdown** — для публикации или редактирования
- **JSON** — структурированные данные для импорта
- **PDF** — готовый документ для печати

Все экспортируемые файлы включают атрибуцию 5e SRD.

### 7. Управление токенами

Страница `/profile` показывает:
- Текущий тариф
- Использованные и оставшиеся токены
- Статистику использования по типам
- Дату сброса лимита

### 8. Тарифы

Страница `/pricing` предлагает 3 тарифа:
- **Lite** — 50K токенов (бесплатно)
- **Pro** — 500K токенов (990₽/мес)
- **Studio** — 2M токенов (2990₽/мес)

Платежи реализованы через mock-систему для демонстрации.

## API Endpoints

### Генерация контента

- `POST /api/generate/session` — создать кампанию
- `POST /api/generate/scene` — создать сцену
- `POST /api/generate/npc` — создать NPC
- `POST /api/generate/encounter` — создать энкаунтер

### Проекты

- `GET /api/projects` — получить список проектов
- `POST /api/projects` — создать проект
- `GET /api/projects/[id]` — получить детали проекта
- `PATCH /api/projects/[id]` — обновить проект
- `DELETE /api/projects/[id]` — удалить проект

### Профиль и платежи

- `GET /api/profile` — получить профиль с токенами и статистикой
- `POST /api/payment/mock` — эмуляция оплаты
- `GET /api/payment/mock` — получить список тарифов

## Технологии

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Стилизация:** TailwindCSS
- **База данных:** Prisma + SQLite
- **AI:** Абстрактный адаптер (Mock/OpenAI GPT-4o-mini)
- **Экспорт:** Markdown, JSON, PDF (jsPDF)

## Переход на продакшен

### 1. OpenAI API

Замените mock-адаптер на реальный в `src/lib/llm.ts`:
- Добавьте `OPENAI_API_KEY` в `.env`
- Адаптер автоматически переключится на OpenAI

### 2. PostgreSQL

В `prisma/schema.prisma` измените:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

И обновите `main_db_DATABASE_URL` в `.env`:

```
main_db_DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### 3. Платежная система

Интегрируйте YooKassa или CloudPayments:
- Замените `/api/payment/mock/route.ts` на реальную интеграцию
- Добавьте вебхуки для обработки платежей
- Настройте подписки и автопродление

### 4. Авторизация

Добавьте NextAuth.js или Clerk для аутентификации:
- Замените `DEMO_USER_ID` на реальный user ID из сессии
- Добавьте защиту API routes

## Лицензия

Использует 5e SRD (CC BY 4.0). Совместимый контент, не аффилирован с Wizards of the Coast.

## Поддержка

Для вопросов и предложений создавайте Issue в репозитории.

---

**Happy Gaming! 🎲**

