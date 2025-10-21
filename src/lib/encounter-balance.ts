/**
 * Система балансировки энкаунтеров D&D 5e
 * Основано на правилах из Dungeon Master's Guide
 */

// XP пороги по уровню персонажа (DMG стр. 82)
export const XP_THRESHOLDS: Record<number, { easy: number; medium: number; hard: number; deadly: number }> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
};

// XP по CR (DMG стр. 82)
export const CR_TO_XP: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
};

// Множители по количеству монстров (DMG стр. 82)
export function getEncounterMultiplier(monsterCount: number, partySize: number): number {
  // Корректировка на размер партии
  const isSmallParty = partySize < 3;
  const isLargeParty = partySize > 5;

  if (monsterCount === 1) {
    return isSmallParty ? 1.5 : isLargeParty ? 0.5 : 1;
  } else if (monsterCount === 2) {
    return isSmallParty ? 2 : isLargeParty ? 1 : 1.5;
  } else if (monsterCount <= 6) {
    return isSmallParty ? 2.5 : isLargeParty ? 1.5 : 2;
  } else if (monsterCount <= 10) {
    return isSmallParty ? 3 : isLargeParty ? 2 : 2.5;
  } else if (monsterCount <= 14) {
    return isSmallParty ? 4 : isLargeParty ? 2.5 : 3;
  } else {
    return isSmallParty ? 5 : isLargeParty ? 3 : 4;
  }
}

// Типы сложности
export type Difficulty = 'easy' | 'medium' | 'hard' | 'deadly';

// Расчёт XP бюджета для партии
export function calculateXPBudget(
  partyLevel: number,
  partySize: number,
  difficulty: Difficulty
): number {
  const threshold = XP_THRESHOLDS[partyLevel];
  if (!threshold) {
    throw new Error(`Invalid party level: ${partyLevel}`);
  }
  return threshold[difficulty] * partySize;
}

// Расчёт скорректированного XP с учётом множителя
export function calculateAdjustedXP(
  monsters: Array<{ cr: string; count: number }>,
  partySize: number
): number {
  const totalMonsters = monsters.reduce((sum, m) => sum + m.count, 0);
  const baseXP = monsters.reduce((sum, m) => sum + (CR_TO_XP[m.cr] || 0) * m.count, 0);
  const multiplier = getEncounterMultiplier(totalMonsters, partySize);
  return Math.round(baseXP * multiplier);
}

// Определение сложности энкаунтера
export function determineDifficulty(
  adjustedXP: number,
  partyLevel: number,
  partySize: number
): { difficulty: Difficulty; percentage: number } {
  const budget = {
    easy: calculateXPBudget(partyLevel, partySize, 'easy'),
    medium: calculateXPBudget(partyLevel, partySize, 'medium'),
    hard: calculateXPBudget(partyLevel, partySize, 'hard'),
    deadly: calculateXPBudget(partyLevel, partySize, 'deadly'),
  };

  let difficulty: Difficulty;
  let percentage: number;

  if (adjustedXP < budget.easy) {
    difficulty = 'easy';
    percentage = (adjustedXP / budget.easy) * 100;
  } else if (adjustedXP < budget.medium) {
    difficulty = 'easy';
    percentage = 100;
  } else if (adjustedXP < budget.hard) {
    difficulty = 'medium';
    percentage = ((adjustedXP - budget.medium) / (budget.hard - budget.medium)) * 100;
  } else if (adjustedXP < budget.deadly) {
    difficulty = 'hard';
    percentage = ((adjustedXP - budget.hard) / (budget.deadly - budget.hard)) * 100;
  } else {
    difficulty = 'deadly';
    percentage = 100;
  }

  return { difficulty, percentage: Math.min(percentage, 100) };
}

