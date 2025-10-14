# Архитектура DnD GenLab Assistant

## Общая структура

Приложение построено на **Next.js 14 (App Router)** с полным стеком TypeScript. Всё находится в одном репозитории — и фронтенд, и бэкенд.

```
┌─────────────────────────────────────────┐
│          Next.js Frontend               │
│  (React Components + TailwindCSS)       │
├─────────────────────────────────────────┤
│          API Routes (Backend)           │
│  /api/generate/* | /api/projects/*     │
├─────────────────────────────────────────┤
│          Business Logic                 │
│  LLM Adapter | Credits System | Export │
├─────────────────────────────────────────┤
│          Database Layer                 │
│         Prisma ORM + SQLite             │
└─────────────────────────────────────────┘
```

## Основные слои

### 1. Presentation Layer (UI)

**Компоненты:**
- `src/components/` — переиспользуемые UI компоненты
- `src/app/*/page.tsx` — страницы приложения

**Страницы:**
- `/` — дашборд с генераторами
- `/projects/[id]` — просмотр проекта
- `/profile` — профиль пользователя с токенами
- `/pricing` — тарифы
- `/export` — экспорт проектов

**UI Kit:**
- `Button` — кнопки с вариантами (primary, secondary, danger, ghost)
- `Card` — карточки контента
- `Input`, `Textarea`, `Select` — формы
- `Navigation` — навигационное меню

### 2. API Layer (Backend)

**Endpoints:**

```
/api/generate/
├── session     # POST - создание кампании
├── scene       # POST - создание сцены
├── npc         # POST - создание NPC
└── encounter   # POST - создание энкаунтера

/api/projects/
├── /           # GET - список проектов | POST - создать
└── [id]        # GET - детали | PATCH - обновить | DELETE - удалить

/api/profile    # GET - профиль с токенами и статистикой

/api/payment/
└── mock        # POST - эмуляция оплаты | GET - тарифы
```

**Обработка запросов:**

1. Валидация входных данных
2. Проверка лимита токенов (`checkCredits`)
3. Вызов LLM API
4. Сохранение в БД
5. Вычитание токенов (`deductCredits`)
6. Логирование (`logRequest`)
7. Возврат результата

### 3. Business Logic Layer

#### LLM Adapter (`src/lib/llm.ts`)

Абстракция над разными провайдерами LLM:

```typescript
interface LLMAdapter {
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
}
```

**Реализации:**
- `MockLLMAdapter` — для разработки (генерирует демо-данные)
- `OpenAIAdapter` — для продакшена (OpenAI GPT-4o-mini)

**Переключение:** автоматическое по наличию `OPENAI_API_KEY`

#### Credits System (`src/lib/credits.ts`)

Управление токенами и лимитами:

```typescript
// Проверка лимита
checkCredits(userId, estimatedTokens): Promise<CreditCheck>

// Вычитание токенов
deductCredits(userId, usage: TokenUsage): Promise<void>

// Логирование запроса
logRequest(userId, type, usage, model, success, error?): Promise<void>

// Статистика
getUsageStats(userId, days): Promise<Stats>

// Управление тарифами
updateTier(userId, tier): Promise<void>
resetBudget(userId): Promise<void>
```

**Тарифы:**
- Lite: 50K токенов (бесплатно)
- Pro: 500K токенов (990₽/мес)
- Studio: 2M токенов (2990₽/мес)

#### Prompts (`src/lib/prompts.ts`)

Шаблоны промптов для генерации:
- `SYSTEM_PROMPT` — системный промпт (роль эксперта D&D)
- `SESSION_PROMPT` — кампании
- `SCENE_PROMPT` — сцены
- `NPC_PROMPT` — NPC
- `ENCOUNTER_PROMPT` — энкаунтеры

#### Export (`src/lib/export.ts`)

Экспорт проектов в разные форматы:
- `exportToMarkdown()` — Markdown с форматированием
- `exportToJSON()` — JSON с метаданными
- `exportToPDF()` — PDF через jsPDF

Все экспорты включают атрибуцию 5e SRD.

### 4. Data Layer

#### Prisma Schema

**Модели:**

```prisma
User {
  id, email, name
  projects[]
  creditBudget
  requestLogs[]
}

Project {
  id, userId, title, description, synopsis, setting
  scenes[]
  npcs[]
  encounters[]
}

Scene {
  id, projectId, title, description, sceneType, order
}

NPC {
  id, projectId, name, race, class, level, alignment
  personality, backstory, appearance, motivations, stats
}

Encounter {
  id, projectId, title, description, encounterType
  difficulty, monsters, environment, tactics, rewards
}

CreditBudget {
  id, userId, tier, totalTokens, usedTokens, resetAt
}

RequestLog {
  id, userId, requestType, promptTokens, completionTokens
  totalTokens, model, success, errorMessage
}
```

