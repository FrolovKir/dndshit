/**
 * Промпты для генерации D&D контента
 */

export const SYSTEM_PROMPT = `Ты — опытный мастер Dungeons & Dragons 5e и эксперт по созданию увлекательных приключений.
Твоя задача — помогать мастерам создавать структурированный, интересный контент для игр.
Используй официальные правила D&D 5e SRD (System Reference Document).
Отвечай в формате JSON, если это требуется в промпте.
Будь креативным, но следуй канонам D&D.`;

// ===== НОВЫЙ ПРОМПТ: Фундамент кампании =====
export const CAMPAIGN_FOUNDATION_PROMPT = (params: {
  overview?: string; // Общее описание в свободной форме
  tone?: string; // Тон и жанр
  atmospheric?: string; // Атмосфера по ассоциации
  conflictScale?: string; // Масштаб конфликта
  levelRange?: string; // Уровни персонажей, например: 3-10
  playerCount?: number; // Количество игроков
  playstyle?: string; // Стиль прохождения
  constraints?: string; // Ограничения
}) => `Ты — профессиональный генератор D&D 5e-кампаний уровня официальных модулей Wizards of the Coast. Пользователь вводит общее описание кампании и параметры. На основе этого создай фундамент кампании.

🔥 Ввод пользователя:
- Общее описание в свободной форме: ${params.overview || '—'}
- Тон и жанр: ${params.tone || '—'}
- Атмосфера по ассоциации: ${params.atmospheric || '—'}
- Масштаб конфликта: ${params.conflictScale || '—'}
- Уровни персонажей: ${params.levelRange || '—'}
- Количество игроков: ${typeof params.playerCount === 'number' ? params.playerCount : '—'}
- Стиль прохождения: ${params.playstyle || '—'}
- Ограничения, если есть: ${params.constraints || '—'}

🎯 Задача:
На основе этого создай:
1. Концепцию мира (Подробно и с интересным, но кратким лором)
2. Главную проблему/конфликт, который будет эскалировать
3. 3–5 сил или фракций (только как ФОН. Они не диктуют всё, но влияют на мир)
4. Как мир будет изменяться по мере роста героев (world progression)
5. Атмосферные образы — визуальные, музыкальные, цветовые, чтобы удерживать тон

🎭 Формат вывода строго как JSON:
{
  "title": "",
  "core_theme_image": "образ/символ",
  "setting_overview": "",
  "main_conflict": "",
  "world_tone": "",
  "factions_background": [
    {"name": "", "presence_in_world": "", "style": "", "public_face": "", "true_goal": ""}
  ],
  "world_progression": [
    {"level_tier": "3-5", "world_state": ""},
    {"level_tier": "6-8", "world_state": ""},
    {"level_tier": "9-10", "world_state": ""}
  ],
  "atmospheric_references": {
    "colors": "",
    "soundtrack": "",
    "visual_style": ""
  }
}`;

// ===== ПОЭТАПНАЯ ГЕНЕРАЦИЯ КАМПАНИИ =====

/**
 * ШАГ 1: Создание базового описания кампании (без сцен и NPC)
 */
export const CAMPAIGN_BASE_PROMPT = (params: {
  theme?: string;
  setting?: string;
  level?: string;
  playerCount?: number;
  atmosphericDescription?: string;
}) => `Создай БАЗОВОЕ ОПИСАНИЕ кампании D&D 5e со следующими параметрами:

${params.theme ? `Тема: ${params.theme}` : 'Тема: приключение'}
${params.setting ? `Сеттинг: ${params.setting}` : 'Сеттинг: Forgotten Realms'}
${params.level ? `Уровень персонажей: ${params.level}` : 'Уровень: 1-5'}
${params.playerCount ? `Количество игроков: ${params.playerCount}` : 'Количество игроков: 4-5'}
${params.atmosphericDescription ? `\n⭐ АТМОСФЕРА И СТИЛЬ: ${params.atmosphericDescription}` : ''}

Создай увлекательную предпосылку для кампании. Опиши:
- Центральный конфликт и главного антагониста
- Как герои вовлекаются в историю
- Что находится на кону
- Как может развиваться сюжет (общий план)
- Ключевые локации

⚠️ НЕ создавай конкретные сцены и NPC - только общую концепцию!

Верни ТОЛЬКО валидный JSON:
{
  "title": "Название кампании",
  "synopsis": "Детальное описание предпосылки и сюжета (3-4 абзаца)",
  "setting": "Сеттинг",
  "themes": ["тема1", "тема2", "тема3"],
  "estimatedSessions": число сессий,
  "recommendedLevel": "диапазон уровней",
  "mainPlotPoints": [
    "Вводная точка сюжета",
    "Развитие конфликта",
    "Поворотный момент",
    "Кульминация",
    "Развязка"
  ],
  "keyLocations": ["локация 1", "локация 2", "локация 3"],
  "mainAntagonist": {
    "name": "Имя антагониста",
    "description": "Кто это и какова его цель"
  },
  "hooks": ["зацепка 1 для вовлечения игроков", "зацепка 2"]
}`;