// Список основных монстров SRD с CR
export const SRD_MONSTERS = [
  // CR 0
  { name: 'Commoner', cr: '0', type: 'humanoid' },
  { name: 'Rat', cr: '0', type: 'beast' },
  { name: 'Spider', cr: '0', type: 'beast' },
  
  // CR 1/8
  { name: 'Bandit', cr: '1/8', type: 'humanoid' },
  { name: 'Cultist', cr: '1/8', type: 'humanoid' },
  { name: 'Guard', cr: '1/8', type: 'humanoid' },
  { name: 'Kobold', cr: '1/8', type: 'humanoid' },
  { name: 'Stirge', cr: '1/8', type: 'beast' },
  
  // CR 1/4
  { name: 'Goblin', cr: '1/4', type: 'humanoid' },
  { name: 'Skeleton', cr: '1/4', type: 'undead' },
  { name: 'Wolf', cr: '1/4', type: 'beast' },
  { name: 'Zombie', cr: '1/4', type: 'undead' },
  { name: 'Acolyte', cr: '1/4', type: 'humanoid' },
  
  // CR 1/2
  { name: 'Hobgoblin', cr: '1/2', type: 'humanoid' },
  { name: 'Orc', cr: '1/2', type: 'humanoid' },
  { name: 'Scout', cr: '1/2', type: 'humanoid' },
  { name: 'Shadow', cr: '1/2', type: 'undead' },
  { name: 'Warhorse', cr: '1/2', type: 'beast' },
  
  // CR 1
  { name: 'Dire Wolf', cr: '1', type: 'beast' },
  { name: 'Ghoul', cr: '1', type: 'undead' },
  { name: 'Giant Spider', cr: '1', type: 'beast' },
  { name: 'Harpy', cr: '1', type: 'monstrosity' },
  { name: 'Specter', cr: '1', type: 'undead' },
  
  // CR 2
  { name: 'Bandit Captain', cr: '2', type: 'humanoid' },
  { name: 'Berserker', cr: '2', type: 'humanoid' },
  { name: 'Cult Fanatic', cr: '2', type: 'humanoid' },
  { name: 'Ghast', cr: '2', type: 'undead' },
  { name: 'Ogre', cr: '2', type: 'giant' },
  { name: 'Werewolf', cr: '2', type: 'humanoid' },
  
  // CR 3
  { name: 'Bugbear Chief', cr: '3', type: 'humanoid' },
  { name: 'Green Hag', cr: '3', type: 'fey' },
  { name: 'Knight', cr: '3', type: 'humanoid' },
  { name: 'Mummy', cr: '3', type: 'undead' },
  { name: 'Owlbear', cr: '3', type: 'monstrosity' },
  { name: 'Wight', cr: '3', type: 'undead' },
  
  // CR 4
  { name: 'Black Pudding', cr: '4', type: 'ooze' },
  { name: 'Ettin', cr: '4', type: 'giant' },
  { name: 'Ghost', cr: '4', type: 'undead' },
  { name: 'Succubus/Incubus', cr: '4', type: 'fiend' },
  { name: 'Wereboar', cr: '4', type: 'humanoid' },
  
  // CR 5
  { name: 'Air Elemental', cr: '5', type: 'elemental' },
  { name: 'Fire Elemental', cr: '5', type: 'elemental' },
  { name: 'Gladiator', cr: '5', type: 'humanoid' },
  { name: 'Hill Giant', cr: '5', type: 'giant' },
  { name: 'Troll', cr: '5', type: 'giant' },
  { name: 'Vampire Spawn', cr: '5', type: 'undead' },
  
  // CR 6
  { name: 'Cyclops', cr: '6', type: 'giant' },
  { name: 'Mage', cr: '6', type: 'humanoid' },
  { name: 'Medusa', cr: '6', type: 'monstrosity' },
  { name: 'Wyvern', cr: '6', type: 'dragon' },
  
  // CR 7
  { name: 'Giant Ape', cr: '7', type: 'beast' },
  { name: 'Mind Flayer', cr: '7', type: 'aberration' },
  { name: 'Stone Giant', cr: '7', type: 'giant' },
  
  // CR 8
  { name: 'Assassin', cr: '8', type: 'humanoid' },
  { name: 'Frost Giant', cr: '8', type: 'giant' },
  { name: 'Hydra', cr: '8', type: 'monstrosity' },
  { name: 'Spirit Naga', cr: '8', type: 'monstrosity' },
  
  // CR 9
  { name: 'Bone Devil', cr: '9', type: 'fiend' },
  { name: 'Cloud Giant', cr: '9', type: 'giant' },
  { name: 'Fire Giant', cr: '9', type: 'giant' },
  
  // CR 10
  { name: 'Aboleth', cr: '10', type: 'aberration' },
  { name: 'Guardian Naga', cr: '10', type: 'monstrosity' },
  { name: 'Stone Golem', cr: '10', type: 'construct' },
  
  // CR 11-15
  { name: 'Behir', cr: '11', type: 'monstrosity' },
  { name: 'Archmage', cr: '12', type: 'humanoid' },
  { name: 'Storm Giant', cr: '13', type: 'giant' },
  { name: 'Adult Black Dragon', cr: '14', type: 'dragon' },
  { name: 'Adult Blue Dragon', cr: '16', type: 'dragon' },
  { name: 'Adult Red Dragon', cr: '17', type: 'dragon' },
  
  // CR 20+
  { name: 'Ancient Black Dragon', cr: '21', type: 'dragon' },
  { name: 'Lich', cr: '21', type: 'undead' },
  { name: 'Ancient Red Dragon', cr: '24', type: 'dragon' },
  { name: 'Tarrasque', cr: '30', type: 'monstrosity' },
];

// Получить монстров по диапазону CR
export function getMonstersByCRRange(minCR: string, maxCR: string): typeof SRD_MONSTERS {
  const minXP = CR_TO_XP[minCR] || 0;
  const maxXP = CR_TO_XP[maxCR] || Infinity;
  return SRD_MONSTERS.filter((m) => {
    const xp = CR_TO_XP[m.cr] || 0;
    return xp >= minXP && xp <= maxXP;
  });
}