**Отношения:**
- User 1:N Project
- User 1:1 CreditBudget
- User 1:N RequestLog
- Project 1:N Scene/NPC/Encounter

**Каскадное удаление:** при удалении проекта удаляются все связанные сцены, NPC и энкаунтеры.

## Потоки данных

### Генерация кампании

```
User Input → Form
  ↓
POST /api/generate/session
  ↓
checkCredits(user, ~1500 tokens)
  ↓
LLM.complete([system, user prompt])
  ↓
Parse JSON response
  ↓
prisma.project.create(...)
  ↓
deductCredits(user, actualTokens)
  ↓
logRequest(user, 'session', ...)
  ↓
Return { project, sessionData, tokensUsed }
```

### Просмотр проекта

```
User clicks project
  ↓
GET /api/projects/[id]
  ↓
prisma.project.findUnique({
  include: { scenes, npcs, encounters }
})
  ↓
Return project with all relations
  ↓
Render tabs (overview, scenes, npcs, encounters)
```

### Экспорт

```
User selects project + format
  ↓
Fetch /api/projects/[id]
  ↓
Call export function (Markdown/JSON/PDF)
  ↓
Generate formatted content
  ↓
Add SRD attribution
  ↓
Download file
```

## Безопасность и ограничения

### Token Limits

Перед каждым запросом к LLM:
1. Оценивается примерное количество токенов (length / 4)
2. Проверяется бюджет пользователя
3. Если лимит превышен → возврат 402 Payment Required

### Demo Mode

В MVP используется `DEMO_USER_ID` для всех операций. В продакшене:
- Добавить NextAuth.js / Clerk
- Получать userId из сессии
- Добавить middleware для защиты API routes

### Rate Limiting

Рекомендуется добавить:
- Rate limiting на API routes (например, через `rate-limiter-flexible`)
- CSRF защиту
- Валидацию всех входных данных через Zod

## Масштабирование

### База данных

**SQLite → PostgreSQL:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Миграции:**
```bash
npm run prisma migrate dev
```

### Кэширование

Рекомендуется добавить Redis для:
- Кэширования популярных проектов
- Rate limiting
- Сессий пользователей

### LLM API

**Fallback провайдеры:**
- OpenAI GPT-4o-mini (primary)
- Together AI Llama 3 (fallback)
- Anthropic Claude (premium)

**Оптимизация:**
- Кэширование похожих запросов
- Streaming responses для больших генераций
- Батчинг запросов

## Мониторинг

Рекомендуется добавить:
- **Sentry** — отслеживание ошибок
- **Vercel Analytics** — метрики производительности
- **Custom Dashboard** — статистика по токенам и запросам

## Деплой

### Vercel (рекомендуется)

```bash
npm run build
vercel deploy --prod
```

**Env Variables:**
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `DEMO_USER_ID`
- `NODE_ENV=production`

### Альтернативы

- **Railway** — простой деплой с PostgreSQL
- **Render** — бесплатный tier
- **Cloudflare Pages** — edge functions

## Тестирование

Рекомендуется добавить:

```bash
npm install -D jest @testing-library/react vitest
```

**Тесты:**
- Unit тесты для `lib/*` функций
- Integration тесты для API routes
- E2E тесты для критичных флоу (Playwright)

## Дальнейшее развитие

### MVP → Production

1. **Авторизация**
   - NextAuth.js с Google/Discord OAuth
   - Email/password
   - Magic links

2. **Платежи**
   - Интеграция YooKassa/CloudPayments
   - Webhooks для обработки платежей
   - Подписки с автопродлением

3. **Генерация изображений**
   - DALL-E 3 для иллюстраций NPC
   - Stable Diffusion для карт локаций
   - Midjourney для концепт-артов

4. **Совместная работа**
   - Приглашение участников в проект
   - Real-time обновления (WebSocket)
   - Комментарии и ревью

5. **AI Assistants**
   - Чат-бот для консультаций по правилам
   - Голосовой помощник для игры
   - Автоматическая генерация случайных событий

6. **Интеграции**
   - Roll20 / Foundry VTT экспорт
   - D&D Beyond импорт персонажей
   - Discord bot для быстрого доступа

---

**Лицензия:** 5e SRD (CC BY 4.0)  
**Не аффилирован с Wizards of the Coast**

