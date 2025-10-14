import { PrismaClient, Prisma } from '@prisma/client';
import { execSync } from 'child_process';

function getEnv(name: string, optional = false): string {
  const v = process.env[name];
  if (!v && !optional) {
    throw new Error(`Env var ${name} is required`);
  }
  return v || '';
}

// Источники: локальная БД (LOCAL_DATABASE_URL) и удалённая (REMOTE_DATABASE_URL)
// Переезд: основная переменная теперь main_db_DATABASE_URL
const LOCAL_DATABASE_URL = process.env.LOCAL_DATABASE_URL || (process.env as any).main_db_DATABASE_URL || '';
const REMOTE_DATABASE_URL = process.env.REMOTE_DATABASE_URL || '';

if (!LOCAL_DATABASE_URL) {
  throw new Error('Set LOCAL_DATABASE_URL or main_db_DATABASE_URL for source DB');
}
if (!REMOTE_DATABASE_URL) {
  throw new Error('Set REMOTE_DATABASE_URL for destination DB');
}

const source = new PrismaClient({ datasources: { db: { url: LOCAL_DATABASE_URL } } });
const dest = new PrismaClient({ datasources: { db: { url: REMOTE_DATABASE_URL } } });

function stripTimestamps<T extends { createdAt?: any; updatedAt?: any }>(obj: T): Omit<T, 'createdAt' | 'updatedAt'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt, updatedAt, ...rest } = obj as any;
  return rest;
}

async function runMigrateDeploy() {
  try {
    console.log('› Applying migrations to remote DB (prisma migrate deploy)...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, main_db_DATABASE_URL: REMOTE_DATABASE_URL },
    });
  } catch (e) {
    console.warn('! prisma migrate deploy failed (continuing). Ensure remote schema is compatible.');
  }
}

async function copyUsers() {
  const users = await source.user.findMany();
  console.log(`Users: ${users.length}`);
  for (const u of users) {
    const data = stripTimestamps(u);
    await dest.user.upsert({
      where: { id: u.id },
      create: data,
      update: data,
    });
  }
}

async function copyCreditBudgets() {
  const items = await source.creditBudget.findMany();
  console.log(`CreditBudget: ${items.length}`);
  for (const it of items) {
    const data = stripTimestamps(it);
    await dest.creditBudget.upsert({
      where: { id: it.id },
      create: data,
      update: data,
    });
  }
}

async function copyProjects() {
  const items = await source.project.findMany();
  console.log(`Projects: ${items.length}`);
  for (const it of items) {
    const data = stripTimestamps(it);
    await dest.project.upsert({
      where: { id: it.id },
      create: data,
      update: data,
    });
  }
}

async function copyScenes() {
  const items = await source.scene.findMany();
  console.log(`Scenes: ${items.length}`);
  for (const it of items) {
    const data = stripTimestamps(it);
    await dest.scene.upsert({
      where: { id: it.id },
      create: data,
      update: data,
    });
  }
}

async function copyNPCs() {
  // Модель Prisma генерирует клиент nPC для модели NPC
  const items = await (source as any).nPC.findMany();
  console.log(`NPCs: ${items.length}`);
  for (const it of items) {
    const data = stripTimestamps(it);
    await (dest as any).nPC.upsert({
      where: { id: it.id },
      create: data,
      update: data,
    });
  }
}

async function copyEncounters() {
  const items = await dest.encounter.count();
  const src = await source.encounter.findMany();
  console.log(`Encounters: ${src.length}`);
  for (const it of src) {
    const data = stripTimestamps(it);
    await dest.encounter.upsert({
      where: { id: it.id },
      create: data,
      update: data,
    });
  }
}

async function copyRequestLogs() {
  const items = await source.requestLog.findMany();
  console.log(`RequestLogs: ${items.length}`);
  for (const it of items) {
    const data = stripTimestamps(it);
    await dest.requestLog.upsert({
      where: { id: it.id },
      create: data,
      update: data,
    });
  }
}

async function main() {
  console.log('=== Sync DB: local → remote ===');
  console.log('Source:', LOCAL_DATABASE_URL.split('?')[0]);
  console.log('Destination:', REMOTE_DATABASE_URL.split('?')[0]);

  await runMigrateDeploy();

  await copyUsers();
  await copyCreditBudgets();
  await copyProjects();
  await copyScenes();
  await copyNPCs();
  await copyEncounters();
  await copyRequestLogs();

  console.log('✓ Sync completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await source.$disconnect();
    await dest.$disconnect();
  });


