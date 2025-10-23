/**
 * Абстрактный адаптер для работы с LLM API
 * Легко заменить реализацию на OpenAI, Together, Anthropic и т.д.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export interface LLMAdapter {
  complete(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse>;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Mock LLM адаптер для разработки
 * В продакшене заменить на реальный OpenAI или другой провайдер
 */
class MockLLMAdapter implements LLMAdapter {
  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    // Имитация задержки API
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lastMessage = messages[messages.length - 1];
    const promptLength = messages.reduce((sum, m) => sum + m.content.length, 0);
    const promptTokens = Math.ceil(promptLength / 4);

    // Генерируем mock-ответ в зависимости от типа запроса
    let content = '';
    
    if (lastMessage.content.includes('session') || lastMessage.content.includes('campaign') || lastMessage.content.includes('БАЗОВОЕ ОПИСАНИЕ')) {
      content = this.generateMockSession();
    } else if ((lastMessage.content.includes('scene') || lastMessage.content.includes('СЦЕН')) && (lastMessage.content.includes('NPC') || lastMessage.content.includes('ДЕТАЛЬНЫХ NPC'))) {
      content = this.generateMockSceneNPCs();
    } else if (lastMessage.content.includes('scene') || lastMessage.content.includes('СЦЕН')) {
      content = this.generateMockScene();
    } else if (lastMessage.content.includes('NPC') || lastMessage.content.includes('ПЕРСОНАЖ')) {
      content = this.generateMockNPC();
    } else if (lastMessage.content.includes('encounter') || lastMessage.content.includes('энкаунтер')) {
      content = this.generateMockEncounter();
    } else if (lastMessage.content.includes('ИМЯ') || lastMessage.content.includes('НАЗВАНИЕ')) {
      content = this.generateMockName();
    } else if (lastMessage.content.includes('БЫСТРЫЙ NPC')) {
      content = this.generateMockQuickNPC();
    } else if (lastMessage.content.includes('СОБЫТИЕ')) {
      content = this.generateMockEvent();
    } else if (lastMessage.content.includes('НАХОДКУ')) {
      content = this.generateMockLoot();
    } else if (lastMessage.content.includes('ЛОКАЦИИ')) {
      content = this.generateMockLocation();
    } else if (lastMessage.content.includes('ОСЛОЖНЕНИЕ')) {
      content = this.generateMockComplication();
    } else if (lastMessage.content.includes('ТВИСТ')) {
      content = this.generateMockTwist();
    } else if (lastMessage.content.includes('РЕПЛИКУ')) {
      content = this.generateMockDialogue();
    } else if (lastMessage.content.includes('DALL-E') || lastMessage.content.includes('промпт для генерации')) {
      content = this.generateMockImagePrompt();
    } else {
      content = 'Mock response from LLM adapter. Replace with real implementation.';
    }

    const completionTokens = Math.ceil(content.length / 4);