/**
 * ШАГ 2: Генерация сцен на основе кампании
 */
export const CAMPAIGN_SCENES_PROMPT = (params: {
  campaignTitle: string;
  synopsis: string;
  mainPlotPoints: string[];
  setting: string;
  level: string;
  atmosphericDescription?: string;
}) => `Создай 10 ДЕТАЛЬНЫХ СЦЕН для кампании D&D 5e.

КОНТЕКСТ КАМПАНИИ:
Название: ${params.campaignTitle}
Сюжет: ${params.synopsis}
Ключевые точки: ${params.mainPlotPoints.join(', ')}
Сеттинг: ${params.setting}
Уровень: ${params.level}
${params.atmosphericDescription ? `Атмосфера: ${params.atmosphericDescription}` : ''}

Создай 10 сцен, которые проведут героев от начала до конца кампании:
- Сцены должны быть разнообразными: story, combat, social, exploration
- 3-4 сцены должны быть боевыми (combat)
- Для боевых сцен подбери монстров из SRD 5.1 под уровень группы
- Каждая сцена должна продвигать сюжет
- Описания должны быть детальными и атмосферными

Верни ТОЛЬКО валидный JSON:
{
  "scenes": [
    {
      "title": "Название сцены",
      "description": "Детальное описание: что происходит, где, кто присутствует, какая атмосфера, что могут делать игроки (3-4 абзаца)",
      "sceneType": "story|combat|social|exploration",
      "order": номер (1-10),
      "location": "Название локации",
      "keyNPCs": ["краткое описание какие NPC нужны для этой сцены"],
      "monsters": [{"name": "Название из SRD", "count": число, "cr": "CR"}],
      "objectives": ["цель 1", "цель 2"],
      "rewards": "Что получают герои после сцены"
    }
  ]
}`;

// ===== НОВЫЙ ПРОМПТ: Сцены на основе Фундаментa (V2) =====
export const CAMPAIGN_SCENES_V2_PROMPT = (params: {
  foundationJson: string; // Полный JSON этапа 1
  count?: number; // Кол-во сцен (обычно 8–12)
}) => `Ты продолжаешь разработку кампании. Ниже — JSON полного описания кампании:
${params.foundationJson}

🎯 Задача:
Создай ${params.count || 10} сцен (обычно 8–12). Каждая сцена — это событие или точка выбора, влияющая на состояние мира, а не только на конкретную фракцию.

⚙ Условия:
- Каждая сцена должна быть помечена типом: Social / Exploration / Conflict / Moral Choice / Discovery
- У каждой сцены должен быть "Мировой эффект": что изменится в мире, если она будет пройдена успешно или проигнорирована.
- Фракции могут быть фоном, но не навязывай силу фракций как главный фактор событий. Мир = главное, фракции = инструмент.

📤 Формат вывода:
{
  "scenes": [
    {
      "scene_id": 1,
      "title": "",
      "type": "",
      "goal_for_players": "",
      "description": "",
      "world_effect": {
        "if_completed": "",
        "if_ignored_or_failed": ""
      }
    }
  ]
}`;

/**
 * ШАГ 3: Генерация NPC для конкретной сцены
 */
