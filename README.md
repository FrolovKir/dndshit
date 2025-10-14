# DnD GenLab Assistant 🎲

Помощник для мастеров настольных ролевых игр (Dungeons & Dragons 5e SRD). Генерация сюжетов, NPC, энкаунтеров и целых приключений с помощью AI.

## Технологии

- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript
- **Стилизация**: TailwindCSS
- **База данных**: Prisma + SQLite
- **AI**: DeepSeek API (до 8192 токенов, ~$0.14-0.28/1M) или OpenAI GPT-4o-mini

## Возможности

- 🚀 **НОВИНКА: Поэтапная генерация** — AI создает кампанию шаг за шагом:
  - Шаг 1: Основа кампании с антагонистом и ключевыми локациями
  - Шаг 2: 10 детальных сцен (3-4 абзаца каждая)
  - Шаг 3: 20-30 NPC с проработанными характерами
  - Шаг 4: Полностью детализированные боевые энкаунтеры
- ⚡ **Быстрая генерация** — кампания за 30 секунд (базовая версия)
- 🎨 **Художественное описание** — создавайте контент в любом стиле (хоррор, комедия, эпик...)
- 🎬 Детальные сцены с атмосферой и проверками навыков
- ⚔️ Боевые энкаунтеры с монстрами из SRD 5.1 под силу группы
- 🎭 NPC с предысторией, личностью и характеристиками
- 📊 Контроль токенов и бюджета
- 📤 Экспорт в Markdown, PDF, JSON
- 💳 Система тарифов (Lite, Pro, Studio)

## 🚀 Быстрый старт

### Windows

```bash
setup.bat   # Установка (один раз)
start.bat   # Запуск сервера
```

### Linux/Mac

```bash
chmod +x setup.sh start.sh
./setup.sh  # Установка (один раз)
./start.sh  # Запуск сервера
```

### Вручную

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

📖 **Подробнее:** см. [QUICKSTART.md](QUICKSTART.md)

## Структура проекта

```
src/
├── app/              # Next.js App Router
│   ├── api/          # API endpoints
│   ├── projects/     # Страницы проектов
│   └── ...           # Другие страницы
├── components/       # React компоненты
├── lib/              # Утилиты и библиотеки
│   ├── llm.ts        # LLM адаптер
│   ├── credits.ts    # Управление токенами
│   └── prisma.ts     # Prisma client
└── types/            # TypeScript типы

prisma/
├── schema.prisma     # Схема базы данных
└── seed.ts           # Начальные данные
```

## 📚 Документация

- [QUICKSTART.md](QUICKSTART.md) — быстрый старт и установка
- [SETUP.md](SETUP.md) — подробная инструкция по настройке
- [ARCHITECTURE.md](ARCHITECTURE.md) — архитектура и технические детали

## 🧪 Тестовые данные

При первом запуске создаётся:
- Demo пользователь (`demo-user-001`)
- Пример проекта "Забытые Руины Древних"
- 3 сцены (таверна, лес, руины)
- 1 NPC (волшебник Элдрин)
- 1 энкаунтер (скелеты-стражи)
- Pro тариф с 500K токенов

## 🤖 Mock vs Real AI

По умолчанию работает **Mock LLM** — генерирует демо-данные без API ключа.

Для использования **DeepSeek** (рекомендуется, дешевле в ~10 раз):
1. Получите ключ на [platform.deepseek.com](https://platform.deepseek.com)
2. Добавьте в `.env`: `DEEPSEEK_API_KEY=sk-...`
3. Перезапустите сервер

Или **OpenAI GPT-4o-mini**:
1. Получите ключ на [platform.openai.com](https://platform.openai.com)
2. Добавьте в `.env`: `OPENAI_API_KEY=sk-...`
3. Перезапустите сервер

## 🛠️ Команды

```bash
npm run dev         # Dev-сервер
npm run build       # Сборка для продакшена
npm run start       # Запуск продакшен-сервера
npm run db:studio   # Prisma Studio (GUI для БД)
npm run db:seed     # Пересоздать тестовые данные
npm run lint        # ESLint
```

## 🚢 Production

Для деплоя на Vercel:

```bash
npm run build
vercel deploy --prod
```

Настройте env variables:
- `main_db_DATABASE_URL` — PostgreSQL URL
- `OPENAI_API_KEY` — OpenAI API ключ
- `NODE_ENV=production`

См. [SETUP.md](SETUP.md) для миграции на PostgreSQL.

## 📄 Лицензия

Использует 5e SRD (CC BY 4.0). Совместимый контент, не аффилирован с Wizards of the Coast.

---

**Uses 5e SRD (CC BY 4.0). Compatible content, not affiliated with Wizards of the Coast.**

