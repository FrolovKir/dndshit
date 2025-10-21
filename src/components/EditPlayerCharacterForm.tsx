'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';

interface PlayerCharacter {
  id: string;
  playerName: string;
  characterName: string;
  race: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHP: number;
  currentHP: number;
  armorClass: number;
  speed: number;
  proficiencyBonus: number;
  appearance?: string;
  personality?: string;
  backstory?: string;
  notes?: string;
}

interface EditPlayerCharacterFormProps {
  character: PlayerCharacter;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditPlayerCharacterForm({
  character,
  onSuccess,
  onCancel,
}: EditPlayerCharacterFormProps) {
  const [playerName, setPlayerName] = useState(character.playerName);
  const [characterName, setCharacterName] = useState(character.characterName);
  const [race, setRace] = useState(character.race);
  const [characterClass, setCharacterClass] = useState(character.class);
  const [level, setLevel] = useState(character.level);
  const [background, setBackground] = useState(character.background || '');
  const [alignment, setAlignment] = useState(character.alignment || '');

  const [strength, setStrength] = useState(character.strength);
  const [dexterity, setDexterity] = useState(character.dexterity);
  const [constitution, setConstitution] = useState(character.constitution);
  const [intelligence, setIntelligence] = useState(character.intelligence);
  const [wisdom, setWisdom] = useState(character.wisdom);
  const [charisma, setCharisma] = useState(character.charisma);

  const [maxHP, setMaxHP] = useState(character.maxHP);
  const [currentHP, setCurrentHP] = useState(character.currentHP);
  const [armorClass, setArmorClass] = useState(character.armorClass);
  const [speed, setSpeed] = useState(character.speed);
  const [proficiencyBonus, setProficiencyBonus] = useState(character.proficiencyBonus);

  const [appearance, setAppearance] = useState(character.appearance || '');
  const [personality, setPersonality] = useState(character.personality || '');
  const [backstory, setBackstory] = useState(character.backstory || '');
  const [notes, setNotes] = useState(character.notes || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/player-characters/${character.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update character');
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
            required
          />
          <Input
            label="Имя персонажа"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Раса"
            value={race}
            onChange={(e) => setRace(e.target.value)}
            required
          />
          <Input
            label="Класс"
            value={characterClass}
            onChange={(e) => setCharacterClass(e.target.value)}
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
            label="Предыстория"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
          <Input
            label="Мировоззрение"
            value={alignment}
            onChange={(e) => setAlignment(e.target.value)}
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

      {/* Дополнительно */}
      <details className="bg-gray-800/30 rounded p-4">
        <summary className="font-bold text-sm text-gray-400 mb-3 cursor-pointer">
          Дополнительная информация
        </summary>
        <div className="space-y-3">
          <Textarea
            label="Внешность"
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            rows={2}
          />
          <Textarea
            label="Личность"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
          />
          <Textarea
            label="Предыстория"
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            rows={3}
          />
          <Textarea
            label="Заметки мастера"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Личные заметки о персонаже..."
            rows={2}
          />
        </div>
      </details>

      {/* Кнопки */}
      <div className="flex space-x-3 sticky bottom-0 bg-gray-900 pt-3">
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Сохранение...' : 'Сохранить'}
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

