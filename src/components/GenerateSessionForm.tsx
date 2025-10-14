'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface GenerateSessionFormProps {
  onSuccess?: () => void;
}

export default function GenerateSessionForm({ onSuccess }: GenerateSessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [formData, setFormData] = useState({
    theme: '',
    setting: 'Forgotten Realms',
    level: '1-5',
    playerCount: '4',
    atmosphericDescription: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/generate/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: formData.theme || undefined,
          setting: formData.setting,
          level: formData.level,
          playerCount: parseInt(formData.playerCount),
          atmosphericDescription: formData.atmosphericDescription || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка генерации');
      }

      setSuccess(true);
      setGeneratedData(data);
      setFormData({ theme: '', setting: 'Forgotten Realms', level: '1-5', playerCount: '4', atmosphericDescription: '' });
      
      // Показываем статистику создания
      if (data.stats) {
        const statsMsg = `✅ Создано: ${data.stats.scenesCreated} сцен, ${data.stats.npcsCreated} NPC, ${data.stats.encountersCreated} энкаунтеров`;
        console.log(statsMsg);
      }
      
      // Обновляем список проектов с небольшой задержкой
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Тема кампании (опционально)"
        placeholder="Например: древние руины, пробуждение темного бога, политические интриги..."
        value={formData.theme}
        onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
        rows={2}
      />

      <Textarea
        label="Художественное описание для погружения (опционально)"
        placeholder="Опишите атмосферу, которую хотите создать: 'Тёмная и мрачная атмосфера в духе готического хоррора, где каждая тень скрывает опасность...' или 'Весёлое и лёгкое приключение в духе Монти Пайтона с юмором и абсурдом...'"
        value={formData.atmosphericDescription}
        onChange={(e) => setFormData({ ...formData, atmosphericDescription: e.target.value })}
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Сеттинг"
          options={[
            { value: 'Forgotten Realms', label: 'Забытые Королевства' },
            { value: 'Eberron', label: 'Эберрон' },
            { value: 'Greyhawk', label: 'Грейхок' },
            { value: 'Custom', label: 'Свой мир' },
          ]}
          value={formData.setting}
          onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
        />

        <Select
          label="Уровень персонажей"
          options={[
            { value: '1-5', label: '1-5 уровень' },
            { value: '5-10', label: '5-10 уровень' },
            { value: '10-15', label: '10-15 уровень' },
            { value: '15-20', label: '15-20 уровень' },
          ]}
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
        />

        <Input
          label="Количество игроков"
          type="number"
          min="2"
          max="8"
          value={formData.playerCount}
          onChange={(e) => setFormData({ ...formData, playerCount: e.target.value })}
        />
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger rounded-lg text-danger">
          {error}
        </div>
      )}

      {success && generatedData && (
        <div className="p-4 bg-secondary/10 border border-secondary rounded-lg text-secondary animate-fade-in">
          <div className="font-bold text-lg mb-3">
            ✓ Кампания "{generatedData.project?.title || 'Новая кампания'}" успешно создана!
          </div>
          <div className="text-sm space-y-2">
            <p className="font-medium">Автоматически сгенерировано:</p>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="bg-secondary/20 rounded p-2 text-center">
                <div className="text-xl font-bold">{generatedData.stats?.scenesCreated || 0}</div>
                <div className="text-xs">сцен</div>
              </div>
              <div className="bg-secondary/20 rounded p-2 text-center">
                <div className="text-xl font-bold">{generatedData.stats?.npcsCreated || 0}</div>
                <div className="text-xs">NPC</div>
              </div>
              <div className="bg-secondary/20 rounded p-2 text-center">
                <div className="text-xl font-bold">{generatedData.stats?.encountersCreated || 0}</div>
                <div className="text-xs">энкаунтеров</div>
              </div>
            </div>
            <p className="text-xs opacity-80">
              Проверьте список проектов ниже и откройте кампанию для просмотра всех деталей.
            </p>
          </div>
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        🎲 Создать кампанию
      </Button>
    </form>
  );
}

