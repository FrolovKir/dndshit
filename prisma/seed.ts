import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Начало заполнения базы данных...');

  // Создаем администратора
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashPassword('admpass123'),
      name: 'Администратор',
      email: 'admin@dndgenlab.com',
    },
  });

  console.log('✅ Администратор создан:', adminUser.name, '(login: admin)');

  // Создаем demo-пользователя (для обратной совместимости)
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      password: hashPassword('demo'),
      name: 'Demo Мастер',
      email: 'demo@dndgenlab.com',
    },
  });

  console.log('✅ Demo-пользователь создан:', demoUser.name);

  // Создаем бюджет токенов для администратора
  const adminCreditBudget = await prisma.creditBudget.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      tier: 'studio',
      totalTokens: 1000000,
      usedTokens: 0,
      resetAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  console.log('✅ Бюджет токенов для администратора создан:', adminCreditBudget.tier, '-', adminCreditBudget.totalTokens, 'токенов');

  // Создаем бюджет токенов для demo-пользователя
  const creditBudget = await prisma.creditBudget.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      tier: 'pro',
      totalTokens: 500000,
      usedTokens: 0,
      resetAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
  });

  console.log('✅ Бюджет токенов для demo создан:', creditBudget.tier, '-', creditBudget.totalTokens, 'токенов');

  // Создаем демо-проект
  const demoProject = await prisma.project.create({
    data: {
      userId: demoUser.id,
      title: 'Забытые Руины Древних',
      description: 'Эпическое приключение в забытых подземельях',
      synopsis: 'Группа искателей приключений получает карту, ведущую к древним руинам, полным опасностей и сокровищ.',
      setting: 'Forgotten Realms',
    },
  });

  console.log('✅ Демо-проект создан:', demoProject.title);

  // Создаем несколько сцен
  await prisma.scene.createMany({
    data: [
      {
        projectId: demoProject.id,
        title: 'Встреча в таверне',
        description: 'Группа собирается в таверне "Золотой Дракон". Таинственный старик предлагает им карту древних руин.',
        sceneType: 'social',
        order: 1,
      },
      {
        projectId: demoProject.id,
        title: 'Путь к руинам',
        description: 'Герои отправляются через Зачарованный Лес. На пути их ждут опасности.',
        sceneType: 'exploration',
        order: 2,
      },
      {
        projectId: demoProject.id,
        title: 'Вход в руины',
        description: 'Группа находит вход в древние руины, охраняемый скелетами.',
        sceneType: 'combat',
        order: 3,
      },
    ],
  });

  console.log('✅ Сцены созданы');

  // Создаем NPC
  await prisma.nPC.create({
    data: {
      projectId: demoProject.id,
      name: 'Элдрин Мудрый',
      race: 'Человек',
      class: 'Волшебник',
      level: 12,
      alignment: 'Lawful Good',
      personality: 'Мудрый, но эксцентричный. Говорит загадками.',
      backstory: 'Бывший придворный маг, ушедший на покой после великой войны.',
      appearance: 'Старик с длинной седой бородой и проницательными голубыми глазами.',
      motivations: 'Хочет передать знания новому поколению искателей приключений.',
      stats: JSON.stringify({
        STR: 8,
        DEX: 12,
        CON: 14,
        INT: 20,
        WIS: 16,
        CHA: 13,
      }),
    },
  });

  console.log('✅ NPC создан');

  // Создаем энкаунтер
  await prisma.encounter.create({
    data: {
      projectId: demoProject.id,
      title: 'Скелеты-стражи',
      description: 'У входа в руины группа встречает отряд нежити.',
      encounterType: 'combat',
      difficulty: 'medium',
      monsters: JSON.stringify([
        { name: 'Skeleton', count: 4, cr: 0.25 },
        { name: 'Skeleton Warrior', count: 1, cr: 1 },
      ]),
      environment: 'Разрушенный вход в подземелье, заросший плющом.',
      tactics: 'Скелеты атакуют в ближнем бою, воин командует ими.',
      rewards: '150 GP, древняя карта подземелья',
      estimatedLevel: 3,
    },
  });

  console.log('✅ Энкаунтер создан');
  console.log('🎉 База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

