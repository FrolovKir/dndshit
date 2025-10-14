'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';

interface CreateEncounterFormProps {
  projects: { id: string; title: string }[];
  onSuccess?: () => void;
  projectId?: string;
  sceneId?: string; // на будущее
}

export default function CreateEncounterForm({ projects, onSuccess, projectId }: CreateEncounterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    title: '',
    encounterType: 'combat',
    difficulty: 'medium',
    estimatedLevel: '3',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedLevel: parseInt(formData.estimatedLevel),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create encounter');
      }

      // Успех
      setFormData({
        projectId: '',
        title: '',
        encounterType: 'combat',
        difficulty: 'medium',
        estimatedLevel: '3',
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
        label="Название энкаунтера *"
        placeholder="Например: Засада гоблинов"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <Input
        label="Рекомендуемый уровень"
        type="number"
        min="1"
        max="20"
        value={formData.estimatedLevel}
        onChange={(e) => setFormData({ ...formData, estimatedLevel: e.target.value })}
      />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        ⚔️ Создать пустой энкаунтер
      </Button>
    </form>
  );
}


