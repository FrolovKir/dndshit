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
  setting?: string; // Сеттинг/мир
  conflictScale?: string; // Масштаб конфликта
  levelRange?: string; // Уровни персонажей
  playerCount?: number; // Количество игроков
  playstyle?: string; // Стиль прохождения
  sessionLength?: string; // Длительность сессий
  experience?: string; // Опыт группы
  constraints?: string; // Ограничения
}) => `Ты — профессиональный генератор D&D 5e-кампаний уровня официальных модулей Wizards of the Coast. Создай детальный фундамент кампании на основе параметров мастера.

📋 ПАРАМЕТРЫ КАМПАНИИ:
• Общая концепция: ${params.overview || 'Классическое D&D приключение'}
• Тон и жанр: ${params.tone || 'Героическое фэнтези'}
• Атмосфера (референсы): ${params.atmospheric || 'Классическая D&D атмосфера'}
• Сеттинг/мир: ${params.setting || 'Фэнтезийный мир'}
• Масштаб конфликта: ${params.conflictScale || 'региональный'}
• Уровни персонажей: ${params.levelRange || '1-5'}
• Количество игроков: ${params.playerCount || 4}
• Стиль игры: ${params.playstyle || 'сбалансированно'}
• Длительность сессий: ${params.sessionLength || 'средняя (4-5 часов)'}
• Опыт группы: ${params.experience || 'смешанная'}
• Ограничения: ${params.constraints || 'нет особых ограничений'}

🎯 ЗАДАЧА:
Создай полноценный фундамент кампании, учитывая ВСЕ параметры:

1. **АДАПТАЦИЯ ПОД ГРУППУ**: Учти опыт игроков и длительность сессий при планировании сложности и темпа
2. **МАСШТАБИРОВАНИЕ**: Конфликт должен соответствовать заявленному масштабу и уровням персонажей
3. **СТИЛЕВОЕ СООТВЕТСТВИЕ**: Баланс боёв/социалки/исследований должен отражать выбранный стиль
4. **АТМОСФЕРНАЯ ЦЕЛОСТНОСТЬ**: Объедини тон, жанр и атмосферные референсы в единое видение

🎭 ОБЯЗАТЕЛЬНЫЙ JSON ФОРМАТ:
{
  "title": "Название кампании (отражает тон и масштаб)",
  "core_theme_image": "Центральный образ/символ кампании",
  "setting_overview": "Детальное описание мира и сеттинга (3-4 абзаца)",
  "main_conflict": "Главный конфликт с учётом масштаба и уровней персонажей",
  "world_tone": "Общий тон и атмосфера мира",
  "factions_background": [
    {
      "name": "Название фракции",
      "presence_in_world": "Как проявляется в мире",
      "style": "Стиль и методы",
      "public_face": "Что о них знают обычные люди",
      "true_goal": "Истинные цели и планы"
    }
  ],
  "world_progression": [
    {
      "level_tier": "${params.levelRange?.split('-')[0] || '1'}-${Math.min(parseInt(params.levelRange?.split('-')[0] || '1') + 4, parseInt(params.levelRange?.split('-')[1] || '5'))}",
      "world_state": "Состояние мира на начальных уровнях"
    },
    {
      "level_tier": "${Math.min(parseInt(params.levelRange?.split('-')[0] || '1') + 3, parseInt(params.levelRange?.split('-')[1] || '5'))}-${params.levelRange?.split('-')[1] || '5'}",
      "world_state": "Как изменится мир к концу кампании"
    }
  ],
  "atmospheric_references": {
    "colors": "Цветовая палитра кампании",
    "soundtrack": "Музыкальные ассоциации и настроение",
    "visual_style": "Визуальный стиль и образы"
  },
  "session_structure": {
    "pacing": "Темп игры с учётом длительности сессий (${params.sessionLength})",
    "complexity": "Уровень сложности для группы (${params.experience})",
    "focus_balance": "Баланс активностей под стиль '${params.playstyle}'"
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
  mainConflict: string;
  setting: string;
  levelRange: string;
  playerCount: number;
  playstyle: string;
  sessionLength: string;
  experience: string;
  atmosphericDescription?: string;
}) => `Создай 10 ДЕТАЛЬНЫХ СЦЕН для кампании D&D 5e, идеально адаптированных под параметры группы.

📋 КОНТЕКСТ КАМПАНИИ:
• Название: ${params.campaignTitle}
• Описание мира: ${params.synopsis}
• Главный конфликт: ${params.mainConflict}
• Сеттинг: ${params.setting}
• Уровни персонажей: ${params.levelRange}
• Количество игроков: ${params.playerCount}
• Стиль игры: ${params.playstyle}
• Длительность сессий: ${params.sessionLength}
• Опыт группы: ${params.experience}
${params.atmosphericDescription ? `• Атмосфера: ${params.atmosphericDescription}` : ''}

🎯 ТРЕБОВАНИЯ К СЦЕНАМ:

