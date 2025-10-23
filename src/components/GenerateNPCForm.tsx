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

interface GenerateNPCFormProps {
  projects: Project[];
  projectId?: string;
  scenes?: { id: string; title: string }[];
}

export default function GenerateNPCForm({ projects, projectId, scenes }: GenerateNPCFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedNPC, setGeneratedNPC] = useState<any>(null);
  const [formData, setFormData] = useState({
    projectId: projectId || '',
    sceneId: '',
    role: '',
    race: '',
    npcClass: '',
    alignment: '',
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
      const res = await fetch('/api/generate/npc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: formData.projectId || projectId,
          role: formData.role || undefined,
          race: formData.race || undefined,
          npcClass: formData.npcClass || undefined,
          alignment: formData.alignment || undefined,
          context: formData.context || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      setSuccess(true);
      setGeneratedNPC(data.npc);
      setFormData({ ...formData, role: '', race: '', npcClass: '', context: '', sceneId: '' });
      
      // Обновляем страницу чтобы увидеть нового NPC
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
          Сначала создайте кампанию, чтобы добавлять в неё NPC
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

          {scenes && scenes.length > 0 && (
            <Select
              label="Сцена (опционально)"
              options={[
                { value: '', label: 'Без привязки' },
                ...scenes.map((s) => ({ value: s.id, label: s.title })),
              ]}
              value={formData.sceneId}
              onChange={(e) => setFormData({ ...formData, sceneId: e.target.value })}
            />
          )}

          <Input
            label="Роль в истории (опционально)"
            placeholder="Например: квестодатель, торговец, антагонист..."
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Раса (опционально)"
              placeholder="Эльф, Человек, Дварф..."
              value={formData.race}
              onChange={(e) => setFormData({ ...formData, race: e.target.value })}
            />

            <Input
              label="Класс (опционально)"
              placeholder="Воин, Маг, Жрец..."
              value={formData.npcClass}
              onChange={(e) => setFormData({ ...formData, npcClass: e.target.value })}
            />

            <Select
              label="Мировоззрение"
              options={[
                { value: '', label: 'Случайное' },
                { value: 'Lawful Good', label: 'Законный добрый' },
                { value: 'Neutral Good', label: 'Нейтральный добрый' },
                { value: 'Chaotic Good', label: 'Хаотичный добрый' },
                { value: 'Lawful Neutral', label: 'Законный нейтральный' },
                { value: 'True Neutral', label: 'Истинно нейтральный' },
                { value: 'Chaotic Neutral', label: 'Хаотичный нейтральный' },
                { value: 'Lawful Evil', label: 'Законный злой' },
                { value: 'Neutral Evil', label: 'Нейтральный злой' },
                { value: 'Chaotic Evil', label: 'Хаотичный злой' },
              ]}
              value={formData.alignment}
              onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
            />
          </div>

          <Textarea
            label="Дополнительный контекст (опционально)"
            placeholder="Любая дополнительная информация о персонаже..."
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            rows={3}
          />

          {error && (
            <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
              {error}
            </div>
          )}

          {success && generatedNPC && (
            <div className="p-4 bg-secondary/10 border border-secondary rounded-lg text-secondary animate-fade-in">
              <div className="font-bold mb-2">✓ NPC создан!</div>
              <div className="text-sm">
                <span className="font-medium">{generatedNPC.name}</span>
                {generatedNPC.race && generatedNPC.class && (
                  <span className="text-xs opacity-80"> — {generatedNPC.race} {generatedNPC.class}</span>
                )}
                <br />
                <span className="text-xs opacity-80">Страница обновится автоматически...</span>
              </div>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            🎭 Создать NPC
          </Button>
        </>
      )}
    </form>
  );
}

