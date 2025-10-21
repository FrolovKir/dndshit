/**
 * Экспорт данных из текущей БД в JSON
 * Используйте для переноса данных с SQLite на PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Экспорт данных из БД...');

  try {
    const data = {
      users: await prisma.user.findMany({
        include: {
          creditBudget: true,
        },
      }),
      projects: await prisma.project.findMany({
        include: {
          scenes: true,
          npcs: true,
          encounters: true,
          quests: true,
          playerCharacters: true,
          sessions: true,
        },
      }),
    };

    const outputPath = path.join(process.cwd(), 'data-export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log('✅ Данные успешно экспортированы!');
    console.log(`📁 Файл: ${outputPath}`);
    console.log('\n📊 Статистика:');
    console.log(`   Пользователей: ${data.users.length}`);
    console.log(`   Проектов: ${data.projects.length}`);
    console.log(`   Сцен: ${data.projects.reduce((sum, p) => sum + p.scenes.length, 0)}`);
    console.log(`   NPC: ${data.projects.reduce((sum, p) => sum + p.npcs.length, 0)}`);
    console.log(`   Энкаунтеров: ${data.projects.reduce((sum, p) => sum + p.encounters.length, 0)}`);
    console.log(`   Квестов: ${data.projects.reduce((sum, p) => sum + p.quests.length, 0)}`);
    console.log(`   Персонажей игроков: ${data.projects.reduce((sum, p) => sum + p.playerCharacters.length, 0)}`);
    console.log(`   Сессий: ${data.projects.reduce((sum, p) => sum + p.sessions.length, 0)}`);
  } catch (error) {
    console.error('❌ Ошибка экспорта:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

