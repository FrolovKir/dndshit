-- CreateTable: Quest
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "questType" TEXT NOT NULL DEFAULT 'investigation',
    "description" TEXT NOT NULL,
    "questGiverId" TEXT,
    "questGiverName" TEXT,
    "objective" TEXT NOT NULL,
    "obstacles" TEXT,
    "rewards" TEXT,
    "complications" TEXT,
    "consequences" TEXT,
    "twist" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "estimatedSessions" INTEGER NOT NULL DEFAULT 1,
    "relatedScenes" TEXT,
    "relatedNPCs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: PlayerCharacter
CREATE TABLE "PlayerCharacter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "background" TEXT,
    "alignment" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 10,
    "dexterity" INTEGER NOT NULL DEFAULT 10,
    "constitution" INTEGER NOT NULL DEFAULT 10,
    "intelligence" INTEGER NOT NULL DEFAULT 10,
    "wisdom" INTEGER NOT NULL DEFAULT 10,
    "charisma" INTEGER NOT NULL DEFAULT 10,
    "maxHP" INTEGER NOT NULL DEFAULT 10,
    "currentHP" INTEGER NOT NULL DEFAULT 10,
    "armorClass" INTEGER NOT NULL DEFAULT 10,
    "speed" INTEGER NOT NULL DEFAULT 30,
    "initiative" INTEGER NOT NULL DEFAULT 0,
    "proficiencyBonus" INTEGER NOT NULL DEFAULT 2,
    "savingThrows" TEXT,
    "skills" TEXT,
    "inventory" TEXT,
    "equipment" TEXT,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "spells" TEXT,
    "spellSlots" TEXT,
    "appearance" TEXT,
    "personality" TEXT,
    "backstory" TEXT,
    "notes" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlayerCharacter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable: Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Сессия',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "summary" TEXT,
    "notes" TEXT,
    "playerDecisions" TEXT,
    "combatLog" TEXT,
    "scenesPlayed" TEXT,
    "npcsEncountered" TEXT,
    "questsUpdated" TEXT,
    "xpAwarded" INTEGER,
    "lootAcquired" TEXT,
    "cliffhanger" TEXT,
    "nextGoals" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Quest_projectId_idx" ON "Quest"("projectId");
CREATE INDEX "PlayerCharacter_projectId_idx" ON "PlayerCharacter"("projectId");
CREATE INDEX "Session_projectId_idx" ON "Session"("projectId");
CREATE INDEX "Session_sessionNumber_idx" ON "Session"("sessionNumber");

