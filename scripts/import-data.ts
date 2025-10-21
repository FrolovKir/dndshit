/**
 * Импорт данных из JSON в БД
 * Используйте после миграции на production PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Импорт данных в БД...');

  const inputPath = path.join(process.cwd(), 'data-export.json');

  if (!fs.existsSync(inputPath)) {
    console.error('❌ Файл data-export.json не найден!');
    console.log('💡 Сначала выполните: npm run export-data');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

  try {
    console.log('📥 Импорт пользователей...');
    for (const user of data.users) {
      const { creditBudget, ...userData } = user;

      await prisma.user.upsert({
        where: { id: user.id },
        create: userData,
        update: userData,
      });

      // Создаём бюджет если есть
      if (creditBudget) {
        await prisma.creditBudget.upsert({
          where: { id: creditBudget.id },
          create: creditBudget,
          update: creditBudget,
        });
      }
    }

    console.log('📥 Импорт проектов...');
    for (const project of data.projects) {
      const { scenes, npcs, encounters, quests, playerCharacters, sessions, ...projectData } = project;

      // Создаём проект
      await prisma.project.upsert({
        where: { id: project.id },
        create: projectData,
        update: projectData,
      });

      // Сцены
      for (const scene of scenes) {
        await prisma.scene.upsert({
          where: { id: scene.id },
          create: scene,
          update: scene,
        });
      }

      // NPC
      for (const npc of npcs) {
        await prisma.nPC.upsert({
          where: { id: npc.id },
          create: npc,
          update: npc,
        });
      }

      // Энкаунтеры
      for (const encounter of encounters) {
        await prisma.encounter.upsert({
          where: { id: encounter.id },
          create: encounter,
          update: encounter,
        });
      }

      // Квесты
      for (const quest of quests) {
        await prisma.quest.upsert({
          where: { id: quest.id },
          create: quest,
          update: quest,
        });
      }

      // Персонажи игроков
      for (const pc of playerCharacters) {
        await prisma.playerCharacter.upsert({
          where: { id: pc.id },
          create: pc,
          update: pc,
        });
      }

      // Сессии
      for (const session of sessions) {
        await prisma.session.upsert({
          where: { id: session.id },
          create: session,
          update: session,
        });
      }
    }

    console.log('✅ Импорт завершён успешно!');
  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

