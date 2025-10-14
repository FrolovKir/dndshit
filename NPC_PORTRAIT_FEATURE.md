# 🎨 Генерация портретов NPC через DALL-E

## Обзор

Теперь можно генерировать портреты для NPC используя OpenAI DALL-E 3!

При открытии любого NPC в модальном окне доступна кнопка **"🎨 Создать портрет"**, которая автоматически генерирует изображение персонажа на основе его описания.

---

## ✨ Возможности

### 1. Генерация портрета
- ✅ Кнопка в форме редактирования NPC
- ✅ Автоматическое формирование промпта из данных NPC
- ✅ Использование DALL-E 3 (1024x1024, standard quality)
- ✅ Сохранение URL изображения в БД

### 2. Отображение портрета
- ✅ В модальном окне редактирования (большой размер)
- ✅ В карточке NPC на странице проекта (превью)
- ✅ Кнопка перегенерации портрета

### 3. Промпт для DALL-E
Формируется автоматически:
```
Fantasy RPG character portrait: {name}, {race} {class}. {appearance}. 
Professional digital art, highly detailed, fantasy art style, D&D character portrait.
```

---

## 📝 Изменения в коде

### 1. База данных (Prisma)

**`prisma/schema.prisma`:**
```prisma
model NPC {
  // ... существующие поля
  imageUrl    String?  // URL сгенерированного портрета
  // ...
}
```

### 2. API Endpoint

**`/api/generate/npc-portrait` (POST):**
```typescript
{
  npcId: string  // ID персонажа
}

// Ответ:
{
  success: true,
  imageUrl: string,
  npc: NPC
}
```

**Процесс:**
1. Получает NPC из БД
2. Формирует промпт из `name`, `race`, `class`, `appearance`
3. Вызывает OpenAI DALL-E API
4. Сохраняет URL изображения в БД
5. Возвращает обновлённого NPC

### 3. Обновлённые компоненты

**`EditNPCForm.tsx`:**
- Добавлено состояние `imageUrl`
- Добавлено состояние `generatingPortrait`
- Добавлена функция `handleGeneratePortrait()`
- Добавлена кнопка генерации портрета
- Добавлено отображение изображения

**`/api/npcs/[id]/route.ts`:**
- Добавлен параметр `imageUrl` в PATCH запрос

**`/projects/[id]/page.tsx`:**
- Добавлено поле `imageUrl` в интерфейс NPC
- Добавлено отображение портрета в карточке NPC

---

## 🚀 Использование

### Шаг 1: Откройте NPC для редактирования

1. Перейдите на страницу проекта
2. Вкладка **"NPC"**
3. Нажмите **"✏️"** на нужном персонаже

### Шаг 2: Сгенерируйте портрет

В модальном окне:
1. Заполните данные NPC (особенно **"Внешность"**)
2. Нажмите кнопку **"🎨 Создать портрет"**
3. Подождите ~10-30 секунд (DALL-E 3 генерирует)
4. Портрет появится в окне

### Шаг 3: Перегенерация (опционально)

Если портрет не понравился:
1. Нажмите **"🔄 Перегенерировать"**
2. DALL-E создаст новое изображение

---

## ⚙️ Настройка

### Переменные окружения

**`.env`:**
```env
OPENAI_API_KEY="sk-proj-..."  # Ваш ключ OpenAI
```

### Параметры DALL-E

В файле `/api/generate/npc-portrait/route.ts`:

```typescript
{
  model: 'dall-e-3',      // Модель (dall-e-2 или dall-e-3)
  prompt: prompt,         // Автогенерируемый промпт
  n: 1,                   // Количество изображений
  size: '1024x1024',      // Размер (1024x1024, 1024x1792, 1792x1024)
  quality: 'standard',    // Качество (standard или hd)
}
```

**Цены:**
- DALL-E 3 Standard (1024x1024): $0.040 за изображение
- DALL-E 3 HD (1024x1024): $0.080 за изображение

---

## 📊 Примеры промптов

### Пример 1: Воин