**АДАПТАЦИЯ ПОД СТИЛЬ ИГРЫ (${params.playstyle}):**
${params.playstyle === 'боёв больше' ? '- 5-6 боевых сцен, 2-3 социальные, 1-2 исследования' :
  params.playstyle === 'социалька' ? '- 5-6 социальных сцен, 2-3 боевые, 1-2 исследования' :
  params.playstyle === 'исследование мира' ? '- 5-6 исследовательских сцен, 2-3 боевые, 1-2 социальные' :
  params.playstyle === 'интриги' ? '- 4-5 социальных сцен с интригами, 3-4 боевые, 1-2 исследования' :
  '- Сбалансированно: 3-4 боевые, 3-4 социальные, 2-3 исследования'}

**АДАПТАЦИЯ ПОД ОПЫТ (${params.experience}):**
${params.experience === 'новички' ? '- Простые механики, четкие цели, подсказки для игроков' :
  params.experience === 'опытные' ? '- Сложные моральные дилеммы, многослойные интриги, нестандартные решения' :
  '- Средняя сложность, разнообразие подходов к решению задач'}

**АДАПТАЦИЯ ПОД СЕССИИ (${params.sessionLength}):**
${params.sessionLength === 'короткая' ? '- Каждая сцена = 1 сессия, быстрое развитие, четкие цели' :
  params.sessionLength === 'длинная' ? '- Сцены могут занимать 1.5-2 сессии, глубокая проработка' :
  '- Сцены рассчитаны на 1 сессию, умеренная детализация'}

