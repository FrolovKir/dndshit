'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface Project {
  id: string;
  title: string;
}

interface GenerateEncounterFormProps {
  projects: Project[];
  projectId?: string;
}

export default function GenerateEncounterForm({ projects, projectId }: GenerateEncounterFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedEncounter, setGeneratedEncounter] = useState<any>(null);
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    encounterType: 'combat',
    difficulty: 'medium',
    level: '3',
    environment: '',
    context: '',
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
      const res = await fetch('/api/generate/encounter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: formData.projectId || projectId,
          encounterType: formData.encounterType,
          difficulty: formData.difficulty,
          level: parseInt(formData.level),
          environment: formData.environment || undefined,
          context: formData.context || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      setSuccess(true);
      setGeneratedEncounter(data.encounter);
      setFormData({ ...formData, environment: '', context: '' });
      
      // Обновляем страницу чтобы увидеть новый энкаунтер
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
          Сначала создайте кампанию, чтобы добавлять в неё энкаунтеры
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Тип энкаунтера"
              options={[
                { value: 'combat', label: 'Боевой' },
                { value: 'social', label: 'Социальный' },
                { value: 'trap', label: 'Ловушка' },
                { value: 'puzzle', label: 'Головоломка' },
              ]}
              value={formData.encounterType}
              onChange={(e) => setFormData({ ...formData, encounterType: e.target.value })}
            />

            <Select
              label="Сложность"
              options={[
                { value: 'easy', label: 'Лёгкий' },
                { value: 'medium', label: 'Средний' },
                { value: 'hard', label: 'Сложный' },
                { value: 'deadly', label: 'Смертельный' },
              ]}
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            />

            <Input
              label="Уровень группы"
              type="number"
              min="1"
              max="20"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            />
          </div>

          <Input
            label="Окружение (опционально)"
            placeholder="Например: лесная тропа, подземелье, таверна..."
            value={formData.environment}
            onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
          />

          <Textarea
            label="Дополнительный контекст (опционально)"
            placeholder="Любая дополнительная информация об энкаунтере..."
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            rows={3}
          />

          {error && (
            <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
              {error}
            </div>
          )}

          {success && generatedEncounter && (
            <div className="p-4 bg-secondary/10 border border-secondary rounded-lg text-secondary animate-fade-in">
              <div className="font-bold mb-2">✓ Энкаунтер создан!</div>
              <div className="text-sm">
                <span className="font-medium">{generatedEncounter.title}</span>
                {generatedEncounter.difficulty && (
                  <span className="text-xs opacity-80"> — {generatedEncounter.difficulty}</span>
                )}
                <br />
                <span className="text-xs opacity-80">Страница обновится автоматически...</span>
              </div>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            ⚔️ Создать энкаунтер
          </Button>
        </>
      )}
    </form>
  );
}

