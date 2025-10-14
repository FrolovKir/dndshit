# 🔍 Руководство по отладке генерации кампаний

## Проблема
JSON ответ от DeepSeek API приходит в одном поле и не разделяется на массивы `scenes` и `npcs`.

## Что было исправлено

### 1. Установлен максимальный лимит токенов
- **Лимит:** 8192 токенов (максимум для DeepSeek API)
- **Причина:** DeepSeek API имеет жесткое ограничение max_tokens в диапазоне [1, 8192]
- **Оптимизация:** Промпт оптимизирован для кратких описаний (1-2 абзаца вместо 3-4)

### 2. Добавлено подробное логирование

В консоли разработчика (PowerShell/cmd где запущен `npm run dev`) вы увидите:

```
=== DeepSeek API Call ===
Max tokens requested: 16000

=== DeepSeek Response ===
Tokens used: 12345
Completion tokens: 11000
Finish reason: stop

=== LLM Response ===
Length: 45678
First 500 chars: {"title":"Проклятие...
Last 500 chars: ...}

=== Parsed Data ===
Title: Проклятие Костяной Башни
Scenes count: 10
NPCs count: 5

=== Creating Scenes ===
Scenes array: [Array]
Is array: true
Processing 10 scenes
Creating scene: Приглашение в Безумие
✓ Scene created: Приглашение в Безумие
...
Total scenes created: 10

=== Creating NPCs ===
NPCs array: [Array]
Is array: true
Processing 5 NPCs
Creating NPC: Элминстер Мудрый
✓ NPC created: Элминстер Мудрый
...
Total NPCs created: 5
```

### 3. Улучшена обработка JSON

Теперь код автоматически:
- Извлекает JSON из markdown-блоков (```json ... ```)
- Проверяет наличие массивов `scenes` и `npcs`
- Выводит детальные ошибки при проблемах парсинга

## Как проверить, что проблема решена

### Шаг 1: Запустите сервер
```bash
npm run dev
```

### Шаг 2: Откройте консоль PowerShell
Следите за выводом логов в том окне, где запущен сервер

### Шаг 3: Создайте кампанию
1. Откройте http://localhost:3000
2. Заполните форму генерации кампании
3. Нажмите "Создать кампанию"

### Шаг 4: Проверьте логи

**Если все работает правильно:**
```
✅ Finish reason: stop
✅ Scenes count: 10
✅ NPCs count: 5
✅ Total scenes created: 10
✅ Total NPCs created: 5
```

**Если ответ обрывается:**
```
⚠️ Response may be incomplete! Finish reason: length
⚠️ Scenes count: 0
⚠️ NPCs count: 0
```

### Шаг 5: Проверьте БД
```bash
npm run db:studio
```

Откройте:
- **Project** - должна быть создана кампания
- **Scene** - должно быть 10 сцен
- **NPC** - должно быть 5 NPC
- **Encounter** - боевые энкаунтеры (если есть combat сцены)

## Возможные проблемы

### Проблема 1: "Response may be incomplete" или "finish_reason: length"
**Причина:** DeepSeek обрезает ответ, достигнув лимита 8192 токена

**Решение:**
1. ⚠️ **НЕЛЬЗЯ** увеличить maxTokens выше 8192 (ограничение API)
2. ✅ Упростите промпт в `src/lib/prompts.ts` - попросите более краткие описания
3. ✅ Уменьшите количество сцен/NPC (например, 5 сцен + 3 NPC)
4. ✅ Используйте более короткое `atmosphericDescription`

### Проблема 2: "Scenes count: 0"
**Причина:** LLM не возвращает массив `scenes`

**Решение:**
1. Проверьте логи: `First 500 chars` и `Last 500 chars`
2. Возможно JSON невалидный - проверьте `JSON Parse Error`
3. Попробуйте упростить промпт

### Проблема 3: Ошибка парсинга JSON
**Причина:** DeepSeek возвращает JSON в markdown блоке или с лишним текстом

**Решение:** Код теперь автоматически извлекает JSON из ```json ... ```

## Дополнительная диагностика

### Посмотреть сырой ответ DeepSeek
В файле `src/app/api/generate/session/route.ts` добавьте:

```typescript
console.log('RAW RESPONSE:', response.content);
```

### Сохранить ответ в файл
```typescript
const fs = require('fs');
fs.writeFileSync('debug-response.json', response.content);
```

### Проверить токены через API
DeepSeek Dashboard: https://platform.deepseek.com/usage

## Контакт
Если проблема не решается:
1. Скопируйте логи из консоли
2. Проверьте последние 500 символов ответа
3. Проверьте `finish_reason`

