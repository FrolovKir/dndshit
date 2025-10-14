'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface Scene {
  id: string;
  title: string;
  description: string;
  sceneType: string;
  order: number;
}

interface EditSceneFormProps {
  scene: Scene;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditSceneForm({ scene, onSuccess, onCancel }: EditSceneFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: scene.title || '',
    description: scene.description || '',
    sceneType: scene.sceneType || 'story',
    order: scene.order || 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/scenes/${scene.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update scene');
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
        label="Название сцены *"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <div className="grid grid-cols-2 gap-4">
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

        <Input
          label="Порядок"
          type="number"
          min="1"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
        />
      </div>

      <Textarea
        label="Описание"
        placeholder="Детальное описание сцены"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={8}
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


