'use client';

import { useState } from 'react';
import Button from './Button';
import Select from './Select';
import Input from './Input';
import Textarea from './Textarea';

interface GenerateQuestFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export default function GenerateQuestForm({ projectId, onSuccess }: GenerateQuestFormProps) {
  const [questType, setQuestType] = useState('investigation');
  const [difficulty, setDifficulty] = useState('medium');
  const [partyLevel, setPartyLevel] = useState<number>(3);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/quest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          questType,
          difficulty,
          partyLevel: partyLevel || undefined,
          context: context || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Generation failed');
      }

      // Успех
      if (onSuccess) {
        onSuccess();
      }

      // Очищаем форму
      setContext('');
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

      <Select
        label="Тип квеста"
        value={questType}
        onChange={(e) => setQuestType(e.target.value)}
        required
      >
        <option value="investigation">🔍 Расследование</option>
        <option value="rescue">🆘 Спасение</option>
        <option value="escort">🚶 Сопровождение</option>
        <option value="delivery">📦 Доставка</option>
        <option value="heist">💰 Ограбление</option>
        <option value="defense">🛡️ Защита</option>
        <option value="assassination">⚔️ Устранение</option>
        <option value="diplomatic">🤝 Дипломатия</option>
      </Select>

      <Select
        label="Сложность"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        required
      >
        <option value="easy">Лёгкий</option>
        <option value="medium">Средний</option>
        <option value="hard">Сложный</option>
      </Select>

      <Input
        label="Уровень партии (опц.)"
        type="number"
        min="1"
        max="20"
        value={partyLevel}
        onChange={(e) => setPartyLevel(parseInt(e.target.value) || 3)}
      />

      <Textarea
        label="Дополнительный контекст (опц.)"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        placeholder="Например: квест должен быть связан с главным антагонистом, происходить в лесу, включать переговоры с эльфами..."
        rows={3}
      />

      <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 text-xs text-gray-400">
        💡 AI использует существующих NPC как квестодателей и привязывает квест к вашему сеттингу
      </div>

      <Button type="submit" disabled={loading} fullWidth>
        {loading ? '⏳ Генерация квеста...' : '📜 Сгенерировать квест'}
      </Button>
    </form>
  );
}

