'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface NPC {
  id: string;
  name: string;
  race?: string;
  class?: string;
  level?: number;
  alignment?: string;
  personality?: string;
  backstory?: string;
  appearance?: string;
  motivations?: string;
  stats?: string;
  imageUrl?: string;
}

interface EditNPCFormProps {
  npc: NPC;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditNPCForm({ npc, onSuccess, onCancel }: EditNPCFormProps) {
  const [loading, setLoading] = useState(false);
  const [generatingPortrait, setGeneratingPortrait] = useState(false);
  const [error, setError] = useState('');
  const [imageUrl, setImageUrl] = useState(npc.imageUrl || '');
  const [formData, setFormData] = useState({
    name: npc.name || '',
    race: npc.race || 'Human',
    npcClass: npc.class || 'Commoner',
    level: npc.level || 1,
    alignment: npc.alignment || 'Neutral',
    personality: npc.personality || '',
    backstory: npc.backstory || '',
    appearance: npc.appearance || '',
    motivations: npc.motivations || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/npcs/${npc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: imageUrl || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update NPC');
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePortrait = async () => {
    setGeneratingPortrait(true);
    setError('');

    try {
      const response = await fetch('/api/generate/npc-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcId: npc.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate portrait');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);
      
      // Обновляем данные, чтобы onSuccess сработал корректно
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGeneratingPortrait(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Секция портрета */}
      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-400">🎨 Портрет персонажа</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGeneratePortrait}
            loading={generatingPortrait}
            disabled={generatingPortrait || !formData.name}
          >
            {generatingPortrait ? '⏳ Генерация...' : imageUrl ? '🔄 Перегенерировать' : '✨ Создать портрет'}
          </Button>
        </div>
        
        {imageUrl ? (
          <div className="relative group">
            <img 
              src={imageUrl} 
              alt={formData.name}
              className="w-full max-w-md mx-auto rounded-lg shadow-xl border-2 border-primary/20 transition-all group-hover:border-primary/40"
            />
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              🗑️ Удалить
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto aspect-square bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center">
            <div className="text-6xl mb-3">🖼️</div>
            <p className="text-gray-500 text-sm">Портрет не создан</p>
            <p className="text-gray-600 text-xs mt-1">Нажмите "Создать портрет" для генерации</p>
          </div>
        )}
      </div>

      <Input
        label="Имя NPC *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Раса"
          value={formData.race}
          onChange={(e) => setFormData({ ...formData, race: e.target.value })}
        />

        <Input
          label="Класс"
          value={formData.npcClass}
          onChange={(e) => setFormData({ ...formData, npcClass: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Уровень"
          type="number"
          min="1"
          max="20"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
        />

        <Select
          label="Мировоззрение"
          value={formData.alignment}
          onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
        >
          <option value="Lawful Good">Lawful Good</option>
          <option value="Neutral Good">Neutral Good</option>
          <option value="Chaotic Good">Chaotic Good</option>
          <option value="Lawful Neutral">Lawful Neutral</option>
          <option value="Neutral">Neutral</option>
          <option value="Chaotic Neutral">Chaotic Neutral</option>
          <option value="Lawful Evil">Lawful Evil</option>
          <option value="Neutral Evil">Neutral Evil</option>
          <option value="Chaotic Evil">Chaotic Evil</option>
        </Select>
      </div>

      <Textarea
        label="Внешность"
        placeholder="Описание внешнего вида"
        value={formData.appearance}
        onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
        rows={3}
      />

      <Textarea
        label="Характер"
        placeholder="Черты характера, манеры, привычки"
        value={formData.personality}
        onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
        rows={4}
      />

      <Textarea
        label="Предыстория"
        placeholder="История персонажа"
        value={formData.backstory}
        onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
        rows={4}
      />

      <Textarea
        label="Мотивации"
        placeholder="Что движет этим персонажем"
        value={formData.motivations}
        onChange={(e) => setFormData({ ...formData, motivations: e.target.value })}
        rows={3}
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