export const SCENE_NPCS_PROMPT = (params: {
  campaignTitle: string;
  campaignSynopsis: string;
  sceneTitle: string;
  sceneDescription: string;
  sceneType: string;
  requiredNPCs: string[];
  level: string;
}) => `Создай 2-3 ДЕТАЛЬНЫХ NPC для сцены D&D 5e.

КОНТЕКСТ КАМПАНИИ:
${params.campaignTitle}
${params.campaignSynopsis}

КОНТЕКСТ СЦЕНЫ:
Название: ${params.sceneTitle}
Тип: ${params.sceneType}
Описание: ${params.sceneDescription}

Требуемые NPC: ${params.requiredNPCs.join(', ')}
Уровень партии: ${params.level}

Создай 2-3 запоминающихся NPC для этой сцены:
- Каждый должен иметь свою роль в сцене
- Детальные характеристики и предыстория
- Уникальные черты и манеры речи
- Связь с сюжетом кампании

Верни ТОЛЬКО валидный JSON:
{
  "npcs": [
    {
      "name": "Полное имя",
      "race": "Раса",
      "class": "Класс (если есть)",
      "level": уровень,
      "alignment": "Мировоззрение",
      "role": "Роль в сцене и сюжете",
      "personality": "Детальное описание характера, манер, привычек (2-3 абзаца)",
      "backstory": "Подробная предыстория (2-3 абзаца)",
      "appearance": "Детальное описание внешности (абзац)",
      "motivations": "Что движет этим персонажем",
      "secrets": "Секреты, которые он скрывает",
      "relationshipToParty": "Как относится к героям",
      "stats": {"STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10},
      "equipment": ["предмет 1", "предмет 2"],
      "quirk": "Запоминающаяся черта или фраза"
    }
  ]
}`;

// ===== НОВЫЙ ПРОМПТ: NPC на основе сцены (V2) =====
export const SCENE_NPCS_V2_PROMPT = (params: { sceneJson: string }) => `Ты продолжаешь построение кампании. Ниже — JSON сцены:
${params.sceneJson}

🎯 Задача: Создай 2–3 NPC, каждый из которых не просто союзник или враг, а имеет:
- Явную роль (гид/мешает/торгуется/наблюдает/вводит драму)
- Личное желание (мотивация)
- Скрытый интерес (который можно раскрыть РП или проверками)
- Возможность реагировать по-разному: сражаться / заключить сделку / отступить / выдать информацию

📤 Формат:
{
  "scene_id": 1,
  "npcs": [
    {
      "name": "",
      "first_impression": "",
      "role_in_scene": "",
      "motivation": "",
      "hidden_agenda": "",
      "interaction_options": {
        "if_players_fight": "",
        "if_players_negotiate": "",
        "if_players_ignore": ""
      }
    }
  ]
}`;

/**
 * ШАГ 4: Генерация энкаунтера для боевой сцены
 */
export const SCENE_ENCOUNTER_PROMPT = (params: {
  campaignTitle: string;
  sceneTitle: string;
  sceneDescription: string;
  location: string;
  level: string;
  suggestedMonsters?: string;
}) => `Создай ДЕТАЛЬНЫЙ БОЕВОЙ ЭНКАУНТЕР для D&D 5e.

КОНТЕКСТ:
Кампания: ${params.campaignTitle}
Сцена: ${params.sceneTitle}
Описание сцены: ${params.sceneDescription}
Локация: ${params.location}
Уровень партии: ${params.level}
${params.suggestedMonsters ? `Рекомендуемые монстры: ${params.suggestedMonsters}` : ''}

Создай сбалансированный боевой энкаунтер:
- Используй только монстров из SRD 5.1
- Подбери CR под уровень группы
- Опиши тактику врагов
- Учти особенности локации
- Добавь интересные элементы окружения

Верни ТОЛЬКО валидный JSON:
{
  "title": "Название энкаунтера",
  "description": "Детальное описание как начинается бой, расстановка врагов (2-3 абзаца)",
  "encounterType": "combat",
  "difficulty": "easy|medium|hard|deadly",
  "monsters": [
    {
      "name": "Название из SRD",
      "count": количество,
      "cr": "CR",
      "hp": хиты,
      "ac": класс защиты,
      "role": "роль в бою (танк/дд/контроль)"
    }
  ],
  "environment": "Детальное описание поля боя и особенностей местности",
  "tactics": "Подробная тактика врагов: как начинают бой, как действуют, когда отступают (2-3 абзаца)",
  "environmentalHazards": ["опасность 1", "опасность 2"],
  "rewards": {
    "gold": количество,
    "items": ["предмет 1", "предмет 2"],
    "xp": общий опыт
  },
  "estimatedDuration": "примерное время боя в раундах"
}`;

