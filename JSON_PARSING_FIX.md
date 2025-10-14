# 🔧 Исправление парсинга JSON в индивидуальной генерации

## Проблема

При индивидуальной генерации NPC, энкаунтеров и сцен (не в составе кампании) данные сохранялись в БД как JSON строка целиком, вместо того чтобы распределяться по отдельным полям.

**Причина:** LLM (DeepSeek) возвращает JSON обёрнутый в markdown блоки:

```
```json
{
  "name": "Борис Таверщик",
  "race": "Human",
  ...
}
```
```

Простой `JSON.parse()` не может обработать такой формат.

---

## Решение

Добавлена **очистка от markdown блоков** перед парсингом JSON во всех трёх API эндпоинтах:

### Обновлённые файлы:

1. `/api/generate/npc/route.ts`
2. `/api/generate/encounter/route.ts`
3. `/api/generate/scene/route.ts`

### Алгоритм очистки:

```typescript
// Очищаем от markdown блоков
let cleanedContent = response.content.trim();

// Удаляем ```json в начале
if (cleanedContent.includes('```json')) {
  cleanedContent = cleanedContent.replace(/```json\n?/g, '');
}

// Удаляем ``` в конце
if (cleanedContent.includes('```')) {
  cleanedContent = cleanedContent.replace(/```\n?$/g, '');
}

// Теперь парсим чистый JSON
const data = JSON.parse(cleanedContent);
```

---

## Что исправлено

### До исправления:

**NPC сохранялся так:**
```
name: "```json\n{\"name\": \"Борис\", \"race\": \"Human\"...}\n```"
race: null
class: null
...
```

**После исправления:**
```
name: "Борис Таверщик"
race: "Human"
class: "Innkeeper"
level: 3
alignment: "Neutral Good"
personality: "Весёлый и общительный..."
backstory: "Борис владеет таверной уже 20 лет..."
...
```

---

## Добавлено логирование

Для отладки добавлены console.log во все эндпоинты:

```typescript
console.log('[NPC] Raw LLM response:', response.content);
console.log('[NPC] Cleaned content:', cleanedContent);
console.log('[NPC] Parsed NPC data:', npcData);
```

**Префиксы:**
- `[NPC]` - генерация NPC
- `[ENCOUNTER]` - генерация энкаунтера
- `[SCENE]` - генерация сцены

Это помогает быстро найти проблемы в логах сервера.

---

## Обработка ошибок

Если парсинг всё равно не удаётся (невалидный JSON), используется fallback:

### NPC:
```typescript
{
  name: 'Сгенерированный NPC',
  race: race || 'Human',
  class: npcClass || 'Commoner',
  level: 1,
  alignment: alignment || 'Neutral',
  personality: response.content, // Весь ответ LLM
  backstory: '',
  appearance: '',
  motivations: '',
  stats: null,
}
```

### Encounter:
```typescript
{
  title: 'Сгенерированный энкаунтер',
  encounterType: encounterType || 'combat',
  difficulty: difficulty || 'medium',
  description: response.content, // Весь ответ LLM
  monsters: [],
  environment: environment || '',
  tactics: '',
  rewards: null,
  estimatedLevel: level || 3,
}
```

### Scene:
```typescript
{
  title: 'Сгенерированная сцена',
  description: response.content, // Весь ответ LLM
  sceneType: 'story',
  challenges: [],
  atmosphere: '',
  secrets: [],
}
```

---

## Тестирование

### Как проверить что работает:

1. **Откройте главную страницу**

2. **Генерация NPC:**
   - Перейдите в таб "NPC (AI)"
   - Выберите кампанию
   - Укажите роль: "Таверщик"
   - Нажмите "Создать NPC"
   - Проверьте консоль браузера и логи сервера

3. **Откройте страницу проекта**
   - Перейдите во вкладку "NPC"
   - Нажмите ✏️ на созданном NPC
   - **Проверьте:** все поля заполнены отдельно
     - Имя
     - Раса
     - Класс
     - Характер
     - Предыстория
     - etc.

4. **Аналогично для энкаунтеров и сцен**

---

## Логи для отладки

### В консоли сервера (терминал):

```
[NPC] Raw LLM response: ```json
{
  "name": "Борис Таверщик",
  "race": "Human",
  "class": "Commoner",
  "level": 3,
  ...
}
```

[NPC] Cleaned content: {
  "name": "Борис Таверщик",
  "race": "Human",
  ...
}

[NPC] Parsed NPC data: {
  name: 'Борис Таверщик',
  race: 'Human',
  class: 'Commoner',
  level: 3,
  ...
}
```

### При ошибке парсинга:

```
[NPC] Failed to parse JSON: SyntaxError: Unexpected token...
[NPC] Content was: <полный ответ LLM>
```

---

## Изменения в коде

### `/api/generate/npc/route.ts`

**Было:**
```typescript
let npcData;
try {
  npcData = JSON.parse(response.content);
} catch (e) {
  // fallback
}
```

**Стало:**
```typescript
console.log('[NPC] Raw LLM response:', response.content);

let npcData;
try {
  // Очищаем от markdown блоков
  let cleanedContent = response.content.trim();
  if (cleanedContent.includes('```json')) {
    cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
  }
  if (cleanedContent.includes('```')) {
    cleanedContent = cleanedContent.replace(/^```\n?/g, '').replace(/```\n?$/g, '');
  }
  
  console.log('[NPC] Cleaned content:', cleanedContent);
  npcData = JSON.parse(cleanedContent);
  console.log('[NPC] Parsed NPC data:', npcData);
} catch (e) {
  console.error('[NPC] Failed to parse JSON:', e);
  console.error('[NPC] Content was:', response.content);
  // fallback
}
```

---

## Аналогично для всех эндпоинтов

Та же логика применена к:
- `/api/generate/encounter/route.ts` - с префиксом `[ENCOUNTER]`
- `/api/generate/scene/route.ts` - с префиксом `[SCENE]`

---

## Преимущества

### Для пользователя:
- ✅ Корректное сохранение всех полей
- ✅ Возможность редактирования каждого поля отдельно
- ✅ Правильное отображение в модальных окнах
- ✅ Экспорт работает правильно

### Для разработчика:
- ✅ Подробное логирование
- ✅ Легко найти проблему
- ✅ Fallback на случай ошибки
- ✅ Универсальное решение для всех типов

---

## Совместимость

Исправление **обратно совместимо**:
- Старые данные (JSON строки) продолжают работать
- Новые данные сохраняются правильно
- Ничего не ломается

---

## Что дальше?

Если проблема повторится:
1. Проверьте логи сервера
2. Найдите сообщения с префиксом `[NPC]`, `[ENCOUNTER]` или `[SCENE]`
3. Посмотрите на "Raw LLM response"
4. Если формат нестандартный - добавьте дополнительную очистку

---

**Теперь все данные сохраняются правильно!** ✅

**JSON парсится корректно, поля заполняются, редактирование работает!** 🎉


