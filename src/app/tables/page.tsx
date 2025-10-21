'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Select from '@/components/Select';

interface TableInfo {
  id: string;
  category: string;
  name: string;
  description: string;
  diceFormula: string;
  entryCount: number;
}

interface RollResult {
  id: string;
  tableName: string;
  diceFormula: string;
  roll: number;
  result: string;
  details?: string;
  timestamp: Date;
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [history, setHistory] = useState<RollResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Быстрые генераторы
  const [nameType, setNameType] = useState<'human_male' | 'human_female' | 'elf' | 'dwarf'>('human_male');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/random-table');
      const data = await response.json();
      if (data.success) {
        setTables(data.tables);
        if (data.tables.length > 0) {
          setSelectedTable(data.tables[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    }
  };

  const rollTable = async () => {
    if (!selectedTable) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/random-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId: selectedTable }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Roll failed');
      }

      const result: RollResult = {
        id: Math.random().toString(36).substr(2, 9),
        tableName: data.table.name,
        diceFormula: data.table.diceFormula,
        roll: data.roll,
        result: data.result.text,
        details: data.result.details,
        timestamp: new Date(),
      };

      setHistory([result, ...history]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateName = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/random-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'random_name', nameType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Name generation failed');
      }

      const result: RollResult = {
        id: Math.random().toString(36).substr(2, 9),
        tableName: 'Случайное имя',
        diceFormula: 'random',
        roll: 0,
        result: data.result,
        details: `Тип: ${nameType}`,
        timestamp: new Date(),
      };

      setHistory([result, ...history]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateTavern = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/random-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'random_tavern' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Tavern generation failed');
      }

      const result: RollResult = {
        id: Math.random().toString(36).substr(2, 9),
        tableName: 'Название таверны',
        diceFormula: 'random',
        roll: 0,
        result: data.result,
        timestamp: new Date(),
      };

      setHistory([result, ...history]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeFromHistory = (id: string) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  // Группировка таблиц по категориям
  const tablesByCategory = tables.reduce((acc, table) => {
    if (!acc[table.category]) {
      acc[table.category] = [];
    }
    acc[table.category].push(table);
    return acc;
  }, {} as Record<string, TableInfo[]>);

  const categoryLabels: Record<string, string> = {
    encounters: '⚔️ Встречи',
    events: '🎭 События',
    weather: '🌤️ Погода',
    rumors: '💬 Слухи',
    loot: '💎 Находки',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">🎲 Случайные таблицы</h1>
        <p className="text-gray-400">
          Классические таблицы D&D 5e для импровизации и разнообразия
        </p>
      </div>

      {/* Error message */}
      {error && (
        <Card className="bg-red-900/20 border-red-500">
          <p className="text-red-400">{error}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка: таблицы */}
        <div className="lg:col-span-2 space-y-6">
          {/* Быстрые генераторы */}
          <Card>
            <h2 className="text-xl font-bold mb-4">⚡ Быстрая генерация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select
                  label="Тип имени"
                  value={nameType}
                  onChange={(e) => setNameType(e.target.value as any)}
                >
                  <option value="human_male">Человек (м)</option>
                  <option value="human_female">Человек (ж)</option>
                  <option value="elf">Эльф</option>
                  <option value="dwarf">Дварф</option>
                </Select>
                <Button onClick={generateName} disabled={loading} fullWidth size="sm">
                  🎭 Имя персонажа
                </Button>
              </div>
              <div className="flex items-end">
                <Button onClick={generateTavern} disabled={loading} fullWidth size="sm">
                  🍺 Название таверны
                </Button>
              </div>
            </div>
          </Card>

          {/* Таблицы по категориям */}
          {Object.entries(tablesByCategory).map(([category, categoryTables]) => (
            <Card key={category}>
              <h2 className="text-xl font-bold mb-4">{categoryLabels[category] || category}</h2>
              <div className="space-y-2">
                {categoryTables.map((table) => (
                  <div
                    key={table.id}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      selectedTable === table.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-primary">{table.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{table.description}</p>
                      </div>
                      <div className="ml-3 text-right">
                        <span className="text-xs bg-gray-800 px-2 py-1 rounded">
                          {table.diceFormula}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {table.entryCount} вариантов
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Правая колонка: кнопка броска и активная таблица */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <h3 className="text-lg font-bold mb-4">Выбранная таблица</h3>
            {selectedTable ? (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  {tables.find((t) => t.id === selectedTable)?.name}
                </p>
                <Button onClick={rollTable} disabled={loading} fullWidth size="lg">
                  {loading ? 'Бросок...' : '🎲 Бросить кубик'}
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500">Выберите таблицу слева</p>
            )}
          </Card>
        </div>
      </div>

      {/* История бросков */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">📜 История бросков</h2>
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Очистить всё
            </Button>
          </div>

          <div className="space-y-3">
            {history.map((item) => (
              <Card key={item.id} className="relative">
                <button
                  onClick={() => removeFromHistory(item.id)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors"
                  title="Удалить"
                >
                  ✕
                </button>

                <div className="flex items-start space-x-4">
                  {item.diceFormula !== 'random' && (
                    <div className="flex-shrink-0 w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs text-gray-400">{item.diceFormula}</div>
                        <div className="text-2xl font-bold text-primary">{item.roll}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-400">
                        {item.tableName}
                      </span>
                      <span className="text-xs text-gray-600">
                        {item.timestamp.toLocaleTimeString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-primary mb-1">{item.result}</p>
                    {item.details && (
                      <p className="text-sm text-gray-400">{item.details}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

