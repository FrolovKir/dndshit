'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

export default function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    setting: 'Forgotten Realms',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      // Успех
      setFormData({ title: '', description: '', setting: 'Forgotten Realms' });
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
        placeholder="Например: Проклятие Костяной Башни"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <Input
        label="Сеттинг"
        placeholder="Например: Forgotten Realms"
        value={formData.setting}
        onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
      />

      <Textarea
        label="Описание (опционально)"
        placeholder="Краткое описание кампании"
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
        📚 Создать пустую кампанию
      </Button>
    </form>
  );
}


