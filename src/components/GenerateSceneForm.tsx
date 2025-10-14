'use client';

import { useState } from 'react';
import Button from './Button';
import Select from './Select';
import Textarea from './Textarea';

interface Project {
  id: string;
  title: string;
}

interface GenerateSceneFormProps {
  projects: Project[];
  projectId?: string; // если передан, скрываем выбор проекта
}

export default function GenerateSceneForm({ projects, projectId }: GenerateSceneFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedScene, setGeneratedScene] = useState<any>(null);
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    sceneContext: '',
    tone: 'adventure',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(formData.projectId || projectId)) {
      setError('Выберите проект');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/generate/scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      setSuccess(true);
      setGeneratedScene(data.scene);
      setFormData({ ...formData, sceneContext: '' });
      
      // Обновляем страницу чтобы увидеть новую сцену
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(!projectId && projects.length === 0) ? (
        <div className="p-4 bg-gray-800 rounded-lg text-gray-400 text-center">
          Сначала создайте кампанию, чтобы добавлять в неё сцены
        </div>
      ) : (
        <>
          {!projectId && (
            <Select
              label="Проект"
              options={[
                { value: '', label: 'Выберите проект...' },
                ...projects.map((p) => ({ value: p.id, label: p.title })),
              ]}
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            />
          )}

          <Textarea
            label="Контекст сцены"
            placeholder="Опишите, что должно происходить в сцене. Например: 'Герои входят в заброшенный храм, где их ждёт засада'"
            value={formData.sceneContext}
            onChange={(e) => setFormData({ ...formData, sceneContext: e.target.value })}
            rows={4}
          />

          <Select
            label="Тон сцены"
            options={[
              { value: 'adventure', label: 'Приключенческий' },
              { value: 'dark', label: 'Тёмный/Хоррор' },
              { value: 'humorous', label: 'Юмористический' },
              { value: 'dramatic', label: 'Драматический' },
              { value: 'mysterious', label: 'Таинственный' },
            ]}
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
          />

          {error && (
            <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
              {error}
            </div>
          )}

          {success && generatedScene && (
            <div className="p-4 bg-secondary/10 border border-secondary rounded-lg text-secondary animate-fade-in">
              <div className="font-bold mb-2">✓ Сцена создана!</div>
              <div className="text-sm">
                <span className="font-medium">{generatedScene.title}</span>
                <br />
                <span className="text-xs opacity-80">Страница обновится автоматически...</span>
              </div>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            🎬 Создать сцену
          </Button>
        </>
      )}
    </form>
  );
}

