'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Textarea from './Textarea';

interface CreateSessionFormProps {
  projectId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateSessionForm({
  projectId,
  onSuccess,
  onCancel,
}: CreateSessionFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<number>(180); // 3 часа по умолчанию
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [playerDecisions, setPlayerDecisions] = useState('');
  const [xpAwarded, setXpAwarded] = useState<number>(0);
  const [cliffhanger, setCliffhanger] = useState('');
  const [nextGoals, setNextGoals] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          title: title || undefined,
          date: new Date(date),
          duration: duration || undefined,
          summary: summary || undefined,
          notes: notes || undefined,
          playerDecisions: playerDecisions || undefined,
          xpAwarded: xpAwarded || undefined,
          cliffhanger: cliffhanger || undefined,
          nextGoals: nextGoals || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Название (опц.)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Битва за башню"
        />
        <Input
          label="Дата"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Длительность (мин)"
          type="number"
          min="0"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
        />
        <Input
          label="Выдано XP"
          type="number"
          min="0"
          value={xpAwarded}
          onChange={(e) => setXpAwarded(parseInt(e.target.value) || 0)}
        />
      </div>

      <Textarea
        label="Краткое резюме"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Что произошло за сессию в двух словах..."
        rows={2}
      />

      <Textarea
        label="Детальные заметки"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Подробные заметки мастера: что говорили NPC, какие проверки были, важные моменты..."
        rows={4}
      />

      <Textarea
        label="Важные решения игроков"
        value={playerDecisions}
        onChange={(e) => setPlayerDecisions(e.target.value)}
        placeholder="Какие выборы сделали игроки? Как это повлияет на сюжет?"
        rows={3}
      />

      <Textarea
        label="На чём остановились"
        value={cliffhanger}
        onChange={(e) => setCliffhanger(e.target.value)}
        placeholder="Клиффхэнгер для следующей сессии..."
        rows={2}
      />

      <Textarea
        label="Цели на следующую сессию"
        value={nextGoals}
        onChange={(e) => setNextGoals(e.target.value)}
        placeholder="Что нужно подготовить, какие сцены будут следующими..."
        rows={2}
      />

      {/* Кнопки */}
      <div className="flex space-x-3">
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Создание...' : 'Создать запись'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} fullWidth>
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}

