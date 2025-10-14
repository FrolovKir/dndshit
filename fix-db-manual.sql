-- Ручное исправление БД если миграция не работает
-- Откройте prisma/dev.db в SQLite редакторе и выполните:

ALTER TABLE NPC ADD COLUMN imageUrl TEXT;

-- Проверка:
PRAGMA table_info(NPC);

-- Должен появиться столбец imageUrl


