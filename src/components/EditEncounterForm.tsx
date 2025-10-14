'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface EncounterData {
  id: string;
  title: string;
  description?: string;
  encounterType?: string;
  difficulty?: string;
  monsters?: string;
  environment?: string;
  tactics?: string;
  rewards?: string;
  estimatedLevel?: number;
}

interface EditEncounterFormProps {
  encounter: EncounterData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditEncounterForm({ encounter, onSuccess, onCancel }: EditEncounterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: encounter.title || '',
    description: encounter.description || '',
    encounterType: encounter.encounterType || 'combat',
    difficulty: encounter.difficulty || 'medium',
    monsters: encounter.monsters || '',
    environment: encounter.environment || '',
    tactics: encounter.tactics || '',
    rewards: encounter.rewards || '',
    estimatedLevel: encounter.estimatedLevel || 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/encounters/${encounter.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update encounter');
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Название энкаунтера *"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Тип"
          value={formData.encounterType}
          onChange={(e) => setFormData({ ...formData, encounterType: e.target.value })}
        >
          <option value="combat">Боевой</option>
          <option value="social">Социальный</option>
          <option value="trap">Ловушка</option>
          <option value="puzzle">Головоломка</option>
        </Select>

        <Select
          label="Сложность"
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
        >
          <option value="easy">Легкий</option>
          <option value="medium">Средний</option>
          <option value="hard">Сложный</option>
          <option value="deadly">Смертельный</option>
        </Select>

        <Input
          label="Уровень"
          type="number"
          min="1"
          max="20"
          value={formData.estimatedLevel}
          onChange={(e) => setFormData({ ...formData, estimatedLevel: parseInt(e.target.value) })}
        />
      </div>

      <Textarea
        label="Описание"
        placeholder="Как начинается энкаунтер, что происходит"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
      />

      <Textarea
        label="Монстры (JSON)"
        placeholder='[{"name": "Goblin", "count": 5, "cr": "1/4"}]'
        value={formData.monsters}
        onChange={(e) => setFormData({ ...formData, monsters: e.target.value })}
        rows={3}
      />

      <Textarea
        label="Окружение"
        placeholder="Описание локации и особенностей местности"
        value={formData.environment}
        onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
        rows={3}
      />

      <Textarea
        label="Тактика"
        placeholder="Как действуют враги, их стратегия"
        value={formData.tactics}
        onChange={(e) => setFormData({ ...formData, tactics: e.target.value })}
        rows={3}
      />

      <Textarea
        label="Награды (JSON)"
        placeholder='{"gold": 100, "items": ["Зелье лечения"]}'
        value={formData.rewards}
        onChange={(e) => setFormData({ ...formData, rewards: e.target.value })}
        rows={2}
      />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
        )}
        <Button type="submit" loading={loading}>
          💾 Сохранить
        </Button>
      </div>
    </form>
  );
}