    return {
      content,
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      model: options?.model || 'mock-gpt-4o-mini',
    };
  }

  private generateMockSession(): string {
    return JSON.stringify({
      title: 'Тени Забытого Королевства',
      synopsis: 'Древнее зло пробуждается в руинах забытой цивилизации. Группе искателей приключений предстоит раскрыть тайну исчезнувшего королевства и остановить надвигающуюся угрозу. Их путь лежит через проклятые земли, населенные нежитью и хранящие секреты давно ушедшей эпохи.',
      setting: 'Forgotten Realms',
      themes: ['mystery', 'ancient ruins', 'undead'],
      estimatedSessions: 10,
      recommendedLevel: '3-7',
      mainPlotPoints: [
        'Таинственный старик нанимает группу для исследования руин',
        'Первые признаки пробуждающейся нежити',
        'Открытие древнего пророчества',
        'Битва с личом в тронном зале',
      ],
      scenes: [
        {
          title: 'Встреча в таверне',
          description: 'Группа собирается в таверне "Золотой Дракон" в небольшом портовом городке. За столом у камина сидит седой старик в потрепанном плаще. Он машет героям, приглашая присоединиться. На столе лежит старая карта с пометками. Старик представляется как Элдрин Мудрый, бывший придворный маг. Он рассказывает о древних руинах на севере, где, по слухам, хранятся артефакты невиданной силы. Предлагает щедрое вознаграждение: 500 золотых и право на половину найденных сокровищ.',
          sceneType: 'social',
          order: 1,
        },
        {
          title: 'Путь через Зачарованный Лес',
          description: 'Двухдневный переход через древний лес. Деревья здесь высокие и старые, их кроны почти не пропускают свет. В воздухе витает запах влажной земли и гниющей листвы. Тропа едва различима. По пути группа замечает странные руны на деревьях — предупреждения на древнем языке. Ночью слышны жуткие звуки: вой, скрежет, шепот. Необходимы проверки на выживание (DC 12) и восприятие (DC 14).',
          sceneType: 'exploration',
          order: 2,
        },
        {
          title: 'Засада волков-оборотней',
          description: 'На второй день пути, когда солнце клонится к закату, группу атакуют три волка-оборотня. Они преследовали героев с самого леса. Бой происходит на небольшой поляне, окруженной густым кустарником. Оборотни используют тактику окружения: двое атакуют спереди, третий пытается зайти с фланга. При снижении хитов ниже половины отступают в лес.',
          sceneType: 'combat',
          order: 3,
          monsters: [
            { name: 'Werewolf', count: 3, cr: 3 },
          ],
        },
        {
          title: 'Руины на горизонте',
          description: 'На третий день путешествия лес редеет, и впереди открывается вид на холмистую местность. На вершине самого высокого холма видны руины — разрушенные башни, пробитые стены, покосившиеся ворота. Даже издалека чувствуется что-то неладное: птицы облетают это место стороной, а воздух кажется холоднее. У подножия холма группа находит старый лагерь — кто-то уже пытался исследовать руины. Среди вещей — дневник с записями о "шепчущих мертвецах".',
          sceneType: 'exploration',
          order: 4,
        },
        {
          title: 'Скелеты-стражи',
          description: 'У главных ворот руин героев встречает отряд нежити. Четыре скелета-воина в ржавых доспехах стоят неподвижно, пока группа не подойдет ближе чем на 20 футов. Тогда они оживают и атакуют. Скелет-командир в более качественной броне командует остальными. Бой происходит у разрушенных ворот. Победив нежить, группа может войти во внутренний двор.',
          sceneType: 'combat',
          order: 5,
          monsters: [
            { name: 'Skeleton', count: 4, cr: 0.25 },
            { name: 'Skeleton Warrior', count: 1, cr: 1 },
          ],
        },
        {
          title: 'Зал Эхо',
          description: 'Огромный церемониальный зал с высокими сводчатыми потолками. Стены украшены выцветшими фресками, изображающими великие битвы прошлого. В центре зала стоит статуя древнего короля, держащего меч. Когда персонажи входят, их шаги создают странное эхо, которое звучит как шепот на незнакомом языке. DC 15 Perception — заметить скрытую дверь за статуей. DC 12 History — распознать изображения на фресках (история падения королевства). Меч статуи можно повернуть, открыв секретный проход.',
          sceneType: 'exploration',
          order: 6,
        },
        {
          title: 'Библиотека мертвых',
          description: 'За секретной дверью находится древняя библиотека. Стеллажи заполнены истлевшими книгами и свитками. В центре — большой стол с раскрытой книгой. Это дневник последнего короля, описывающий предательство верховного жреца и ритуал вечной жизни. Здесь же можно найти карту нижних уровней и предупреждение о лихе-короле в крипте. Среди книг прячутся 4 зомби, которые атакуют, если кто-то попытается взять дневник.',
          sceneType: 'combat',
          order: 7,
          monsters: [
            { name: 'Zombie', count: 4, cr: 0.25 },
          ],
        },
        {
          title: 'Спуск в крипту',
          description: 'Лестница ведет глубоко под землю. Стены покрыты странными рунами, которые слабо светятся зеленоватым светом. Воздух становится холоднее с каждым шагом. Через каждые 20 футов — ловушки: давящие стены (DC 14 Dex save, 2d10 урона), отравленные дротики (DC 12 Dex save, 1d6 урона + яд), и провальный пол (DC 13 Dex save или падение на 20 футов). Проверки на обнаружение ловушек — DC 15 Investigation.',
          sceneType: 'exploration',
          order: 8,
        },
        {
          title: 'Тронный зал Лича',
          description: 'Огромный подземный зал, освещенный призрачным зеленым светом. На троне сидит скелет в королевских регалиях — Лич-Король Валарис. Вокруг него парят магические руны. Он медленно встает со словами: "Наконец-то... новые души для моей армии." Битва эпическая: лич использует заклинания высокого уровня, призывает скелетов на помощь. В зале есть четыре колонны с рунами — их можно разрушить (DC 15 Arcana check), чтобы ослабить лича.',
          sceneType: 'combat',
          order: 9,
          monsters: [
            { name: 'Lich', count: 1, cr: 21 },
            { name: 'Skeleton', count: 6, cr: 0.25 },
          ],
        },
        {
          title: 'Эпилог: Возвращение героев',
          description: 'После поражения лича его филактерия трескается, и он рассыпается в прах. Проклятие снимается с земель, и руины начинают рушиться. Группа спешно покидает подземелье, захватив сокровища: корону лича (артефакт), 5000 золотых, магический меч +2, зелье высшего лечения x3, и свиток возрождения. В городе их встречают как героев. Элдрин выполняет обещание и делится сокровищами. Земли вокруг руин начинают оживать — возвращаются птицы, зеленеет трава. Королевство спасено.',
          sceneType: 'story',
          order: 10,
        },
      ],
      npcs: [
        {
          name: 'Элдрин Мудрый',
          race: 'Человек',
          class: 'Волшебник',
          level: 12,
          alignment: 'Lawful Good',
          role: 'Квестодатель и наставник',
          personality: 'Мудрый, но эксцентричный. Говорит загадками и цитирует древние тексты. Всегда спокоен, даже в опасности.',
          backstory: 'Бывший придворный маг королевства Арандор. Служил королю 30 лет, пока не ушел на покой после Великой войны с драконами. Последние 15 лет живет отшельником, изучая древние тексты. Узнал о пробуждении лича и понял, что не может справиться в одиночку. Ищет достойных героев.',
          appearance: 'Старик 70+ лет с длинной седой бородой, заплетенной в косу. Проницательные голубые глаза. Носит потрепанный синий плащ с вышитыми звездами. Всегда с посохом из темного дерева.',
          motivations: 'Хочет передать знания новому поколению и искупить вину за то, что не смог предотвратить падение древнего королевства.',
          stats: { STR: 8, DEX: 12, CON: 14, INT: 20, WIS: 16, CHA: 13 },
        },
        {
          name: 'Лич-Король Валарис',
          race: 'Нежить (бывший эльф)',
          class: 'Некромант',
          level: 20,
          alignment: 'Lawful Evil',
          role: 'Главный антагонист',
          personality: 'Высокомерный и жестокий. Считает смертных низшими существами. Одержим идеей вечной жизни и власти над смертью.',
          backstory: 'Тысячу лет назад был верховным жрецом королевства. Предал короля, выполнив запретный ритуал превращения в лича. Был побежден и заточен в крипте, но проклятие ослабело, и он начал пробуждаться.',
          appearance: 'Скелет в истлевших королевских одеждах. Пустые глазницы светятся зеленым огнем. Корона из черного металла на черепе. В руке — посох из кости с парящим черепом на вершине.',
          motivations: 'Воскресить армию мертвых и покорить земли живых. Отомстить потомкам тех, кто его запечатал.',
          stats: { STR: 11, DEX: 16, CON: 16, INT: 20, WIS: 14, CHA: 16 },
        },
        {
          name: 'Торвальд Каменная Борода',
          race: 'Горный дварф',
          class: 'Клерик',
          level: 5,
          alignment: 'Lawful Good',
          role: 'Возможный союзник/компаньон',
          personality: 'Прямолинеен и честен. Ценит традиции и долг превыше всего. Упрям как скала. Обожает хорошее пиво и истории о героях прошлого.',
          backstory: 'Страж священных залов клана Каменный Молот. Отправился в путешествие после кражи священного молота предков. След привел к руинам, где орки продали артефакт темным силам.',
          appearance: 'Коренастый дварф 150 лет с длинной рыжей бородой в косах. Шрамы на лице и руках. Носит тяжелую кольчугу с символом Моради. Боевой молот всегда при нем.',
          motivations: 'Вернуть честь клану, найдя священный молот. Очистить земли от нежити как долг перед Моради.',
          stats: { STR: 16, DEX: 10, CON: 16, INT: 10, WIS: 18, CHA: 12 },
        },
        {
          name: 'Лира Ночная Тень',
          race: 'Полуэльф',
          class: 'Плут',
          level: 4,
          alignment: 'Chaotic Neutral',
          role: 'Информатор и контрабандист',
          personality: 'Остроумная и саркастичная. Не доверяет властям. Всегда ищет выгоду, но имеет моральный кодекс — не вредит невинным.',
          backstory: 'Выросла на улицах портового города. Работает на воровскую гильдию, но имеет свои планы. Слышала слухи о руинах и сокровищах. Может предложить информацию или услуги за разумную плату.',
          appearance: 'Стройная девушка 25 лет с темными волосами и зелеными глазами. Всегда одета в темную кожаную броню. Множество скрытых кинжалов и карманов. Легкая походка.',
          motivations: 'Разбогатеть и уйти из воровской гильдии. Отомстить дворянину, убившему ее отца.',
          stats: { STR: 10, DEX: 18, CON: 12, INT: 14, WIS: 13, CHA: 16 },
        },
        {
          name: 'Отец Маркус',
          race: 'Человек',
          class: 'Жрец',
          level: 6,
          alignment: 'Neutral Good',
          role: 'Местный священник и целитель',
          personality: 'Добрый и сострадательный. Верит в искупление даже для грешников. Страдает от сомнений в вере после гибели прихожан от нежити.',
          backstory: 'Служит в храме Латандера в городе 20 лет. Потерял жену и дочь в набеге нежити 5 лет назад. С тех пор посвятил жизнь помощи другим и борьбе с темными силами.',
          appearance: 'Мужчина средних лет с седеющими волосами. Добрые карие глаза, но усталый взгляд. Носит простую рясу белого цвета с символом восходящего солнца.',
          motivations: 'Защитить город от угрозы нежити. Найти смысл в трагедии и восстановить веру.',
          stats: { STR: 12, DEX: 10, CON: 14, INT: 13, WIS: 17, CHA: 14 },
        },
      ],
    }, null, 2);
  }

  private generateMockScene(): string {
    return JSON.stringify({
      title: 'Зал Эхо',
      description: 'Огромный зал с высокими сводчатыми потолками. Стены украшены выцветшими фресками, изображающими великие битвы прошлого. В центре зала стоит статуя древнего короля, держащего меч. Когда персонажи входят, их шаги создают странное эхо, которое звучит как шепот на незнакомом языке.',
      sceneType: 'exploration',
      challenges: [
        'DC 15 Perception чтобы заметить скрытую дверь',
        'DC 12 History чтобы распознать изображения на фресках',
      ],
      atmosphere: 'Тревожная тишина, прерываемая только эхом. Воздух холодный и влажный.',
      secrets: [
        'Меч статуи можно повернуть, открыв секретную дверь',
        'Фрески рассказывают о падении королевства',
      ],
    }, null, 2);
  }

  private generateMockNPC(): string {
    return JSON.stringify({
      name: 'Торвальд Каменная Борода',
      race: 'Горный дварф',
      class: 'Клерик',
      level: 5,
      alignment: 'Lawful Good',
      personality: {
        traits: 'Прямолинеен и честен, ценит традиции',
        ideals: 'Долг превыше всего',
        bonds: 'Хранит память о павших товарищах',
        flaws: 'Упрям как скала',
      },
      appearance: 'Коренастый дварф с длинной рыжей бородой, заплетенной в косы. Носит тяжелую кольчугу с символом Моради.',
      backstory: 'Бывший страж священных залов клана Каменный Молот. Отправился в путешествие, чтобы найти реликвию клана, украденную орками.',
      motivations: 'Вернуть честь клану, найдя священный молот предков',
      stats: {
        STR: 16,
        DEX: 10,
        CON: 16,
        INT: 10,
        WIS: 18,
        CHA: 12,
      },
      equipment: ['Боевой молот +1', 'Щит с гербом клана', 'Святой символ Моради'],
    }, null, 2);
  }

  private generateMockSceneNPCs(): string {
    return JSON.stringify({
      scene_id: 1,
      npcs: [
        {
          name: 'Элара Лунный Свет',
          race: 'Высший эльф',
          class: 'Волшебник',
          level: 4,
          alignment: 'Neutral Good',
          appearance: 'Изящная эльфийка с серебристыми волосами и проницательными фиолетовыми глазами. Носит синюю мантию, расшитую звездами.',
          personality: 'Любознательна и осторожна. Говорит загадками и любит наблюдать за людьми прежде чем доверять им.',
          backstory: 'Исследовательница древних магических артефактов. Прибыла в эти места в поисках утраченных знаний.',
          motivations: 'Найти древний магический фолиант, который, по слухам, спрятан в этих руинах',
          role_in_scene: 'информатор',
          hidden_agenda: 'На самом деле работает на тайную организацию магов и ищет артефакт для них',
          stats: {
            STR: 8,
            DEX: 14,
            CON: 12,
            INT: 18,
            WIS: 13,
            CHA: 10,
          },
          interaction_options: {
            if_players_fight: 'Попытается телепортироваться прочь, но может оставить ценную подсказку',
            if_players_negotiate: 'Поделится информацией о локации в обмен на помощь в поисках',
            if_players_ignore: 'Будет следовать за группой издалека, наблюдая за их действиями',
          },
        },
        {
          name: 'Громбар Железный Кулак',
          race: 'Горный дварф',
          class: 'Воин',
          level: 5,
          alignment: 'Lawful Neutral',
          appearance: 'Массивный дварф с шрамом через левый глаз. Носит потрепанную кольчугу и большой боевой топор.',
          personality: 'Прямолинеен и недоверчив. Ценит силу и честность. Не любит магию и тех, кто ее использует.',
          backstory: 'Бывший наемник, потерявший отряд в этих руинах год назад. Вернулся, чтобы найти их останки.',
          motivations: 'Отомстить существам, убившим его товарищей, и вернуть их оружие',
          role_in_scene: 'гид',
          hidden_agenda: 'Знает о ловушках в руинах, но не расскажет о них, пока не убедится в надежности группы',
          stats: {
            STR: 18,
            DEX: 10,
            CON: 16,
            INT: 8,
            WIS: 12,
            CHA: 9,
          },
          interaction_options: {
            if_players_fight: 'Будет сражаться до последнего, но уважает достойных противников',
            if_players_negotiate: 'Согласится помочь, если группа поклянется помочь ему отомстить',
            if_players_ignore: 'Пойдет своим путем, но может случайно активировать ловушку, предупредив группу',
          },
        },
        {
          name: 'Тень (настоящее имя неизвестно)',
          race: 'Полуэльф',
          class: 'Плут',
          level: 3,
          alignment: 'Chaotic Neutral',
          appearance: 'Худощавый полуэльф в темном плаще с капюшоном. Лицо скрыто, видны только острые зеленые глаза.',
          personality: 'Скрытный и саркастичный. Говорит мало, но метко. Не доверяет никому.',
          backstory: 'Вор и контрабандист, использующий руины как тайник для краденого. Не хочет, чтобы кто-то узнал об этом месте.',
          motivations: 'Защитить свой тайник и избавиться от незваных гостей',
          role_in_scene: 'мешает',
          hidden_agenda: 'Спрятал в руинах украденную корону, за которую назначена большая награда',
          stats: {
            STR: 10,
            DEX: 18,
            CON: 12,
            INT: 14,
            WIS: 11,
            CHA: 13,
          },
          interaction_options: {
            if_players_fight: 'Попытается скрыться в тенях и сбежать, возможно устроив засаду позже',
            if_players_negotiate: 'Может заключить сделку, если группа пообещает не трогать его тайник',
            if_players_ignore: 'Будет красть у группы мелкие предметы и подбрасывать ложные улики',
          },
        },
      ],
    }, null, 2);
  }

  private generateMockEncounter(): string {
    return JSON.stringify({
      title: 'Засада гоблинов',
      encounterType: 'combat',
      difficulty: 'medium',
      description: 'На узкой лесной тропе группа попадает в засаду гоблинов. Несколько гоблинов прячутся на деревьях, готовые осыпать героев стрелами.',
      monsters: [
        { name: 'Goblin', count: 6, cr: 0.25, hp: 7, ac: 15 },
        { name: 'Goblin Boss', count: 1, cr: 1, hp: 21, ac: 17 },
      ],
      environment: 'Лесная тропа, деревья обеспечивают укрытие (3/4 cover)',
      tactics: 'Гоблины атакуют из засады. Стрелки на деревьях, босс командует с задней линии. При потере половины отряда - отступают.',
      initiative: [
        'Goblin Archers (Dex +2)',
        'Goblin Boss (Dex +2)',
        'Goblin Warriors (Dex +2)',
      ],
      rewards: {
        gold: 45,
        items: ['Зелье лечения', 'Карта местности'],
      },
      estimatedLevel: 2,
    }, null, 2);
  }

  private generateMockName(): string {
    return JSON.stringify({
      name: 'Торвальд Железный Кулак',
      nickname: 'Железный',
      flavor: 'Имя дано за невероятную силу и упорство в бою',
    }, null, 2);
  }

  private generateMockQuickNPC(): string {
    return JSON.stringify({
      name: 'Гарольд',
      race: 'Человек',
      appearance: 'Полноватый мужчина средних лет с залысиной и добрым лицом. Носит фартук, испачканный пивом.',
      personality: 'Дружелюбный и болтливый, любит посплетничать',
      quirk: 'Постоянно протирает кружки, даже когда говорит',
      catchphrase: 'Эх, я бы вам рассказал, да язык мой - враг мой!',
      secret: 'Раньше был контрабандистом и знает все тайные тропы в округе',
    }, null, 2);
  }

  private generateMockEvent(): string {
    return JSON.stringify({
      title: 'Уличная потасовка',
      description: 'На рыночной площади двое пьяных моряков затеяли драку. Один уже достал нож. Толпа собирается вокруг, но никто не вмешивается. Стража где-то далеко.',
      possibleActions: [
        'Вмешаться и остановить драку',
        'Отвлечь одного из драчунов',
        'Пройти мимо, не вмешиваясь',
      ],
      consequences: {
        if_help: 'Один из моряков окажется членом местной гильдии. Он будет благодарен и предложит услугу',
        if_ignore: 'Драка перерастет в массовую потасовку, стража закроет район на несколько часов',
      },
    }, null, 2);
  }

  private generateMockLoot(): string {
    return JSON.stringify({
      items: [
        {
          name: 'Потёртый медальон',
          description: 'Серебряный медальон с выцветшим гербом неизвестного дома',
          value: '15 золотых',
          interesting_detail: 'На обратной стороне выгравирована надпись на эльфийском: "Помни клятву"',
          potential_use: 'Может быть знаком знатного рода или ключом к квесту',
        },
        {
          name: 'Связка старых ключей',
          description: 'Пять ржавых ключей на кольце',
          value: '1 золотой',
          interesting_detail: 'Один ключ выглядит необычно новым',
          potential_use: 'Могут открывать что-то важное в городе',
        },
      ],
      total_gold: '8 золотых',
    }, null, 2);
  }

  private generateMockLocation(): string {
    return JSON.stringify({
      name: 'Таверна "Спящий Дракон"',
      description: 'Уютное заведение с низкими балочными потолками и большим каменным камином в центре зала. Пахнет жареным мясом, пивом и дымом. Слышен гул разговоров и смех посетителей. Тепло и шумно.',
      key_features: [
        'Большой камин с горящими дровами',
        'Бар из темного дуба с множеством бочек',
        'Лестница на второй этаж с комнатами',
      ],
      hidden_details: [
        'За баром есть потайная дверь в подвал',
        'Один из постояльцев явно следит за группой',
      ],
      atmosphere_note: 'Атмосфера располагает к расслаблению, но внимательные заметят напряжение среди некоторых посетителей',
    }, null, 2);
  }

  private generateMockComplication(): string {
    return JSON.stringify({
      title: 'Обрушение потолка',
      description: 'От мощного удара заклинания трескается опорная балка, и часть потолка начинает обрушиваться! Камни и деревянные обломки падают в центр зала боя.',
      mechanical_effect: 'Dex save DC 14 для всех в центральной зоне, провал = 2d6 дробящего урона. Центр зала становится труднопроходимой местностью',
      how_to_resolve: 'Можно отойти к стенам (безопасная зона) или использовать заклинания контроля окружения',
    }, null, 2);
  }

  private generateMockTwist(): string {
    return JSON.stringify({
      title: 'Союзник — предатель',
      revelation: 'NPC, который помогал группе с самого начала, оказывается шпионом антагониста. Он тайно передавал информацию о передвижениях и планах партии. Все "случайные" засады были организованы.',
      implications: [
        'Враги знают слабости партии и могут подготовить ловушки',
        'Доверять новым союзникам станет сложнее',
      ],
      how_to_introduce: 'Группа перехватывает зашифрованное послание или случайно застает NPC за разговором с вражеским агентом',
    }, null, 2);
  }

  private generateMockDialogue(): string {
    return JSON.stringify({
      dialogue_options: [
        'Добро пожаловать, путники! Чем могу служить? У нас лучший эль в округе!',
        'Эм... здравствуйте. Что вам нужно? Только не шумите, у меня голова болит',
        'И что вам здесь надо? Видите, я занят. Покупайте что-нибудь или проваливайте',
        'Ох, новые лица! Проходите, проходите... Говорят, на севере творятся странные дела. Слыхали что-нибудь?',
      ],
      body_language: 'Протирает стакан круговыми движениями, не отрывая взгляда от посетителей',
      voice_note: 'Говорит с лёгким хрипом, голос низкий и немного усталый',
    }, null, 2);
  }

  private generateMockImagePrompt(): string {
    return JSON.stringify({
      prompt: 'A dramatic fantasy battle scene in D&D style, featuring heroic adventurers fighting against fearsome monsters in a dark dungeon, epic lighting, cinematic composition, detailed characters and environment',
      size: '1024x1024',
      style: 'fantasy_art',
    }, null, 2);
  }
}

