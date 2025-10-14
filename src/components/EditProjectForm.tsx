'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';

interface Project {
  id: string;
  title: string;
  description?: string;
  synopsis?: string;
  setting?: string;
}

interface EditProjectFormProps {
  project: Project;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditProjectForm({ project, onSuccess, onCancel }: EditProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: project.title || '',
    description: project.description || '',
    synopsis: project.synopsis || '',
    setting: project.setting || 'Forgotten Realms',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update project');
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
        label="Название кампании *"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Input
        label="Сеттинг"
        value={formData.setting}
        onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
      />

      <Textarea
        label="Синопсис"
        placeholder="Краткое описание сюжета"
        value={formData.synopsis}
        onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
        rows={4}
      />

      <Textarea
        label="Описание"
        placeholder="Дополнительная информация"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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