**NPC:**
- Name: Thorin Ironforge
- Race: Dwarf
- Class: Fighter
- Appearance: Stocky dwarf with a braided red beard, wearing heavy plate armor

**Промпт:**
```
Fantasy RPG character portrait: Thorin Ironforge, Dwarf Fighter. 
Stocky dwarf with a braided red beard, wearing heavy plate armor. 
Professional digital art, highly detailed, fantasy art style, D&D character portrait.
```

### Пример 2: Маг

**NPC:**
- Name: Elara Moonwhisper
- Race: Elf
- Class: Wizard
- Appearance: Slender elf with long silver hair and glowing blue eyes, wearing ornate robes

**Промпт:**
```
Fantasy RPG character portrait: Elara Moonwhisper, Elf Wizard. 
Slender elf with long silver hair and glowing blue eyes, wearing ornate robes. 
Professional digital art, highly detailed, fantasy art style, D&D character portrait.
```

---

## 🎯 UI/UX

### В модальном окне редактирования:

```
┌─────────────────────────────────────────┐
│  [Большое изображение портрета]         │
│                                         │
│  Портрет персонажа    [🔄 Перегенерир.] │
│                                         │
│  Имя NPC *                              │
│  [Борис Таверщик]                       │
│  ...                                    │
└─────────────────────────────────────────┘
```

### В карточке NPC (проект):

```
┌─────────────────────────┐
│  [Превью портрета]      │
│                         │
│  Борис Таверщик    ✏️🗑️│
│  Раса: Human            │
│  Класс: Innkeeper       │
│  ...                    │
└─────────────────────────┘
```

---

## 🔧 Обработка ошибок

### API не настроен
```json
{
  "error": "OpenAI API key not configured"
}
```
**Решение:** Добавьте `OPENAI_API_KEY` в `.env`

### NPC не найден
```json
{
  "error": "NPC not found"
}
```
**Решение:** Проверьте правильность `npcId`

### Ошибка DALL-E
```json
{
  "error": "Failed to generate image"
}
```
**Решение:** Проверьте лимиты OpenAI аккаунта или корректность API ключа

---

## 📝 Миграция базы данных

После обновления схемы Prisma нужно применить миграцию:

### Вариант 1: Автоматическая миграция

```bash
cd dnd-genlab-assistant
npx prisma migrate dev --name add_npc_image_url
```

### Вариант 2: Ручное обновление БД

Если автоматическая миграция не работает:

```sql
ALTER TABLE NPC ADD COLUMN imageUrl TEXT;
```

Затем обновите Prisma client:
```bash
npx prisma generate
```

---

## 🎨 Советы по улучшению портретов

### 1. Заполните "Внешность" детально
Чем подробнее описание, тем лучше портрет!

**Плохо:**
```
Внешность: Высокий эльф
```

**Хорошо:**
```
Внешность: Высокий эльф с длинными серебряными волосами и пронзительными 
зелёными глазами. Носит элегантную мантию синего цвета с серебряными рунами. 
Имеет тонкие черты лица и гордую осанку.
```

### 2. Укажите специфические детали
- Цвет волос, глаз, кожи
- Характерные черты (шрамы, татуировки)
- Одежда и аксессуары
- Оружие (для воинов)

### 3. Стиль
DALL-E понимает стили:
- "Epic fantasy art"
- "Dark souls style"
- "Anime style"
- "Realistic portrait"

---

## 🚀 Что дальше?

### Возможные улучшения:
- 📷 Загрузка собственных изображений
- 🎨 Выбор стиля портрета (реализм, аниме, живопись)
- 🖼️ Галерея вариантов портрета
- 💾 Сохранение изображений локально
- 🔄 История генераций
- 📊 Статистика использования DALL-E

---

## 🎉 Готово!

**Теперь ваши NPC могут иметь уникальные портреты!** 

1. Откройте NPC
2. Нажмите "🎨 Создать портрет"
3. Получите профессиональное изображение!

**Fantasy RPG никогда не был таким визуальным!** ✨🎨