🎭 ОБЯЗАТЕЛЬНЫЙ JSON ФОРМАТ:
{
  "scenes": [
    {
      "title": "Название сцены",
      "description": "Детальное описание (3-4 абзаца): обстановка, атмосфера, что видят/чувствуют персонажи, возможные действия",
      "sceneType": "combat|social|exploration|story|intrigue",
      "order": номер_сцены,
      "location": "Название и краткое описание локации",
      "keyNPCs": ["Роль и краткое описание нужных NPC"],
      "monsters": [{"name": "Название из SRD 5.1", "count": число, "cr": "подходящий_CR"}],
      "objectives": ["Основная цель", "Дополнительная цель"],
      "rewards": "Награды за успешное прохождение",
      "difficulty_notes": "Заметки по сложности для опыта группы (${params.experience})",
      "session_pacing": "Рекомендации по темпу для сессий (${params.sessionLength})"
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
export const SCENE_NPCS_V2_PROMPT = (params: { sceneJson: string; levelRange: string }) => `Ты продолжаешь построение кампании D&D 5e. Ниже — JSON сцены:
${params.sceneJson}

Уровень партии: ${params.levelRange}

🎯 Задача: Создай 2–3 ДЕТАЛЬНЫХ NPC, каждый из которых не просто союзник или враг, а имеет:
- Явную роль в сцене (гид/мешает/торгуется/наблюдает/вводит драму)
- Личное желание (мотивация)
- Скрытый интерес (который можно раскрыть РП или проверками)
- Возможность реагировать по-разному: сражаться / заключить сделку / отступить / выдать информацию
- Полные игровые характеристики D&D 5e (раса, класс, уровень, мировоззрение, статы)
- Детальное описание внешности и характера
- Предысторию, связанную с сюжетом

⚙ Условия:
- Уровень NPC должен быть подходящим для партии (${params.levelRange})
- Статы должны соответствовать расе и классу по правилам D&D 5e
- Каждый NPC — уникальная личность с запоминающимися чертами
- Предыстория должна объяснять их присутствие в этой сцене

📤 Формат (ТОЛЬКО валидный JSON):
{
  "scene_id": 1,
  "npcs": [
    {
      "name": "Полное имя персонажа",
      "race": "Раса по D&D 5e",
      "class": "Класс (если есть)",
      "level": число,
      "alignment": "Мировоззрение (LG/NG/CG/LN/N/CN/LE/NE/CE)",
      "appearance": "Детальное описание внешности (2-3 предложения)",
      "personality": "Черты характера, манеры, привычки (2-3 предложения)",
      "backstory": "Предыстория персонажа (2-3 предложения)",
      "motivations": "Что движет этим персонажем в целом",
      "role_in_scene": "Конкретная роль в ЭТОЙ сцене (гид/противник/информатор/торговец/наблюдатель)",
      "hidden_agenda": "Скрытый интерес или секрет (что игроки могут узнать через РП/проверки)",
      "stats": {
        "STR": число,
        "DEX": число,
        "CON": число,
        "INT": число,
        "WIS": число,
        "CHA": число
      },
      "interaction_options": {
        "if_players_fight": "Как NPC отреагирует на агрессию",
        "if_players_negotiate": "Как NPC отреагирует на переговоры",
        "if_players_ignore": "Что произойдёт, если игроки проигнорируют NPC"
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
  existingEncounters?: string[];
}) => `Создай УНИКАЛЬНЫЙ энкаунтер для D&D 5e, используя только монстров из SRD 5.1.

${params.encounterType ? `Тип: ${params.encounterType}` : 'Тип: combat'}
${params.difficulty ? `Сложность: ${params.difficulty}` : 'Сложность: medium'}
${params.level ? `Уровень группы: ${params.level}` : 'Уровень группы: 3'}
${params.environment ? `Окружение: ${params.environment}` : ''}
${params.context ? `Контекст: ${params.context}` : ''}
${params.existingEncounters && params.existingEncounters.length > 0 ? `
⚠️ УЖЕ СОЗДАННЫЕ энкаунтеры в этой кампании:
${params.existingEncounters.map((e, i) => `${i + 1}. ${e}`).join('\n')}

ВАЖНО: Создай энкаунтер, ОТЛИЧАЮЩИЙСЯ от уже созданных! Используй других монстров, другую тактику, другую концепцию боя.` : ''}

🎲 Создай РАЗНООБРАЗНЫЙ энкаунтер:
- Используй РАЗЛИЧНЫЕ типы монстров (не повторяй уже использованные)
- Создай УНИКАЛЬНУЮ тактику и концепцию боя
- Добавь интересные элементы окружения и механики
- Сделай энкаунтер запоминающимся и отличным от других

Верни ТОЛЬКО валидный JSON:
{
  "title": "Уникальное название энкаунтера",
  "encounterType": "combat|social|trap|puzzle",
  "difficulty": "easy|medium|hard|deadly",
  "description": "Детальное описание ситуации и начала столкновения (2-3 абзаца)",
  "monsters": [
    {
      "name": "Название монстра из SRD (используй РАЗНЫХ монстров!)",
      "count": количество,
      "cr": Challenge Rating,
      "hp": хиты,
      "ac": класс защиты,
      "role": "роль в бою (танк/дд/контроль/поддержка)"
    }
  ],
  "environment": "Детальное описание окружения, особенностей местности, укрытий",
  "tactics": "УНИКАЛЬНАЯ тактика врагов: как начинают, как действуют, условия отступления (2-3 абзаца)",
  "initiative": ["группа врагов 1", "группа врагов 2"],
  "rewards": {
    "gold": количество,
    "items": ["предмет 1", "предмет 2"]
  },
  "estimatedLevel": рекомендуемый уровень,
  "xpTotal": общий опыт за бой
}`;

// ===== ПАНЕЛЬ БЫСТРОЙ ГЕНЕРАЦИИ (Импровизация) =====

/**
 * Быстрая генерация имён (одна кнопка)
 */
export const QUICK_NAME_PROMPT = (params: {
  type: 'person' | 'place' | 'tavern' | 'organization' | 'item';
  race?: string;
  culture?: string;
  style?: 'common' | 'exotic' | 'dark' | 'noble';
}) => `Сгенерируй ${params.type === 'person' ? 'ИМЯ ПЕРСОНАЖА' : params.type === 'place' ? 'НАЗВАНИЕ МЕСТА' : params.type === 'tavern' ? 'НАЗВАНИЕ ТАВЕРНЫ/ГОСТИНИЦЫ' : params.type === 'organization' ? 'НАЗВАНИЕ ОРГАНИЗАЦИИ' : 'НАЗВАНИЕ ПРЕДМЕТА'} для D&D 5e.

${params.race ? `Раса: ${params.race}` : ''}
${params.culture ? `Культура: ${params.culture}` : ''}
${params.style ? `Стиль: ${params.style}` : ''}

Верни ТОЛЬКО JSON:
{
  "name": "${params.type === 'person' ? 'Имя Фамилия или Имя Прозвище' : 'Название'}",
  ${params.type === 'person' ? '"nickname": "прозвище (опционально)",' : ''}
  "flavor": "короткое пояснение (1 предложение) - почему такое имя, что оно значит, откуда взялось"
}`;

/**
 * Быстрый генератор "мелкого" NPC (за 3 секунды)
 */
export const QUICK_NPC_PROMPT = (params: {
  role: string;
  mood?: 'friendly' | 'suspicious' | 'hostile' | 'indifferent' | 'comedic' | 'mysterious';
  race?: string;
}) => `Создай БЫСТРЫЙ NPC для D&D 5e — второстепенный персонаж для импровизации.

Роль: ${params.role}
${params.race ? `Раса: ${params.race}` : 'Раса: любая подходящая'}
${params.mood ? `Настроение: ${params.mood}` : ''}

Создай КРАТКОГО персонажа — только самое важное для ролевой игры. БЕЗ полных характеристик, только ролевая оболочка.

Верни ТОЛЬКО JSON:
{
  "name": "Имя",
  "race": "Раса",
  "appearance": "Внешность в 1-2 предложениях (яркая запоминающаяся деталь)",
  "personality": "Характер в 1 предложении",
  "quirk": "Странная привычка или манера речи",
  "catchphrase": "Фраза, которую может сказать (опционально)",
  "secret": "Небольшой секрет или скрытая деталь (опционально)"
}`;

/**
 * Генератор случайных событий
 */
export const QUICK_EVENT_PROMPT = (params: {
  location: 'city' | 'wilderness' | 'dungeon' | 'tavern' | 'road';
  tone?: 'neutral' | 'dangerous' | 'comedic' | 'mysterious' | 'dramatic';
}) => `Создай СЛУЧАЙНОЕ СОБЫТИЕ для D&D 5e.

Локация: ${params.location}
${params.tone ? `Тон: ${params.tone}` : ''}

Событие должно быть интересным, но не обязательно критичным для сюжета — что-то, что оживит мир и даст игрокам выбор действий.

Верни ТОЛЬКО JSON:
{
  "title": "Короткое название события",
  "description": "Что происходит (2-3 предложения)",
  "possibleActions": ["что игроки могут сделать - вариант 1", "вариант 2", "вариант 3"],
  "consequences": {
    "if_help": "Что будет, если помогут",
    "if_ignore": "Что будет, если проигнорируют"
  }
}`;

/**
 * Генератор находок и предметов
 */
export const QUICK_LOOT_PROMPT = (params: {
  source: 'pocket' | 'chest' | 'corpse' | 'ruins' | 'treasure';
  value?: 'worthless' | 'common' | 'valuable' | 'magical';
  partyLevel?: number;
}) => `Создай СЛУЧАЙНУЮ НАХОДКУ для D&D 5e.

Источник: ${params.source}
${params.value ? `Ценность: ${params.value}` : ''}
${params.partyLevel ? `Уровень партии: ${params.partyLevel}` : ''}

Создай 1-3 предмета, которые игроки могут найти. Добавь интересные детали, которые намекают на историю или могут быть использованы в сюжете.

Верни ТОЛЬКО JSON:
{
  "items": [
    {
      "name": "Название предмета",
      "description": "Описание (1-2 предложения)",
      "value": "примерная стоимость в золоте",
      "interesting_detail": "Интересная деталь (надпись, потёртость, странность)",
      "potential_use": "Как можно использовать или что это может значить (опционально)"
    }
  ],
  "total_gold": "количество монет (если есть)"
}`;

/**
 * Генератор описаний локаций
 */
export const QUICK_LOCATION_PROMPT = (params: {
  type: 'room' | 'building' | 'outdoor' | 'encounter_site';
  style?: string;
  atmosphere?: 'welcoming' | 'creepy' | 'mysterious' | 'dangerous' | 'peaceful';
}) => `Создай БЫСТРОЕ ОПИСАНИЕ ЛОКАЦИИ для D&D 5e.

Тип: ${params.type}
${params.style ? `Стиль: ${params.style}` : ''}
${params.atmosphere ? `Атмосфера: ${params.atmosphere}` : ''}

Создай атмосферное описание, которое мастер может зачитать игрокам. Включи детали для всех органов чувств (зрение, слух, запах).

Верни ТОЛЬКО JSON:
{
  "name": "Название локации",
  "description": "Детальное описание (3-4 предложения) - что видят, слышат, чувствуют персонажи",
  "key_features": ["особенность 1", "особенность 2", "особенность 3"],
  "hidden_details": ["что можно найти при осмотре", "тайна или секрет"],
  "atmosphere_note": "Одно предложение для настроения (для мастера)"
}`;

/**
 * Генератор осложнений в бою
 */
export const QUICK_COMPLICATION_PROMPT = (params: {
  environment?: string;
  currentSituation?: string;
}) => `Создай ОСЛОЖНЕНИЕ В БОЮ для D&D 5e.

${params.environment ? `Окружение: ${params.environment}` : ''}
${params.currentSituation ? `Текущая ситуация: ${params.currentSituation}` : ''}

Создай неожиданное осложнение, которое сделает бой интереснее и динамичнее. Это может быть изменение окружения, прибытие подкреплений, ловушка, или что-то ещё.

Верни ТОЛЬКО JSON:
{
  "title": "Название осложнения",
  "description": "Что происходит (2-3 предложения)",
  "mechanical_effect": "Игровой эффект (опасность, DC проверки, урон, условие местности)",
  "how_to_resolve": "Как игроки могут справиться с этим"
}`;

/**
 * Генератор сюжетных твистов
 */
export const QUICK_TWIST_PROMPT = (params: {
  context?: string;
  intensity?: 'minor' | 'moderate' | 'major';
}) => `Создай СЮЖЕТНЫЙ ТВИСТ для D&D 5e.

${params.context ? `Контекст: ${params.context}` : ''}
${params.intensity ? `Интенсивность: ${params.intensity}` : 'Интенсивность: moderate'}

Создай неожиданный поворот сюжета, который удивит игроков и добавит глубины истории.

Верни ТОЛЬКО JSON:
{
  "title": "Название твиста",
  "revelation": "Что открывается (2-3 предложения)",
  "implications": ["последствие 1", "последствие 2"],
  "how_to_introduce": "Как ввести этот твист в игру (подсказка для мастера)"
}`;

/**
 * Быстрая генерация диалога NPC
 */
export const QUICK_DIALOGUE_PROMPT = (params: {
  npcType: string;
  situation: string;
  mood?: string;
}) => `Создай быструю РЕПЛИКУ NPC для D&D 5e.

Тип NPC: ${params.npcType}
Ситуация: ${params.situation}
${params.mood ? `Настроение: ${params.mood}` : ''}

Создай 3-4 варианта реплик, которые этот NPC может сказать в данной ситуации. Реплики должны быть характерными и передавать личность.

Верни ТОЛЬКО JSON:
{
  "dialogue_options": [
    "Вариант 1 - дружелюбный",
    "Вариант 2 - нейтральный",
    "Вариант 3 - враждебный/подозрительный",
    "Вариант 4 - с намёком на информацию"
  ],
  "body_language": "Язык тела и жесты (1 предложение)",
  "voice_note": "Как говорит (тихо/громко, акцент, манера)"
}`;

/**
 * Генератор слухов и сплетен
 */
export const QUICK_RUMOR_PROMPT = (params: {
  location?: string;
  topic?: string;
}) => `Создай ИНТЕРЕСНЫЙ СЛУХ для D&D 5e.

${params.location ? `Локация: ${params.location}` : ''}
${params.topic ? `Тема: ${params.topic}` : ''}

Создай слух, который может услышать партия в таверне, на рынке или от случайного прохожего. Слух должен быть интригующим и потенциально полезным.

Верни ТОЛЬКО JSON:
{
  "rumor": "Текст слуха (1-2 предложения)",
  "source": "Кто это рассказывает (тип персонажа)",
  "reliability": "насколько достоверно (правда/полуправда/ложь/преувеличение)",
  "context": "Дополнительная информация для мастера"
}`;

/**
 * Генератор погодных явлений с игровыми эффектами
 */
export const QUICK_WEATHER_PROMPT = (params: {
  season?: string;
  region?: string;
  intensity?: 'mild' | 'moderate' | 'severe' | 'extreme';
}) => `Создай ПОГОДНОЕ ЯВЛЕНИЕ с игровыми эффектами для D&D 5e.

${params.season ? `Сезон: ${params.season}` : ''}
${params.region ? `Регион: ${params.region}` : ''}
${params.intensity ? `Интенсивность: ${params.intensity}` : ''}

Создай интересное погодное условие, которое влияет на игровой процесс - видимость, передвижение, боевые действия.

Верни ТОЛЬКО JSON:
{
  "condition": "Название погодного явления",
  "description": "Описание того, что видят и чувствуют персонажи (2-3 предложения)",
  "game_effect": "Конкретный игровой эффект (штрафы к проверкам, дальность видимости, сложность местности)",
  "duration": "Как долго продлится"
}`;

/**
 * Генератор дорожных встреч
 */
export const QUICK_ROAD_ENCOUNTER_PROMPT = (params: {
  roadType?: 'main_road' | 'country_path' | 'forest_trail' | 'mountain_pass';
  timeOfDay?: 'morning' | 'day' | 'evening' | 'night';
  region?: string;
}) => `Создай ДОРОЖНУЮ ВСТРЕЧУ для D&D 5e.

${params.roadType ? `Тип дороги: ${params.roadType}` : ''}
${params.timeOfDay ? `Время: ${params.timeOfDay}` : ''}
${params.region ? `Регион: ${params.region}` : ''}

Создай интересную встречу на дороге - не обязательно боевую. Может быть торговец, путешественник, странное явление, или что-то ещё.

Верни ТОЛЬКО JSON:
{
  "title": "Название встречи",
  "description": "Что видят персонажи при приближении (2-3 предложения)",
  "participants": ["кто участвует в встрече"],
  "peaceful_resolution": "Как может пройти мирно",
  "conflict_outcome": "Что будет при конфликте"
}`;

/**
 * Генератор болезней и проклятий
 */
export const QUICK_AFFLICTION_PROMPT = (params: {
  type?: 'disease' | 'curse' | 'poison' | 'madness';
  severity?: 'minor' | 'moderate' | 'severe';
  source?: string;
}) => `Создай БОЛЕЗНЬ/ПРОКЛЯТИЕ для D&D 5e.

${params.type ? `Тип: ${params.type}` : ''}
${params.severity ? `Тяжесть: ${params.severity}` : ''}
${params.source ? `Источник: ${params.source}` : ''}

Создай интересный недуг с симптомами и способом лечения. Должно быть игровым препятствием, но не смертельным.

Верни ТОЛЬКО JSON:
{
  "name": "Название болезни/проклятия",
  "type": "disease|curse|poison|madness",
  "description": "Описание недуга и его происхождения (2-3 предложения)",
  "symptoms": ["симптом 1", "симптом 2", "симптом 3"],
  "cure": "Как можно вылечить или снять",
  "duration": "Как долго длится без лечения"
}`;

// ===== ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ (DALL-E 3) =====

/**
 * Генерация промпта для изображения персонажа
 */
export const IMAGE_CHARACTER_PROMPT = (params: {
  description: string;
  race?: string;
  characterClass?: string;
  age?: string;
  style?: 'realistic' | 'fantasy_art' | 'concept_art' | 'token' | 'painting' | 'comic';
  mood?: string;
}) => `Ты — эксперт по созданию промптов для DALL-E 3. Твоя задача — создать качественный английский промпт для генерации ПОРТРЕТА персонажа D&D.

ОПИСАНИЕ ОТ МАСТЕРА:
${params.description}

${params.race ? `Раса: ${params.race}` : ''}
${params.characterClass ? `Класс: ${params.characterClass}` : ''}
${params.age ? `Возраст: ${params.age}` : ''}
${params.style ? `Стиль: ${params.style}` : 'Стиль: fantasy_art'}
${params.mood ? `Настроение: ${params.mood}` : ''}

ТРЕБОВАНИЯ:
- Создай детальный промпт на английском для DALL-E 3
- Портретная ориентация (portrait)
- Фокус на лице и верхней части тела
- Добавь детали стиля D&D фэнтези
- Высокое качество, детализация
- БЕЗ текста на изображении
- БЕЗ фона реального мира (только фэнтези)

Стили:
- realistic: "photorealistic portrait"
- fantasy_art: "fantasy art portrait, D&D official art style, digital painting"
- concept_art: "detailed concept art, character design sheet"
- token: "top-down view token for VTT, simple clean design, circular frame"
- painting: "oil painting portrait, classical fantasy art"
- comic: "comic book style portrait, graphic novel art"

Верни ТОЛЬКО JSON:
{
  "prompt": "детальный английский промпт для DALL-E 3",
  "size": "1024x1024",
  "style": "${params.style || 'fantasy_art'}"
}`;

/**
 * Генерация промпта для изображения локации
 */
export const IMAGE_LOCATION_PROMPT = (params: {
  description: string;
  locationType?: string;
  timeOfDay?: 'dawn' | 'day' | 'sunset' | 'night';
  weather?: 'clear' | 'fog' | 'rain' | 'snow' | 'storm';
  style?: 'realistic' | 'fantasy_art' | 'concept_art' | 'painting';
  atmosphere?: string;
}) => `Ты — эксперт по созданию промптов для DALL-E 3. Твоя задача — создать качественный английский промпт для генерации ЛОКАЦИИ/ПЕЙЗАЖА для D&D.

ОПИСАНИЕ ОТ МАСТЕРА:
${params.description}

${params.locationType ? `Тип локации: ${params.locationType}` : ''}
${params.timeOfDay ? `Время суток: ${params.timeOfDay}` : ''}
${params.weather ? `Погода: ${params.weather}` : ''}
${params.style ? `Стиль: ${params.style}` : 'Стиль: fantasy_art'}
${params.atmosphere ? `Атмосфера: ${params.atmosphere}` : ''}

ТРЕБОВАНИЯ:
- Создай детальный промпт на английском для DALL-E 3
- Широкоформатная ориентация (landscape)
- Атмосферная сцена с деталями окружения
- Стиль D&D фэнтези
- Высокое качество, кинематографическая композиция
- БЕЗ текста на изображении
- БЕЗ людей на переднем плане (если не указано)

Время суток:
- dawn: "dawn lighting, soft golden hour"
- day: "bright daylight, clear visibility"
- sunset: "sunset lighting, warm orange and purple sky"
- night: "night scene, moonlight, starry sky"

Погода:
- clear: "clear weather, good visibility"
- fog: "thick fog, mysterious atmosphere"
- rain: "heavy rain, wet surfaces"
- snow: "snowing, winter landscape"
- storm: "dramatic storm, lightning"

Верни ТОЛЬКО JSON:
{
  "prompt": "детальный английский промпт для DALL-E 3",
  "size": "1792x1024",
  "style": "${params.style || 'fantasy_art'}"
}`;

/**
 * Генерация промпта для изображения предмета
 */
export const IMAGE_ITEM_PROMPT = (params: {
  description: string;
  itemType?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
  style?: 'realistic' | 'fantasy_art' | 'icon' | 'painting';
  magicalEffect?: string;
}) => `Ты — эксперт по созданию промптов для DALL-E 3. Твоя задача — создать качественный английский промпт для генерации ПРЕДМЕТА/АРТЕФАКТА для D&D.

ОПИСАНИЕ ОТ МАСТЕРА:
${params.description}

${params.itemType ? `Тип предмета: ${params.itemType}` : ''}
${params.rarity ? `Редкость: ${params.rarity}` : ''}
${params.style ? `Стиль: ${params.style}` : 'Стиль: fantasy_art'}
${params.magicalEffect ? `Магический эффект: ${params.magicalEffect}` : ''}

ТРЕБОВАНИЯ:
- Создай детальный промпт на английском для DALL-E 3
- Квадратная ориентация
- Предмет на нейтральном/подходящем фоне
- Детализация материалов и текстур
- Магические эффекты (если есть)
- БЕЗ текста на изображении
- Студийное освещение для лучшей видимости деталей

Редкость влияет на детализацию:
- common: "simple design, basic materials"
- uncommon: "well-crafted, quality materials, minor magical glow"
- rare: "intricate design, precious materials, visible magical aura"
- legendary: "masterwork quality, divine materials, powerful magical effects, legendary artifact"

Верни ТОЛЬКО JSON:
{
  "prompt": "детальный английский промпт для DALL-E 3",
  "size": "1024x1024",
  "style": "${params.style || 'fantasy_art'}"
}`;

/**
 * Генерация промпта для боевой сцены
 */
export const IMAGE_SCENE_PROMPT = (params: {
  description: string;
  scale?: 'duel' | 'skirmish' | 'battle' | 'war';
  environment?: string;
  style?: 'realistic' | 'fantasy_art' | 'concept_art' | 'painting' | 'epic';
}) => `Ты — эксперт по созданию промптов для DALL-E 3. Твоя задача — создать качественный английский промпт для генерации БОЕВОЙ СЦЕНЫ для D&D.

ОПИСАНИЕ ОТ МАСТЕРА:
${params.description}

${params.scale ? `Масштаб: ${params.scale}` : ''}
${params.environment ? `Окружение: ${params.environment}` : ''}
${params.style ? `Стиль: ${params.style}` : 'Стиль: fantasy_art'}

ТРЕБОВАНИЯ:
- Создай детальный промпт на английском для DALL-E 3
- Широкоформатная ориентация (landscape)
- Динамичная композиция
- Ощущение движения и экшена
- Драматическое освещение
- D&D фэнтези стиль
- БЕЗ текста на изображении

Масштаб:
- duel: "one-on-one duel, intimate combat, detailed characters"
- skirmish: "small group combat, 3-6 fighters, tactical positioning"
- battle: "large battle scene, dozens of combatants, epic scale"
- war: "massive war scene, armies clashing, epic panoramic view"

Стили:
- epic: "epic fantasy art, dramatic lighting, cinematic composition"
- realistic: "realistic battle scene, gritty and detailed"
- fantasy_art: "fantasy art battle scene, D&D official art style"

Верни ТОЛЬКО JSON:
{
  "prompt": "детальный английский промпт для DALL-E 3",
  "size": "1792x1024",
  "style": "${params.style || 'fantasy_art'}"
}`;

// ===== БАЛАНСИРОВЩИК ЭНКАУНТЕРОВ =====

/**
 * Генерация сбалансированного энкаунтера с AI-подсказками
 */
export const BALANCED_ENCOUNTER_PROMPT = (params: {
  monsters: Array<{ name: string; cr: string; count: number }>;
  partyLevel: number;
  partySize: number;
  difficulty: string;
  environment?: string;
  context?: string;
}) => `Создай ДЕТАЛЬНОЕ ОПИСАНИЕ боевого энкаунтера для D&D 5e на основе сбалансированного состава монстров.

СОСТАВ ЭНКАУНТЕРА:
${params.monsters.map(m => `- ${m.name} × ${m.count} (CR ${m.cr})`).join('\n')}

ПАРАМЕТРЫ ПАРТИИ:
- Уровень: ${params.partyLevel}
- Размер партии: ${params.partySize} игроков
- Сложность: ${params.difficulty}
${params.environment ? `- Окружение: ${params.environment}` : ''}
${params.context ? `- Контекст: ${params.context}` : ''}

ЗАДАЧА:
Создай детальное описание энкаунтера, включая:
1. Как начинается бой (завязка)
2. Расстановку врагов
3. Тактику каждого типа монстров
4. Как они взаимодействуют друг с другом
5. Условия победы/отступления врагов
6. Особенности окружения, которые можно использовать
7. Награды за победу

Верни ТОЛЬКО JSON:
{
  "title": "Название энкаунтера",
  "description": "Детальное описание как начинается бой (2-3 абзаца)",
  "setup": {
    "initial_distance": "расстояние до врагов в футах",
    "enemy_positioning": "как расставлены враги",
    "terrain_features": ["особенность 1", "особенность 2"]
  },
  "tactics": {
    "general_strategy": "общая стратегия врагов",
    "per_monster": [
      {
        "monster": "название монстра",
        "role": "роль в бою (танк/дд/контроль/поддержка)",
        "behavior": "как действует этот монстр",
        "priority_targets": "кого атакует в первую очередь"
      }
    ],
    "retreat_condition": "когда враги отступают или сдаются"
  },
  "environment": {
    "description": "описание окружения",
    "hazards": ["опасность 1", "опасность 2"],
    "useful_features": ["что можно использовать в бою"]
  },
  "rewards": {
    "gold": примерное количество золота,
    "items": ["предмет 1", "предмет 2"],
    "xp": общий XP за энкаунтер
  },
  "dm_tips": ["совет 1 для мастера", "совет 2"]
}`;

// ===== ГЕНЕРАТОР КВЕСТОВ =====

/**
 * Генерация квеста с учётом сеттинга проекта
 */
export const QUEST_GENERATOR_PROMPT = (params: {
  projectTitle: string;
  projectSynopsis: string;
  setting: string;
  questType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  partyLevel?: number;
  availableNPCs?: Array<{ name: string; role: string }>;
  availableLocations?: string[];
  context?: string;
}) => `Создай ДЕТАЛЬНЫЙ КВЕСТ для D&D 5e, который ОРГАНИЧНО ВПИСЫВАЕТСЯ в существующую кампанию.

КОНТЕКСТ КАМПАНИИ:
Название: ${params.projectTitle}
Сюжет: ${params.projectSynopsis}
Сеттинг: ${params.setting}
${params.partyLevel ? `Уровень партии: ${params.partyLevel}` : ''}

${params.availableNPCs && params.availableNPCs.length > 0 ? `
СУЩЕСТВУЮЩИЕ NPC (можешь использовать как квестодателей):
${params.availableNPCs.map(npc => `- ${npc.name} (${npc.role})`).join('\n')}
` : ''}

${params.availableLocations && params.availableLocations.length > 0 ? `
СУЩЕСТВУЮЩИЕ ЛОКАЦИИ:
${params.availableLocations.join(', ')}
` : ''}

ПАРАМЕТРЫ КВЕСТА:
Тип: ${params.questType}
Сложность: ${params.difficulty}
${params.context ? `Дополнительный контекст: ${params.context}` : ''}

ТИПЫ КВЕСТОВ:
- rescue: спасение кого-то или чего-то
- investigation: расследование тайны или преступления
- escort: сопровождение/защита кого-то
- heist: ограбление/кража
- defense: защита локации или персонажа
- delivery: доставка предмета или сообщения
- assassination: устранение цели
- diplomatic: дипломатическая миссия/переговоры

ВАЖНО:
- Квест должен ЕСТЕСТВЕННО вписываться в сюжет кампании
- Используй СУЩЕСТВУЮЩИХ NPC как квестодателей (если есть)
- Связывай с существующими локациями
- Учитывай сеттинг и атмосферу кампании
- Добавь моральную дилемму или выбор
- Квест должен иметь последствия для мира

Верни ТОЛЬКО JSON:
{
  "title": "Название квеста",
  "questType": "${params.questType}",
  "description": "Детальное описание квеста (2-3 абзаца) - что произошло, почему это важно",
  "questGiver": {
    "name": "Имя квестодателя (выбери из существующих NPC или создай нового)",
    "motivation": "Почему он даёт этот квест",
    "offer": "Что и как он предлагает игрокам (начальный диалог)"
  },
  "objective": "Главная цель квеста (1-2 предложения)",
  "obstacles": [
    {
      "title": "Препятствие 1",
      "description": "Что нужно преодолеть",
      "challenge_type": "combat/social/puzzle/exploration",
      "difficulty_check": "DC проверки или CR врагов"
    },
    {
      "title": "Препятствие 2",
      "description": "Что нужно преодолеть",
      "challenge_type": "combat/social/puzzle/exploration",
      "difficulty_check": "DC проверки или CR врагов"
    },
    {
      "title": "Препятствие 3",
      "description": "Что нужно преодолеть",
      "challenge_type": "combat/social/puzzle/exploration",
      "difficulty_check": "DC проверки или CR врагов"
    }
  ],
  "rewards": {
    "gold": примерное количество золота,
    "items": ["магический предмет или ценность"],
    "xp": примерный XP,
    "reputation": "с кем улучшится репутация",
    "other": "другие награды (информация, связи, доступ и т.д.)"
  },
  "complications": [
    "Возможное осложнение 1",
    "Возможное осложнение 2"
  ],
  "twist": "Неожиданный поворот или открытие в середине квеста",
  "consequences": {
    "success": "Что изменится в мире, если квест выполнен успешно",
    "failure": "Что произойдёт, если квест провален",
    "partial": "Что будет, если выполнено частично или с компромиссом"
  },
  "moral_choice": "Моральная дилемма или важный выбор, который встанет перед игроками",
  "connection_to_campaign": "Как этот квест связан с главным сюжетом кампании (может быть слабо или сильно)",
  "estimated_sessions": число сессий (1-3),
  "dm_tips": ["совет 1 для мастера", "совет 2", "совет 3"]
}`;
