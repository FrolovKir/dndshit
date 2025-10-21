'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Input from '@/components/Input';

// Типы для результатов генерации
interface GenerationResult {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
}

export default function ImprovisationPage() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Параметры для генераторов
  const [nameType, setNameType] = useState<'person' | 'place' | 'tavern' | 'organization'>('person');
  const [nameRace, setNameRace] = useState('');
  const [nameStyle, setNameStyle] = useState<'common' | 'exotic' | 'dark' | 'noble'>('common');

  const [npcRole, setNpcRole] = useState('');
  const [npcMood, setNpcMood] = useState<'friendly' | 'suspicious' | 'hostile' | 'indifferent' | 'comedic' | 'mysterious'>('friendly');
  const [npcRace, setNpcRace] = useState('');

  const [eventLocation, setEventLocation] = useState<'city' | 'wilderness' | 'dungeon' | 'tavern' | 'road'>('city');
  const [eventTone, setEventTone] = useState<'neutral' | 'dangerous' | 'comedic' | 'mysterious' | 'dramatic'>('neutral');

  const [lootSource, setLootSource] = useState<'pocket' | 'chest' | 'corpse' | 'ruins' | 'treasure'>('chest');
  const [lootValue, setLootValue] = useState<'worthless' | 'common' | 'valuable' | 'magical'>('common');

  const [locationType, setLocationType] = useState<'room' | 'building' | 'outdoor' | 'encounter_site'>('room');
  const [locationStyle, setLocationStyle] = useState('');
  const [locationAtmosphere, setLocationAtmosphere] = useState<'welcoming' | 'creepy' | 'mysterious' | 'dangerous' | 'peaceful'>('welcoming');

  const [complicationEnvironment, setComplicationEnvironment] = useState('');
  const [twistContext, setTwistContext] = useState('');
  const [twistIntensity, setTwistIntensity] = useState<'minor' | 'moderate' | 'major'>('moderate');

  const [dialogueNpcType, setDialogueNpcType] = useState('');
  const [dialogueSituation, setDialogueSituation] = useState('');

  const generateQuick = async (type: string, params: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, params }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      // Добавить в историю
      const result: GenerationResult = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        timestamp: new Date(),
        data: data.data,
      };

      setHistory([result, ...history]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id: string) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  // Функции генерации
  const generateName = () => {
    generateQuick('name', {
      type: nameType,
      race: nameRace || undefined,
      style: nameStyle,
    });
  };

  const generateNPC = () => {
    if (!npcRole) {
      setError('Укажите роль NPC (например: бармен, стражник, торговец)');
      return;
    }
    generateQuick('npc', {
      role: npcRole,
      mood: npcMood,
      race: npcRace || undefined,
    });
  };

  const generateEvent = () => {
    generateQuick('event', {
      location: eventLocation,
      tone: eventTone,
    });
  };

  const generateLoot = () => {
    generateQuick('loot', {
      source: lootSource,
      value: lootValue,
    });
  };

  const generateLocation = () => {
    generateQuick('location', {
      type: locationType,
      style: locationStyle || undefined,
      atmosphere: locationAtmosphere,
    });
  };

  const generateComplication = () => {
    generateQuick('complication', {
      environment: complicationEnvironment || undefined,
    });
  };

  const generateTwist = () => {
    generateQuick('twist', {
      context: twistContext || undefined,
      intensity: twistIntensity,
    });
  };

  const generateDialogue = () => {
    if (!dialogueNpcType || !dialogueSituation) {
      setError('Укажите тип NPC и ситуацию');
      return;
    }
    generateQuick('dialogue', {
      npcType: dialogueNpcType,
      situation: dialogueSituation,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">⚡ Панель импровизации</h1>
        <p className="text-gray-400">
          Быстрая генерация всего, что нужно мастеру на ходу
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Генераторы в сетке */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Генератор имён */}
        <Card>
          <h3 className="text-xl font-bold mb-4">🎭 Имена</h3>
          <div className="space-y-3">
            <Select
              label="Тип"
              value={nameType}
              onChange={(e) => setNameType(e.target.value as any)}
            >
              <option value="person">Персонаж</option>
              <option value="place">Место</option>
              <option value="tavern">Таверна</option>
              <option value="organization">Организация</option>
            </Select>

            {nameType === 'person' && (
              <>
                <Input
                  label="Раса (опц.)"
                  value={nameRace}
                  onChange={(e) => setNameRace(e.target.value)}
                  placeholder="Эльф, дварф, человек..."
                />
                <Select
                  label="Стиль"
                  value={nameStyle}
                  onChange={(e) => setNameStyle(e.target.value as any)}
                >
                  <option value="common">Обычное</option>
                  <option value="exotic">Экзотическое</option>
                  <option value="dark">Тёмное</option>
                  <option value="noble">Благородное</option>
                </Select>
              </>
            )}

            <Button onClick={generateName} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>

        {/* 2. Быстрый NPC */}
        <Card>
          <h3 className="text-xl font-bold mb-4">👤 Быстрый NPC</h3>
          <div className="space-y-3">
            <Input
              label="Роль"
              value={npcRole}
              onChange={(e) => setNpcRole(e.target.value)}
              placeholder="Бармен, стражник, торговец..."
            />
            <Input
              label="Раса (опц.)"
              value={npcRace}
              onChange={(e) => setNpcRace(e.target.value)}
              placeholder="Человек, эльф, дварф..."
            />
            <Select
              label="Настроение"
              value={npcMood}
              onChange={(e) => setNpcMood(e.target.value as any)}
            >
              <option value="friendly">Дружелюбный</option>
              <option value="suspicious">Подозрительный</option>
              <option value="hostile">Враждебный</option>
              <option value="indifferent">Безразличный</option>
              <option value="comedic">Комичный</option>
              <option value="mysterious">Загадочный</option>
            </Select>

            <Button onClick={generateNPC} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>

        {/* 3. Случайное событие */}
        <Card>
          <h3 className="text-xl font-bold mb-4">🎲 Событие</h3>
          <div className="space-y-3">
            <Select
              label="Локация"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value as any)}
            >
              <option value="city">Город</option>
              <option value="wilderness">Дикая местность</option>
              <option value="dungeon">Подземелье</option>
              <option value="tavern">Таверна</option>
              <option value="road">Дорога</option>
            </Select>
            <Select
              label="Тон"
              value={eventTone}
              onChange={(e) => setEventTone(e.target.value as any)}
            >
              <option value="neutral">Нейтральный</option>
              <option value="dangerous">Опасный</option>
              <option value="comedic">Комичный</option>
              <option value="mysterious">Загадочный</option>
              <option value="dramatic">Драматичный</option>
            </Select>

            <Button onClick={generateEvent} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>

        {/* 4. Находки/Лут */}
        <Card>
          <h3 className="text-xl font-bold mb-4">💎 Находки</h3>
          <div className="space-y-3">
            <Select
              label="Источник"
              value={lootSource}
              onChange={(e) => setLootSource(e.target.value as any)}
            >
              <option value="pocket">Карман</option>
              <option value="chest">Сундук</option>
              <option value="corpse">Труп</option>
              <option value="ruins">Руины</option>
              <option value="treasure">Сокровищница</option>
            </Select>
            <Select
              label="Ценность"
              value={lootValue}
              onChange={(e) => setLootValue(e.target.value as any)}
            >
              <option value="worthless">Бесполезное</option>
              <option value="common">Обычное</option>
              <option value="valuable">Ценное</option>
              <option value="magical">Магическое</option>
            </Select>

            <Button onClick={generateLoot} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>

        {/* 5. Описание локации */}
        <Card>
          <h3 className="text-xl font-bold mb-4">🏰 Локация</h3>
          <div className="space-y-3">
            <Select
              label="Тип"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as any)}
            >
              <option value="room">Комната</option>
              <option value="building">Здание</option>
              <option value="outdoor">Внешняя локация</option>
              <option value="encounter_site">Место столкновения</option>
            </Select>
            <Input
              label="Стиль (опц.)"
              value={locationStyle}
              onChange={(e) => setLocationStyle(e.target.value)}
              placeholder="Таверна, храм, лес..."
            />
            <Select
              label="Атмосфера"
              value={locationAtmosphere}
              onChange={(e) => setLocationAtmosphere(e.target.value as any)}
            >
              <option value="welcoming">Приветливая</option>
              <option value="creepy">Жуткая</option>
              <option value="mysterious">Загадочная</option>
              <option value="dangerous">Опасная</option>
              <option value="peaceful">Мирная</option>
            </Select>

            <Button onClick={generateLocation} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>

        {/* 6. Осложнение в бою */}
        <Card>
          <h3 className="text-xl font-bold mb-4">⚔️ Осложнение</h3>
          <div className="space-y-3">
            <Input
              label="Окружение (опц.)"
              value={complicationEnvironment}
              onChange={(e) => setComplicationEnvironment(e.target.value)}
              placeholder="Лес, пещера, город..."
            />
            <p className="text-sm text-gray-400">
              Добавляет неожиданный элемент в бой
            </p>

            <Button onClick={generateComplication} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>

        {/* 7. Сюжетный твист */}
        <Card>
          <h3 className="text-xl font-bold mb-4">🔮 Твист</h3>
          <div className="space-y-3">
            <Input
              label="Контекст (опц.)"
              value={twistContext}
              onChange={(e) => setTwistContext(e.target.value)}
              placeholder="Текущая ситуация..."
            />
            <Select
              label="Интенсивность"
              value={twistIntensity}
              onChange={(e) => setTwistIntensity(e.target.value as any)}
            >
              <option value="minor">Лёгкий</option>
              <option value="moderate">Средний</option>
              <option value="major">Серьёзный</option>
            </Select>

            <Button onClick={generateTwist} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>

        {/* 8. Диалог NPC */}
        <Card>
          <h3 className="text-xl font-bold mb-4">💬 Диалог</h3>
          <div className="space-y-3">
            <Input
              label="Тип NPC"
              value={dialogueNpcType}
              onChange={(e) => setDialogueNpcType(e.target.value)}
              placeholder="Стражник, торговец, мудрец..."
            />
            <Input
              label="Ситуация"
              value={dialogueSituation}
              onChange={(e) => setDialogueSituation(e.target.value)}
              placeholder="Допрос, торговля, просьба о помощи..."
            />

            <Button onClick={generateDialogue} disabled={loading} fullWidth>
              {loading ? 'Генерация...' : 'Сгенерировать'}
            </Button>
          </div>
        </Card>
      </div>

      {/* История генерации */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">📜 История генерации</h2>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Очистить всё
            </Button>
          </div>

          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="relative">
                <button
                  onClick={() => removeFromHistory(item.id)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                  title="Удалить"
                >
                  ✕
                </button>

                <div className="mb-2 flex items-center space-x-2">
                  <span className="text-primary font-bold">
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.timestamp.toLocaleTimeString('ru-RU')}
                  </span>
                </div>

                <div className="text-gray-300">
                  {renderGenerationResult(item.type, item.data)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Вспомогательные функции
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    name: '🎭 Имя',
    npc: '👤 NPC',
    event: '🎲 Событие',
    loot: '💎 Находка',
    location: '🏰 Локация',
    complication: '⚔️ Осложнение',
    twist: '🔮 Твист',
    dialogue: '💬 Диалог',
  };
  return labels[type] || type;
}

