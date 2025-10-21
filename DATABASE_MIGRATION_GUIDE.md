# 🗄️ Руководство по работе с базой данных

## 🎯 Prisma Studio (веб-интерфейс БД)

### Запуск локально:

```bash
npm run db:studio
```

Откроется: **http://localhost:5555**

### Возможности:
- ✅ Просмотр всех таблиц
- ✅ Добавление/редактирование записей
- ✅ Удаление данных
- ✅ Фильтрация и поиск
- ✅ Визуальное представление связей

### Использование:
1. Выберите модель слева (User, Project, NPC и т.д.)
2. Просмотрите записи
3. Кликните на запись для редактирования
4. Добавьте новую через кнопку "Add record"

---

## 📦 Перенос данных SQLite → PostgreSQL

### Способ 1: Автоматический экспорт/импорт (рекомендуется)

#### Шаг 1: Экспорт из SQLite (локально)

```bash
# Убедитесь что используете SQLite
# В .env или schema.prisma: DATABASE_URL="file:./dev.db"

# Экспортируйте данные
npm run db:export
```

Создастся файл **data-export.json** со всеми данными.

#### Шаг 2: Импорт в PostgreSQL (production)

```bash
# Установите DATABASE_URL для production
$env:DATABASE_URL="postgresql://username:password@host:5432/database"

# Примените миграции (создаст таблицы)
npx prisma migrate deploy

# Импортируйте данные
npm run db:import
```

Готово! ✅

---

### Способ 2: Через Prisma Studio (вручную)

#### Шаг 1: Откройте локальную БД

```bash
# Убедитесь что schema.prisma использует SQLite
npm run db:studio
```

#### Шаг 2: Скопируйте данные

Для каждой модели (User, Project, NPC и т.д.):
1. Выберите все записи
2. Скопируйте в буфер обмена

#### Шаг 3: Подключитесь к production БД

```bash
# Измените DATABASE_URL на PostgreSQL
$env:DATABASE_URL="postgresql://..."

# Примените миграции
npx prisma migrate deploy

# Откройте Studio для production
npm run db:studio
```

#### Шаг 4: Вставьте данные

1. Выберите модель
2. Add record
3. Вставьте скопированные данные

⚠️ **Порядок важен!** Импортируйте в следующем порядке:
1. User
2. CreditBudget
3. Project
4. Scene
5. NPC
6. Encounter
7. Quest
8. PlayerCharacter
9. Session

---

### Способ 3: Через SQL дамп

#### Для небольшой БД:

```bash
# Экспортируйте SQLite в SQL
sqlite3 prisma/dev.db .dump > dump.sql

# Конвертируйте SQL для PostgreSQL (вручную или через инструменты)
# Затем импортируйте
psql $DATABASE_URL < converted-dump.sql
```

---

## 🔄 Переключение между SQLite и PostgreSQL

### Локальная разработка (SQLite):

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Затем:
```bash
npx prisma db push
npm run dev
```

### Production (PostgreSQL):

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**.env:**
```env
DATABASE_URL="postgresql://username:password@host:5432/database"
```

Затем:
```bash
npx prisma migrate deploy
npm run build
npm start
```

---

## 🛠️ Полезные команды

### Просмотр БД:
```bash
npm run db:studio           # Открыть Prisma Studio
```

### Работа со схемой:
```bash
npx prisma db push          # Синхронизировать схему (dev)
npx prisma migrate deploy   # Применить миграции (production)
npx prisma migrate dev      # Создать новую миграцию (dev)
npx prisma db pull          # Получить схему из существующей БД
```

### Экспорт/импорт данных:
```bash
npm run db:export           # Экспорт в data-export.json
npm run db:import           # Импорт из data-export.json
npm run db:seed             # Создать тестовые данные
```

### Генерация Prisma Client:
```bash
npm run db:generate         # Обновить Prisma Client
```

---

## 🚨 Решение проблем

### "Table already exists"

```bash
# Сбросьте миграции и пересоздайте
npx prisma migrate reset

# Или примените force
npx prisma db push --force-reset
```

⚠️ **Это удалит все данные!** Сделайте бэкап!

### "Prisma Client not generated"

```bash
npx prisma generate
```

### "Can't reach database server"

Проверьте DATABASE_URL:
```bash
echo $env:DATABASE_URL
npx prisma db pull  # Проверит подключение
```

---

## 💾 Бэкап БД

### SQLite (локально):

```bash
# Простое копирование файла
cp prisma/dev.db prisma/dev.db.backup

# Или через sqlite3
sqlite3 prisma/dev.db .dump > backup.sql
```

### PostgreSQL (production):

```bash
# Через pg_dump
pg_dump $DATABASE_URL > backup.sql

# Восстановление
psql $DATABASE_URL < backup.sql
```

### Через экспорт скрипт:

```bash
# Создаёт JSON бэкап
npm run db:export

# Восстановление
npm run db:import
```

---

## 📋 Чеклист миграции на production:

- [ ] Создана PostgreSQL база данных
- [ ] DATABASE_URL получен
- [ ] Schema.prisma переключена на postgresql
- [ ] Локальные данные экспортированы (`npm run db:export`)
- [ ] Миграции применены на production (`npx prisma migrate deploy`)
- [ ] Данные импортированы (`npm run db:import`)
- [ ] Prisma Studio проверен (`npm run db:studio`)
- [ ] Health check работает (`/api/health/db`)

---

## ✨ Готово!

Теперь вы можете:
- 🔍 Просматривать данные через Prisma Studio
- 📤 Экспортировать данные в JSON
- 📥 Импортировать данные на production
- 🔄 Легко переключаться между SQLite и PostgreSQL

**Используйте:** `npm run db:studio` для визуальной работы с БД! 🚀