/**
 * DeepSeek адаптер (дешевле OpenAI)
 * API совместим с OpenAI, но в ~10 раз дешевле
 */
class DeepSeekAdapter implements LLMAdapter {
  private apiKey: string;
  private baseURL: string = 'https://api.deepseek.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    console.log('=== DeepSeek API Call ===');
    console.log('Max tokens requested:', options?.maxTokens || 4000);
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    console.log('=== DeepSeek Response ===');
    console.log('Tokens used:', data.usage.total_tokens);
    console.log('Completion tokens:', data.usage.completion_tokens);
    console.log('Finish reason:', choice.finish_reason);
    
    if (choice.finish_reason !== 'stop') {
      console.warn('⚠️ Response may be incomplete! Finish reason:', choice.finish_reason);
    }

    return {
      content: choice.message.content,
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
      model: data.model,
    };
  }
}

/**
 * OpenAI адаптер (для продакшена)
 */
class OpenAIAdapter implements LLMAdapter {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async complete(messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
      model: data.model,
    };
  }
}

/**
 * Фабрика для создания LLM адаптера
 */
export function createLLMAdapter(): LLMAdapter {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Приоритет: DeepSeek → OpenAI → Mock
  if (deepseekKey && deepseekKey.length > 0) {
    console.log('✅ Using DeepSeek API (deepseek-chat)');
    return new DeepSeekAdapter(deepseekKey);
  }

  if (openaiKey && openaiKey.length > 0) {
    console.log('✅ Using OpenAI API');
    return new OpenAIAdapter(openaiKey);
  }

  console.warn('⚠️  Using Mock LLM Adapter. Set DEEPSEEK_API_KEY or OPENAI_API_KEY for production.');
  return new MockLLMAdapter();
}

// Экспортируем дефолтный адаптер
export const llm = createLLMAdapter();

/**
 * Вспомогательная функция для быстрой генерации контента
 */
export async function generateContent(
  messages: LLMMessage[],
  options?: LLMOptions
): Promise<{
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}> {
  const response = await llm.complete(messages, options);
  return {
    content: response.content,
    usage: {
      promptTokens: response.promptTokens,
      completionTokens: response.completionTokens,
      totalTokens: response.totalTokens,
    },
    model: response.model,
  };
}

