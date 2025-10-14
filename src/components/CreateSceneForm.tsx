'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface CreateSceneFormProps {
  projects: { id: string; title: string }[];
  onSuccess?: () => void;
  projectId?: string;
}

export default function CreateSceneForm({ projects, onSuccess, projectId }: CreateSceneFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    title: '',
    description: '',
    sceneType: 'story',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create scene');
      }

      // Успех
      setFormData({ projectId: '', title: '', description: '', sceneType: 'story' });
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
        label="Название сцены *"
        placeholder="Например: Встреча в таверне"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Select
        label="Тип сцены"
        value={formData.sceneType}
        onChange={(e) => setFormData({ ...formData, sceneType: e.target.value })}
      >
        <option value="story">Сюжетная</option>
        <option value="combat">Боевая</option>
        <option value="social">Социальная</option>
        <option value="exploration">Исследование</option>
      </Select>

      <Textarea
        label="Описание (опционально)"
        placeholder="Краткое описание сцены"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
      />

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        🎬 Создать пустую сцену
      </Button>
    </form>
  );
}


