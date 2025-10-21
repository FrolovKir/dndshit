'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface CreatePlayerCharacterFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePlayerCharacterForm({
  projectId,
  onSuccess,
  onCancel,
}: CreatePlayerCharacterFormProps) {
  const [playerName, setPlayerName] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [race, setRace] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [level, setLevel] = useState(1);
  const [background, setBackground] = useState('');
  const [alignment, setAlignment] = useState('');

  // Характеристики
  const [strength, setStrength] = useState(10);
  const [dexterity, setDexterity] = useState(10);
  const [constitution, setConstitution] = useState(10);
  const [intelligence, setIntelligence] = useState(10);
  const [wisdom, setWisdom] = useState(10);
  const [charisma, setCharisma] = useState(10);

  // Игровые параметры
  const [maxHP, setMaxHP] = useState(10);
  const [currentHP, setCurrentHP] = useState(10);
  const [armorClass, setArmorClass] = useState(10);
  const [speed, setSpeed] = useState(30);
  const [proficiencyBonus, setProficiencyBonus] = useState(2);

  // Дополнительно
  const [appearance, setAppearance] = useState('');
  const [personality, setPersonality] = useState('');
  const [backstory, setBackstory] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName || !characterName || !race || !characterClass) {
      setError('Заполните обязательные поля');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/player-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          playerName,
          characterName,
          race,
          class: characterClass,
          level,
          background: background || undefined,
          alignment: alignment || undefined,
          strength,
          dexterity,
          constitution,
          intelligence,
          wisdom,
          charisma,
          maxHP,
          currentHP,
          armorClass,
          speed,
          proficiencyBonus,
          appearance: appearance || undefined,
          personality: personality || undefined,
          backstory: backstory || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create character');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Основная информация */}
      <div className="bg-gray-800/30 rounded p-4 space-y-3">
        <h3 className="font-bold text-sm text-gray-400 mb-2">Основная информация</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Имя игрока"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Например: Иван"
            required
          />
          <Input
            label="Имя персонажа"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Например: Торвальд"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Раса"
            value={race}
            onChange={(e) => setRace(e.target.value)}
            placeholder="Дварф, эльф..."
            required
          />
          <Input
            label="Класс"
            value={characterClass}
            onChange={(e) => setCharacterClass(e.target.value)}
            placeholder="Воин, маг..."
            required
          />
          <Input
            label="Уровень"
            type="number"
            min="1"
            max="20"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Предыстория (опц.)"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="Солдат, мудрец..."
          />
          <Input
            label="Мировоззрение (опц.)"
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
            placeholder="Lawful Good, Chaotic Neutral..."
          />
        </div>
      </div>

      {/* Характеристики */}
      <div className="bg-gray-800/30 rounded p-4 space-y-3">
        <h3 className="font-bold text-sm text-gray-400 mb-2">Характеристики</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-center">STR</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={strength}
              onChange={(e) => setStrength(parseInt(e.target.value) || 10)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">DEX</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={dexterity}
              onChange={(e) => setDexterity(parseInt(e.target.value) || 10)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">CON</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={constitution}
              onChange={(e) => setConstitution(parseInt(e.target.value) || 10)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">INT</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={intelligence}
              onChange={(e) => setIntelligence(parseInt(e.target.value) || 10)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">WIS</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={wisdom}
              onChange={(e) => setWisdom(parseInt(e.target.value) || 10)}
              className="text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-center">CHA</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={charisma}
              onChange={(e) => setCharisma(parseInt(e.target.value) || 10)}
              className="text-center"
            />
          </div>
        </div>
      </div>

      {/* Игровые параметры */}
      <div className="bg-gray-800/30 rounded p-4 space-y-3">
        <h3 className="font-bold text-sm text-gray-400 mb-2">Игровые параметры</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Input
            label="Макс HP"
            type="number"
            min="1"
            value={maxHP}
            onChange={(e) => setMaxHP(parseInt(e.target.value) || 10)}
          />
          <Input
            label="Текущий HP"
            type="number"
            min="0"
            value={currentHP}
            onChange={(e) => setCurrentHP(parseInt(e.target.value) || 10)}
          />
          <Input
            label="AC"
            type="number"
            min="1"
            value={armorClass}
            onChange={(e) => setArmorClass(parseInt(e.target.value) || 10)}
          />
          <Input
            label="Скорость"
            type="number"
            min="0"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value) || 30)}
          />
          <Input
            label="Бонус проф."
            type="number"
            min="2"
            max="6"
            value={proficiencyBonus}
            onChange={(e) => setProficiencyBonus(parseInt(e.target.value) || 2)}
          />
        </div>
      </div>

      {/* Дополнительная информация */}
      <details open className="bg-gray-800/30 rounded p-4">
        <summary className="font-bold text-sm text-gray-400 mb-3 cursor-pointer">
          Дополнительная информация (опц.)
        </summary>
        <div className="space-y-3">
          <Textarea
            label="Внешность"
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            placeholder="Описание внешности персонажа..."
            rows={2}
          />
          <Textarea
            label="Личность"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="Черты характера, идеалы, привязанности, слабости..."
            rows={2}
          />
          <Textarea
            label="Предыстория"
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="История персонажа до начала приключений..."
            rows={3}
          />
        </div>
      </details>

      {/* Кнопки */}
      <div className="flex space-x-3">
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Создание...' : 'Создать персонажа'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}

