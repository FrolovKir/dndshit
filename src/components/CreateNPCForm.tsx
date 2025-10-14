'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';

interface CreateNPCFormProps {
  projects: { id: string; title: string }[];
  onSuccess?: () => void;
  projectId?: string;
  scenes?: { id: string; title: string }[];
}

export default function CreateNPCForm({ projects, onSuccess, projectId, scenes }: CreateNPCFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    name: '',
    race: 'Human',
    npcClass: 'Commoner',
    level: '1',
    alignment: 'Neutral',
    sceneId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/npcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          level: parseInt(formData.level),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create NPC');
      }

      // Успех
      setFormData({
        projectId: '',
        name: '',
        race: 'Human',
        npcClass: 'Commoner',
        level: '1',
        alignment: 'Neutral',
        sceneId: '',
      });
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!projectId && (
        <Select
          label="Кампания *"
          value={formData.projectId}
          onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          required
        >
          <option value="">Выберите кампанию</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </Select>
      )}

      <Input
        label="Имя NPC *"
        placeholder="Например: Борис Таверщик"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />

      {scenes && scenes.length > 0 ? (
        <Select
          label="Сцена (опционально)"
          value={formData.sceneId}
          onChange={(e) => setFormData({ ...formData, sceneId: e.target.value })}
        >
          <option value="">Без привязки</option>
          {scenes.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </Select>
      ) : (
        <Input
          label="ID сцены (опционально)"
          placeholder="Вставьте sceneId, чтобы привязать NPC к сцене"
          value={formData.sceneId}
          onChange={(e) => setFormData({ ...formData, sceneId: e.target.value })}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Раса"
          placeholder="Human"
          value={formData.race}
          onChange={(e) => setFormData({ ...formData, race: e.target.value })}
        />

        <Input
          label="Класс"
          placeholder="Commoner"
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
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
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

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        🎭 Создать пустого NPC
      </Button>
    </form>
  );
}