// ===== СТАРЫЙ ПРОМПТ (для обратной совместимости) =====
export const SESSION_PROMPT = CAMPAIGN_BASE_PROMPT;

export const SCENE_PROMPT = (params: {
  sceneContext: string;
  previousScenes?: string;
  tone?: string;
}) => `Создай детальную сцену для D&D сессии.

Контекст: ${params.sceneContext}
${params.previousScenes ? `Предыдущие события: ${params.previousScenes}` : ''}
${params.tone ? `Тон: ${params.tone}` : 'Тон: приключенческий'}

Верни JSON со следующими полями:
{
  "title": "Название сцены",
  "description": "Детальное описание места, атмосферы, что видят/слышат персонажи (3-4 абзаца)",
  "sceneType": "exploration|combat|social|puzzle",
  "challenges": ["проверка навыка 1", "проверка навыка 2"],
  "atmosphere": "описание атмосферы",
  "secrets": ["секрет 1", "секрет 2"],
  "possibleOutcomes": ["исход 1", "исход 2"]
}`;

export const NPC_PROMPT = (params: {
  role?: string;
  race?: string;
  class?: string;
  alignment?: string;
  context?: string;
}) => `Создай детального NPC для D&D 5e.

${params.role ? `Роль: ${params.role}` : 'Роль: второстепенный персонаж'}
${params.race ? `Раса: ${params.race}` : ''}
${params.class ? `Класс: ${params.class}` : ''}
${params.alignment ? `Мировоззрение: ${params.alignment}` : ''}
${params.context ? `Контекст: ${params.context}` : ''}

Верни JSON со следующими полями:
{
  "name": "Имя",
  "race": "Раса",
  "class": "Класс",
  "level": уровень,
  "alignment": "Мировоззрение",
  "personality": {
    "traits": "Черты характера",
    "ideals": "Идеалы",
    "bonds": "Привязанности",
    "flaws": "Слабости"
  },
  "appearance": "Внешность (2-3 предложения)",
  "backstory": "Предыстория (абзац)",
  "motivations": "Мотивации",
  "stats": {
    "STR": число,
    "DEX": число,
    "CON": число,
    "INT": число,
    "WIS": число,
    "CHA": число
  },
  "equipment": ["предмет 1", "предмет 2"],
  "quirk": "Запоминающаяся черта или манера речи"
}`;

export const ENCOUNTER_PROMPT = (params: {
  encounterType?: string;
  difficulty?: string;
  level?: number;
  environment?: string;
  context?: string;
}) => `Создай энкаунтер для D&D 5e, используя только монстров из SRD 5.1.

${params.encounterType ? `Тип: ${params.encounterType}` : 'Тип: combat'}
${params.difficulty ? `Сложность: ${params.difficulty}` : 'Сложность: medium'}
${params.level ? `Уровень группы: ${params.level}` : 'Уровень группы: 3'}
${params.environment ? `Окружение: ${params.environment}` : ''}
${params.context ? `Контекст: ${params.context}` : ''}

Верни JSON со следующими полями:
{
  "title": "Название энкаунтера",
  "encounterType": "combat|social|trap|puzzle",
  "difficulty": "easy|medium|hard|deadly",
  "description": "Описание ситуации (2-3 абзаца)",
  "monsters": [
    {
      "name": "Название монстра из SRD",
      "count": количество,
      "cr": Challenge Rating,
      "hp": хиты,
      "ac": класс защиты
    }
  ],
  "environment": "Описание окружения и особенностей местности",
  "tactics": "Тактика врагов",
  "initiative": ["группа врагов 1", "группа врагов 2"],
  "rewards": {
    "gold": количество,
    "items": ["предмет 1", "предмет 2"]
  },
  "estimatedLevel": рекомендуемый уровень,
  "xpTotal": общий опыт за бой
}`;

