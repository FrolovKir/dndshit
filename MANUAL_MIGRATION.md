# 📝 Ручная миграция для добавления портретов NPC

## Проблема

Нужно добавить поле `imageUrl` в таблицу `NPC` для хранения URL портретов.

---

## Решение

### Вариант 1: Prisma Migrate (Рекомендуется)

Откройте терминал в папке проекта и выполните:

```bash
cd dnd-genlab-assistant
npx prisma migrate dev --name add_npc_image_url
npx prisma generate
```

**Это создаст:**
- Новую миграцию в `prisma/migrations/`
- Обновит файл базы данных `prisma/dev.db`
- Обновит Prisma Client

---

### Вариант 2: Ручное обновление SQLite

Если автоматическая миграция не работает:

#### Шаг 1: Откройте SQLite БД

Используйте любой SQLite редактор или командную строку:

```bash
cd dnd-genlab-assistant/prisma
sqlite3 dev.db
```

#### Шаг 2: Добавьте столбец

```sql
ALTER TABLE NPC ADD COLUMN imageUrl TEXT;
```

#### Шаг 3: Проверьте

```sql
PRAGMA table_info(NPC);
```

Должен появиться столбец `imageUrl` типа `TEXT`.

#### Шаг 4: Выход

```sql
.quit
```

#### Шаг 5: Обновите Prisma Client

```bash
npx prisma generate
```

---

### Вариант 3: Пересоздать БД (Если данные не важны)

```bash
cd dnd-genlab-assistant

# Удалить старую БД
Remove-Item prisma\dev.db

# Создать новую с обновлённой схемой
npx prisma migrate dev --name init
npx prisma db seed
```

**⚠️ ВНИМАНИЕ:** Все существующие данные будут удалены!

---

## Проверка

После миграции проверьте, что всё работает:

1. **Запустите приложение:**
   ```bash
   npm run dev
   ```

2. **Откройте NPC для редактирования**

3. **Проверьте, что кнопка "🎨 Создать портрет" появилась**

4. **Сгенерируйте портрет**

---

## Если что-то пошло не так

### Ошибка: "Column already exists"

Значит поле уже добавлено. Просто запустите:
```bash
npx prisma generate
```

### Ошибка: "Cannot find module '@prisma/client'"

Установите зависимости:
```bash
npm install
npx prisma generate
```

### Ошибка: "Database is locked"

Закройте все приложения, которые могут использовать БД, затем повторите миграцию.

---

## Быстрый старт

**Самый простой способ (если вам не важны существующие данные):**

```bash
cd dnd-genlab-assistant
Remove-Item prisma\dev.db -Force
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Готово! ✅


