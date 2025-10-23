'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Textarea from '@/components/Textarea';
import Input from '@/components/Input';

type ImageType = 'character' | 'location' | 'item' | 'scene';

interface GeneratedImage {
  id: string;
  type: ImageType;
  imageUrl: string;
  originalPrompt: string;
  revisedPrompt: string;
  description: string;
  timestamp: Date;
  size: string;
}

export default function VisualizePage() {
  const [activeTab, setActiveTab] = useState<ImageType>('character');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  // Общие параметры
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('fantasy_art');

  // Параметры персонажа
  const [race, setRace] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [age, setAge] = useState('');
  const [mood, setMood] = useState('');

  // Параметры локации
  const [locationType, setLocationType] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<'dawn' | 'day' | 'sunset' | 'night'>('day');
  const [weather, setWeather] = useState<'clear' | 'fog' | 'rain' | 'snow' | 'storm'>('clear');
  const [atmosphere, setAtmosphere] = useState('');

  // Параметры предмета
  const [itemType, setItemType] = useState('');
  const [rarity, setRarity] = useState<'common' | 'uncommon' | 'rare' | 'legendary'>('uncommon');
  const [magicalEffect, setMagicalEffect] = useState('');

  // Параметры сцены
  const [scale, setScale] = useState<'duel' | 'skirmish' | 'battle' | 'war'>('skirmish');
  const [environment, setEnvironment] = useState('');

  const generateImage = async () => {
    if (!description.trim()) {
      setError('Введите описание');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        type: activeTab,
        description,
        style,
      };

      // Добавляем параметры в зависимости от типа
      if (activeTab === 'character') {
        if (race) params.race = race;
        if (characterClass) params.characterClass = characterClass;
        if (age) params.age = age;
        if (mood) params.mood = mood;
      } else if (activeTab === 'location') {
        if (locationType) params.locationType = locationType;
        params.timeOfDay = timeOfDay;
        params.weather = weather;
        if (atmosphere) params.atmosphere = atmosphere;
      } else if (activeTab === 'item') {
        if (itemType) params.itemType = itemType;
        params.rarity = rarity;
        if (magicalEffect) params.magicalEffect = magicalEffect;
      } else if (activeTab === 'scene') {
        params.scale = scale;
        if (environment) params.environment = environment;
      }

      const response = await fetch('/api/generate/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Generation failed');
      }

      // Добавляем в историю
      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substr(2, 9),
        type: activeTab,
        imageUrl: data.imageUrl,
        originalPrompt: data.originalPrompt,
        revisedPrompt: data.revisedPrompt,
        description,
        timestamp: new Date(),
        size: data.size,
      };

      setHistory([newImage, ...history]);
      setDescription(''); // Очищаем поле
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Не удалось скачать изображение');
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id: string) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  const tabs = [
    { id: 'character', label: '👤 Персонаж', icon: '👤' },
    { id: 'location', label: '🏰 Локация', icon: '🏰' },
    { id: 'item', label: '⚔️ Предмет', icon: '⚔️' },
    { id: 'scene', label: '⚡ Сцена', icon: '⚡' },
  ];

  const examples = {
    character: [
      'Старый дварф-кузнец с огненно-рыжей бородой, мускулистый, в кожаном фартуке, держит молот, лицо в шрамах от искр',
      'Молодая эльфийка-друид с длинными белыми волосами, цветы в волосах, зелёные глаза, связь с природой',
      'Суровый человек-паладин в тяжёлой броне, щит с символом солнца, решительный взгляд',
    ],
    location: [
      'Древняя таверна с низкими потолками, большой камин, деревянные столы, тусклое освещение свечами, уютная атмосфера',
      'Тёмный лес ночью, луна сквозь деревья, туман у земли, зловещая атмосфера',
      'Руины древнего храма, разрушенные колонны, поросшие мхом, лучи солнца сквозь проломы в крыше',
    ],
    item: [
      'Магический меч с голубым свечением лезвия, руны вдоль клинка, рукоять из серебра с сапфиром',
      'Древний том заклинаний в кожаном переплёте, золотые застёжки, светящиеся магические руны на обложке',
      'Зелье в хрустальном флаконе, фиолетовая светящаяся жидкость, пробка из воска с печатью',
    ],
    scene: [
      'Битва героев с драконом в горах, дракон на скале, герои атакуют снизу, драматичное освещение',
      'Дуэль двух воинов на мосту над пропастью, напряжённый момент, клинки скрещены',
      'Массовая битва: армия орков против людей на открытом поле, эпичная сцена',
    ],
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎨 Генератор изображений</h1>
        <p className="text-gray-400">
          Визуализация персонажей, локаций, предметов и сцен для вашей кампании
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Вкладки */}
      <div className="flex space-x-2 border-b border-gray-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ImageType)}
            className={`px-6 py-3 rounded-t-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gray-900 text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Форма генерации */}
      <Card>
        <div className="space-y-4">
          {/* Главное поле описания */}
          <div>
            <label className="block text-sm font-medium mb-2">
              📝 Описание <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Опишите ${activeTab === 'character' ? 'персонажа' : activeTab === 'location' ? 'локацию' : activeTab === 'item' ? 'предмет' : 'сцену'}...`}
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">
              Чем детальнее описание, тем лучше результат
            </p>
          </div>

          {/* Примеры */}
          <details className="text-sm">
            <summary className="cursor-pointer text-primary hover:text-primary-light">
              💡 Примеры описаний
            </summary>
            <ul className="mt-2 space-y-1 text-gray-400">
              {examples[activeTab].map((example, i) => (
                <li
                  key={i}
                  className="cursor-pointer hover:text-primary"
                  onClick={() => setDescription(example)}
                >
                  • {example}
                </li>
              ))}
            </ul>
          </details>

          {/* Общий стиль */}
          <Select label="🎨 Стиль" value={style} onChange={(e) => setStyle(e.target.value)}>
            {activeTab === 'character' && (
              <>
                <option value="fantasy_art">Фэнтези-арт (D&D стиль)</option>
                <option value="realistic">Реалистичный</option>
                <option value="concept_art">Концепт-арт</option>
                <option value="token">Токен для VTT</option>
                <option value="painting">Живопись</option>
                <option value="comic">Комикс</option>
              </>
            )}
            {activeTab === 'location' && (
              <>
                <option value="fantasy_art">Фэнтези-арт</option>
                <option value="realistic">Реалистичный</option>
                <option value="concept_art">Концепт-арт</option>
                <option value="painting">Живопись</option>
              </>
            )}
            {activeTab === 'item' && (
              <>
                <option value="fantasy_art">Фэнтези-арт</option>
                <option value="realistic">Реалистичный</option>
                <option value="icon">Иконка</option>
                <option value="painting">Живопись</option>
              </>
            )}
            {activeTab === 'scene' && (
              <>
                <option value="fantasy_art">Фэнтези-арт</option>
                <option value="epic">Эпичный</option>
                <option value="realistic">Реалистичный</option>
                <option value="concept_art">Концепт-арт</option>
                <option value="painting">Живопись</option>
              </>
            )}
          </Select>

          {/* Специфичные параметры для персонажа */}
          {activeTab === 'character' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Раса (опц.)"
                value={race}
                onChange={(e) => setRace(e.target.value)}
                placeholder="Эльф, дварф, человек..."
              />
              <Input
                label="Класс (опц.)"
                value={characterClass}
                onChange={(e) => setCharacterClass(e.target.value)}
                placeholder="Воин, маг, плут..."
              />
              <Input
                label="Возраст (опц.)"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Молодой, средних лет, старый..."
              />
              <Input
                label="Настроение (опц.)"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Грозный, дружелюбный, загадочный..."
              />
            </div>
          )}

          {/* Специфичные параметры для локации */}
          {activeTab === 'location' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Тип локации (опц.)"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                placeholder="Таверна, лес, подземелье..."
              />
              <Select
                label="Время суток"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as any)}
              >
                <option value="dawn">Рассвет</option>
                <option value="day">День</option>
                <option value="sunset">Закат</option>
                <option value="night">Ночь</option>
              </Select>
              <Select label="Погода" value={weather} onChange={(e) => setWeather(e.target.value as any)}>
                <option value="clear">Ясно</option>
                <option value="fog">Туман</option>
                <option value="rain">Дождь</option>
                <option value="snow">Снег</option>
                <option value="storm">Гроза</option>
              </Select>
              <Input
                label="Атмосфера (опц.)"
                value={atmosphere}
                onChange={(e) => setAtmosphere(e.target.value)}
                placeholder="Мрачная, уютная, зловещая..."
              />
            </div>
          )}

          {/* Специфичные параметры для предмета */}
          {activeTab === 'item' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Тип предмета (опц.)"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="Меч, зелье, артефакт..."
              />
              <Select label="Редкость" value={rarity} onChange={(e) => setRarity(e.target.value as any)}>
                <option value="common">Обычный</option>
                <option value="uncommon">Необычный</option>
                <option value="rare">Редкий</option>
                <option value="legendary">Легендарный</option>
              </Select>
              <Input
                label="Магический эффект (опц.)"
                value={magicalEffect}
                onChange={(e) => setMagicalEffect(e.target.value)}
                placeholder="Огонь, лёд, тьма, свет..."
                className="col-span-2"
              />
            </div>
          )}

          {/* Специфичные параметры для сцены */}
          {activeTab === 'scene' && (
            <div className="grid grid-cols-2 gap-4">
              <Select label="Масштаб" value={scale} onChange={(e) => setScale(e.target.value as any)}>
                <option value="duel">Дуэль</option>
                <option value="skirmish">Стычка</option>
                <option value="battle">Битва</option>
                <option value="war">Война</option>
              </Select>
              <Input
                label="Окружение (опц.)"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Лес, пещера, замок..."
              />
            </div>
          )}

          {/* Кнопка генерации */}
          <Button onClick={generateImage} disabled={loading || !description.trim()} fullWidth size="lg">
            {loading ? '🎨 Генерация... (может занять 10-30 сек)' : '🎨 Сгенерировать изображение'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Использует GPT-4o image generation • Требует OPENAI_API_KEY
          </p>
        </div>
      </Card>

      {/* История изображений */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">🖼️ Сгенерированные изображения</h2>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Очистить всё
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Card key={item.id} className="relative overflow-hidden">
                <button
                  onClick={() => removeFromHistory(item.id)}
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  title="Удалить"
                >
                  ✕
                </button>

                {/* Изображение */}
                <div className="mb-4">
                  <img
                    src={item.imageUrl}
                    alt={item.description}
                    className="w-full h-auto rounded-lg"
                  />
                </div>

                {/* Информация */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">{getTypeLabel(item.type)}</span>
                    <span className="text-sm text-gray-500">
                      {item.timestamp.toLocaleTimeString('ru-RU')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>

                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer hover:text-primary">Промпт</summary>
                    <p className="mt-1 text-gray-400">{item.revisedPrompt}</p>
                  </details>

                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      fullWidth
                      onClick={() =>
                        downloadImage(
                          item.imageUrl,
                          `${item.type}_${item.id}.png`
                        )
                      }
                    >
                      💾 Скачать
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      onClick={() => window.open(item.imageUrl, '_blank')}
                    >
                      🔍 Открыть
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getTypeLabel(type: ImageType): string {
  const labels: Record<ImageType, string> = {
    character: '👤 Персонаж',
    location: '🏰 Локация',
    item: '⚔️ Предмет',
    scene: '⚡ Сцена',
  };
  return labels[type];
}

