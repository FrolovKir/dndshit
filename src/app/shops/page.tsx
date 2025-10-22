'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Input from '@/components/Input';

interface ShopItem {
  name: string;
  price: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  description: string;
  quantity: number;
}

interface Shop {
  name: string;
  type: string;
  owner: {
    name: string;
    race: string;
    personality: string;
    quirk: string;
  };
  description: string;
  atmosphere: string;
  specialties: string[];
  items: ShopItem[];
  services: string[];
  rumors: string[];
  hooks: string[];
}

export default function ShopsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedShop, setGeneratedShop] = useState<Shop | null>(null);

  // Параметры генерации
  const [shopType, setShopType] = useState<'general' | 'weapons' | 'armor' | 'magic' | 'alchemy' | 'tavern' | 'blacksmith' | 'temple'>('general');
  const [settlement, setSettlement] = useState<'village' | 'town' | 'city' | 'metropolis'>('town');
  const [wealth, setWealth] = useState<'poor' | 'modest' | 'comfortable' | 'wealthy' | 'aristocratic'>('comfortable');
  const [specialty, setSpecialty] = useState('');

  const generateShop = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopType,
          settlement,
          wealth,
          specialty: specialty || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Shop generation failed');
      }

      setGeneratedShop(data.shop);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'text-gray-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      very_rare: 'text-purple-400',
      legendary: 'text-orange-400',
    };
    return colors[rarity as keyof typeof colors] || 'text-gray-400';
  };

  const getRarityLabel = (rarity: string) => {
    const labels = {
      common: 'Обычный',
      uncommon: 'Необычный', 
      rare: 'Редкий',
      very_rare: 'Очень редкий',
      legendary: 'Легендарный',
    };
    return labels[rarity as keyof typeof labels] || rarity;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🏪 Генератор магазинов</h1>
        <p className="text-gray-400">
          Создавайте магазины с товарами, владельцами и атмосферой
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Генератор */}
      <Card>
        <h2 className="text-2xl font-bold mb-6">Параметры магазина</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Select
            label="Тип магазина"
            value={shopType}
            onChange={(e) => setShopType(e.target.value as any)}
          >
            <option value="general">🏪 Общий магазин</option>
            <option value="weapons">⚔️ Оружейная</option>
            <option value="armor">🛡️ Доспехи</option>
            <option value="magic">🔮 Магические предметы</option>
            <option value="alchemy">⚗️ Алхимия</option>
            <option value="tavern">🍺 Таверна</option>
            <option value="blacksmith">🔨 Кузница</option>
            <option value="temple">⛪ Храм</option>
          </Select>

          <Select
            label="Размер поселения"
            value={settlement}
            onChange={(e) => setSettlement(e.target.value as any)}
          >
            <option value="village">🏘️ Деревня</option>
            <option value="town">🏘️ Городок</option>
            <option value="city">🏙️ Город</option>
            <option value="metropolis">🌆 Мегаполис</option>
          </Select>

          <Select
            label="Уровень богатства"
            value={wealth}
            onChange={(e) => setWealth(e.target.value as any)}
          >
            <option value="poor">💸 Бедный</option>
            <option value="modest">💰 Скромный</option>
            <option value="comfortable">💎 Комфортный</option>
            <option value="wealthy">👑 Богатый</option>
            <option value="aristocratic">💍 Аристократический</option>
          </Select>

          <Input
            label="Специализация (опц.)"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Эльфийские товары..."
          />
        </div>

        <Button onClick={generateShop} disabled={loading} size="lg" className="w-full">
          {loading ? 'Генерация магазина...' : '🏪 Сгенерировать магазин'}
        </Button>
      </Card>

      {/* Результат */}
      {generatedShop && (
        <div className="space-y-6">
          {/* Основная информация */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">{generatedShop.name}</h2>
                <p className="text-lg text-gray-300 mb-2">{generatedShop.type}</p>
                <p className="text-gray-400">{generatedShop.description}</p>
              </div>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
              <h3 className="text-lg font-bold mb-2">🎭 Владелец</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-bold text-secondary">{generatedShop.owner.name}</p>
                  <p className="text-gray-400">{generatedShop.owner.race}</p>
                </div>
                <div>
                  <p className="text-sm mb-1"><strong>Характер:</strong> {generatedShop.owner.personality}</p>
                  <p className="text-sm"><strong>Причуда:</strong> {generatedShop.owner.quirk}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">🏪 Атмосфера</h3>
              <p className="text-gray-300">{generatedShop.atmosphere}</p>
            </div>

            {generatedShop.specialties.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-2">⭐ Специализации</h3>
                <div className="flex flex-wrap gap-2">
                  {generatedShop.specialties.map((specialty, index) => (
                    <span key={index} className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Товары */}
          <Card>
            <h3 className="text-2xl font-bold mb-4">🛍️ Товары</h3>
            <div className="space-y-3">
              {generatedShop.items.map((item, index) => (
                <div key={index} className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-primary">{item.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-yellow-400">{item.price}</p>
                      <p className={`text-sm ${getRarityColor(item.rarity)}`}>
                        {getRarityLabel(item.rarity)}
                      </p>
                      <p className="text-xs text-gray-500">В наличии: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Услуги */}
          {generatedShop.services.length > 0 && (
            <Card>
              <h3 className="text-2xl font-bold mb-4">🔧 Услуги</h3>
              <ul className="space-y-2">
                {generatedShop.services.map((service, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-secondary">•</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Слухи и зацепки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedShop.rumors.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold mb-4">💬 Слухи</h3>
                <ul className="space-y-2">
                  {generatedShop.rumors.map((rumor, index) => (
                    <li key={index} className="text-sm text-gray-300 italic">
                      "{rumor}"
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {generatedShop.hooks.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold mb-4">🎣 Зацепки для приключений</h3>
                <ul className="space-y-2">
                  {generatedShop.hooks.map((hook, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-sm">{hook}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}