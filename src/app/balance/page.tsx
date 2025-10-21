'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';

type Difficulty = 'easy' | 'medium' | 'hard' | 'deadly';

interface EncounterVariant {
  monsters: Array<{ name: string; cr: string; count: number; type: string }>;
  totalXP: number;
  adjustedXP: number;
  actualDifficulty: Difficulty;
  matchScore: number;
}

interface DetailedEncounter {
  title: string;
  description: string;
  setup: {
    initial_distance: string;
    enemy_positioning: string;
    terrain_features: string[];
  };
  tactics: {
    general_strategy: string;
    per_monster: Array<{
      monster: string;
      role: string;
      behavior: string;
      priority_targets: string;
    }>;
    retreat_condition: string;
  };
  environment: {
    description: string;
    hazards: string[];
    useful_features: string[];
  };
  rewards: {
    gold: number;
    items: string[];
    xp: number;
  };
  dm_tips: string[];
}

export default function BalancePage() {
  const [partyLevel, setPartyLevel] = useState(3);
  const [partySize, setPartySize] = useState(4);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [environment, setEnvironment] = useState('');
  const [context, setContext] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [xpBudget, setXpBudget] = useState<number | null>(null);
  const [encounters, setEncounters] = useState<EncounterVariant[]>([]);
  const [detailedEncounter, setDetailedEncounter] = useState<DetailedEncounter | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const calculateBalance = async (generateDetails: boolean = false) => {
    setLoading(true);
    setError(null);
    setDetailedEncounter(null);

    try {
      const response = await fetch('/api/balance-encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyLevel,
          partySize,
          difficulty,
          environment: environment || undefined,
          context: context || undefined,
          generateDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Calculation failed');
      }

      setXpBudget(data.xpBudget);
      setEncounters(data.encounters || []);
      if (data.detailedEncounter) {
        setDetailedEncounter(data.detailedEncounter);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: Difficulty): string => {
    switch (diff) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-orange-400';
      case 'deadly':
        return 'text-red-400';
    }
  };

  const getDifficultyLabel = (diff: Difficulty): string => {
    switch (diff) {
      case 'easy':
        return 'Лёгкий';
      case 'medium':
        return 'Средний';
      case 'hard':
        return 'Сложный';
      case 'deadly':
        return 'Смертельный';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">⚖️ Балансировщик энкаунтеров</h1>
        <p className="text-gray-400">
          Подберите сбалансированный состав монстров для вашей партии
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      {/* Калькулятор */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Параметры партии</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Уровень партии
            </label>
            <Input
              type="number"
              min="1"
              max="20"
              value={partyLevel}
              onChange={(e) => setPartyLevel(parseInt(e.target.value) || 1)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Количество игроков
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              value={partySize}
              onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
            />
          </div>

          <Select
            label="Сложность"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Лёгкий</option>
            <option value="medium">Средний</option>
            <option value="hard">Сложный</option>
            <option value="deadly">Смертельный</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Окружение (опц.)"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            placeholder="Лес, пещера, замок..."
          />
          <Input
            label="Контекст (опц.)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Засада, защита, случайная встреча..."
          />
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={() => calculateBalance(false)}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Расчёт...' : '⚖️ Рассчитать энкаунтеры'}
          </Button>
          <Button
            onClick={() => calculateBalance(true)}
            disabled={loading}
            variant="secondary"
            fullWidth
          >
            {loading ? 'Генерация...' : '🎲 Рассчитать + AI описание'}
          </Button>
        </div>
      </Card>

      {/* XP Budget */}
      {xpBudget !== null && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-1">XP Бюджет</p>
            <p className="text-4xl font-bold text-primary">{xpBudget.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-2">
              Уровень {partyLevel} • {partySize} игроков • {getDifficultyLabel(difficulty)}
            </p>
          </div>
        </Card>
      )}

      {/* Варианты энкаунтеров */}
      {encounters.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">🎲 Варианты энкаунтеров</h2>
          <p className="text-sm text-gray-400 mb-4">
            Выберите подходящий вариант или сгенерируйте детальное описание
          </p>

          <div className="grid grid-cols-1 gap-4">
            {encounters.map((variant, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedVariant === index
                    ? 'border-primary border-2'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedVariant(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="text-lg font-bold text-primary">
                        Вариант {index + 1}
                      </span>
                      <span className={`text-sm font-medium ${getDifficultyColor(variant.actualDifficulty)}`}>
                        {getDifficultyLabel(variant.actualDifficulty)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Точность: {Math.round(variant.matchScore * 100)}%
                      </span>
                    </div>

                    {/* Монстры */}
                    <div className="space-y-2 mb-3">
                      {variant.monsters.map((monster, mIndex) => (
                        <div
                          key={mIndex}
                          className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2"
                        >
                          <div>
                            <span className="font-medium">{monster.name}</span>
                            <span className="text-sm text-gray-400 ml-2">
                              × {monster.count}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            <span className="mr-2">CR {monster.cr}</span>
                            <span className="text-xs text-gray-500">({monster.type})</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* XP */}
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Базовый XP:</span>
                        <span className="ml-2 text-gray-300">{variant.totalXP}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Скорректированный XP:</span>
                        <span className="ml-2 text-primary font-bold">
                          {variant.adjustedXP}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Детальное описание */}
      {detailedEncounter && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">📜 Детальное описание энкаунтера</h2>

          <Card>
            <h3 className="text-xl font-bold text-primary mb-3">
              {detailedEncounter.title}
            </h3>
            <p className="text-gray-300 whitespace-pre-wrap mb-4">
              {detailedEncounter.description}
            </p>
          </Card>

          <Card>
            <h4 className="font-bold mb-2">⚔️ Начальная расстановка</h4>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Расстояние:</strong> {detailedEncounter.setup.initial_distance}
              </p>
              <p>
                <strong>Позиции врагов:</strong> {detailedEncounter.setup.enemy_positioning}
              </p>
              <div>
                <strong>Особенности местности:</strong>
                <ul className="list-disc list-inside mt-1 text-gray-400">
                  {detailedEncounter.setup.terrain_features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold mb-2">🎯 Тактика врагов</h4>
            <p className="text-sm text-gray-300 mb-3">
              {detailedEncounter.tactics.general_strategy}
            </p>
            <div className="space-y-3">
              {detailedEncounter.tactics.per_monster.map((tactic, i) => (
                <div key={i} className="bg-gray-800/50 rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-primary">{tactic.monster}</span>
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                      {tactic.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{tactic.behavior}</p>
                  <p className="text-xs text-gray-500">
                    <strong>Приоритет:</strong> {tactic.priority_targets}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3">
              <strong>Условие отступления:</strong> {detailedEncounter.tactics.retreat_condition}
            </p>
          </Card>

          <Card>
            <h4 className="font-bold mb-2">🌲 Окружение</h4>
            <p className="text-sm text-gray-300 mb-3">
              {detailedEncounter.environment.description}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-sm text-red-400">Опасности:</strong>
                <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
                  {detailedEncounter.environment.hazards.map((hazard, i) => (
                    <li key={i}>{hazard}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong className="text-sm text-green-400">Полезные элементы:</strong>
                <ul className="list-disc list-inside text-sm text-gray-400 mt-1">
                  {detailedEncounter.environment.useful_features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          <Card>
            <h4 className="font-bold mb-2">💰 Награды</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-yellow-400 text-2xl font-bold">
                  {detailedEncounter.rewards.gold}
                </p>
                <p className="text-gray-500">Золото</p>
              </div>
              <div className="text-center">
                <p className="text-blue-400 text-2xl font-bold">
                  {detailedEncounter.rewards.items.length}
                </p>
                <p className="text-gray-500">Предметов</p>
              </div>
              <div className="text-center">
                <p className="text-green-400 text-2xl font-bold">
                  {detailedEncounter.rewards.xp}
                </p>
                <p className="text-gray-500">XP</p>
              </div>
            </div>
            {detailedEncounter.rewards.items.length > 0 && (
              <ul className="list-disc list-inside text-sm text-gray-400 mt-3">
                {detailedEncounter.rewards.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="bg-blue-900/20">
            <h4 className="font-bold mb-2">💡 Советы для мастера</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {detailedEncounter.dm_tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

