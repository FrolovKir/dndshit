# ⚡ Быстрый деплой на production

## 🎯 За 5 минут на Vercel

### 1. Установите Vercel CLI (если ещё нет)
```bash
npm i -g vercel
```

### 2. Деплой проекта
```bash
vercel
```

Следуйте инструкциям в терминале.

### 3. Создайте PostgreSQL базу

В Vercel Dashboard:
- Storage → Create Database → Postgres
- Выберите ваш проект
- Готово! `DATABASE_URL` добавится автоматически

### 4. Добавьте API ключи

В Vercel Dashboard → Settings → Environment Variables:

```
DEEPSEEK_API_KEY = sk-your-key-here
OPENAI_API_KEY = sk-your-key-here (для изображений)
```

### 5. Примените миграции

```bash
# Скачайте production переменные
vercel env pull .env.production

# Примените миграции
npx prisma migrate deploy

# Готово!
```

### 6. Финальный деплой

```bash
vercel --prod
```

---

## ✅ Готово!

Ваш сайт доступен по адресу: `https://your-app.vercel.app`

---

## 🔧 Альтернатива: Railway (ещё проще!)

### 1. Зайдите на railway.app

### 2. New Project → Deploy from GitHub

### 3. Добавьте PostgreSQL

New → Database → PostgreSQL (автоматически подключится)

### 4. Добавьте переменные

Variables:
```
DEEPSEEK_API_KEY = sk-...
OPENAI_API_KEY = sk-...
NODE_ENV = production
```

### 5. Деплой

Railway автоматически:
- Установит зависимости
- Применит миграции
- Запустит сервер

**Готово за 3 минуты!** 🚀

---

## 📝 Важные файлы для production:

✅ `prisma/schema.prisma` — настроен на PostgreSQL  
✅ `prisma/migrations/` — все миграции готовы  
✅ `PRODUCTION_DEPLOY.md` — подробная инструкция  
✅ `ENV_SETUP.md` — настройка переменных окружения

---

## 💡 После деплоя:

1. **Создайте seed-данные** (опционально):
   ```bash
   DATABASE_URL="postgresql://..." npm run db:seed
   ```

2. **Проверьте health**:
   ```
   https://your-app.vercel.app/api/health/db
   ```

3. **Начните использовать!** 🎲

---

**Всё готово к production деплою!** ✨