function renderGenerationResult(type: string, data: any) {
  switch (type) {
    case 'name':
      return (
        <div>
          <p className="text-xl font-bold text-primary mb-1">{data.name}</p>
          {data.nickname && <p className="text-sm text-gray-400 mb-2">Прозвище: {data.nickname}</p>}
          <p className="text-sm">{data.flavor}</p>
        </div>
      );

    case 'npc':
      return (
        <div>
          <p className="text-xl font-bold text-primary mb-1">{data.name}</p>
          <p className="text-sm text-gray-400 mb-2">{data.race}</p>
          <p className="mb-2">{data.appearance}</p>
          <p className="text-sm mb-1"><strong>Характер:</strong> {data.personality}</p>
          <p className="text-sm mb-1"><strong>Причуда:</strong> {data.quirk}</p>
          {data.catchphrase && <p className="text-sm italic text-primary">"{data.catchphrase}"</p>}
          {data.secret && <p className="text-sm mt-2 text-yellow-400">🔒 Секрет: {data.secret}</p>}
        </div>
      );

    case 'event':
      return (
        <div>
          <p className="text-xl font-bold text-primary mb-2">{data.title}</p>
          <p className="mb-3">{data.description}</p>
          <div className="mb-2">
            <p className="text-sm font-bold text-gray-400 mb-1">Что могут сделать игроки:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.possibleActions.map((action: string, i: number) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
          <div className="text-sm space-y-1">
            <p><strong className="text-green-400">Если помогут:</strong> {data.consequences.if_help}</p>
            <p><strong className="text-gray-400">Если проигнорируют:</strong> {data.consequences.if_ignore}</p>
          </div>
        </div>
      );

    case 'loot':
      return (
        <div>
          {data.items.map((item: any, i: number) => (
            <div key={i} className="mb-3">
              <p className="font-bold text-primary">{item.name}</p>
              <p className="text-sm mb-1">{item.description}</p>
              <p className="text-sm text-yellow-400">Стоимость: {item.value}</p>
              {item.interesting_detail && (
                <p className="text-sm text-gray-400 italic">✨ {item.interesting_detail}</p>
              )}
              {item.potential_use && (
                <p className="text-sm text-blue-400">💡 {item.potential_use}</p>
              )}
            </div>
          ))}
          {data.total_gold && <p className="text-yellow-400 font-bold">💰 Золото: {data.total_gold}</p>}
        </div>
      );

    case 'location':
      return (
        <div>
          <p className="text-xl font-bold text-primary mb-2">{data.name}</p>
          <p className="mb-3">{data.description}</p>
          <div className="mb-2">
            <p className="text-sm font-bold text-gray-400 mb-1">Ключевые особенности:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.key_features.map((feature: string, i: number) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>
          </div>
          <div className="mb-2">
            <p className="text-sm font-bold text-gray-400 mb-1">Скрытые детали:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.hidden_details.map((detail: string, i: number) => (
                <li key={i} className="text-yellow-400">{detail}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm italic text-gray-500 mt-2">💭 {data.atmosphere_note}</p>
        </div>
      );

    case 'complication':
      return (
        <div>
          <p className="text-xl font-bold text-primary mb-2">{data.title}</p>
          <p className="mb-2">{data.description}</p>
          <p className="text-sm mb-2"><strong className="text-red-400">Эффект:</strong> {data.mechanical_effect}</p>
          <p className="text-sm"><strong className="text-blue-400">Как справиться:</strong> {data.how_to_resolve}</p>
        </div>
      );

    case 'twist':
      return (
        <div>
          <p className="text-xl font-bold text-primary mb-2">{data.title}</p>
          <p className="mb-3">{data.revelation}</p>
          <div className="mb-2">
            <p className="text-sm font-bold text-gray-400 mb-1">Последствия:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {data.implications.map((impl: string, i: number) => (
                <li key={i}>{impl}</li>
              ))}
            </ul>
          </div>
          <p className="text-sm italic text-blue-400 mt-2">💡 Как ввести: {data.how_to_introduce}</p>
        </div>
      );

    case 'dialogue':
      return (
        <div>
          <div className="mb-3">
            <p className="text-sm font-bold text-gray-400 mb-2">Варианты реплик:</p>
            <ul className="space-y-2">
              {data.dialogue_options.map((option: string, i: number) => (
                <li key={i} className="text-sm italic text-primary">"{option}"</li>
              ))}
            </ul>
          </div>
          <p className="text-sm mb-1"><strong>Язык тела:</strong> {data.body_language}</p>
          <p className="text-sm"><strong>Голос:</strong> {data.voice_note}</p>
        </div>
      );

    default:
      return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
  }
}

