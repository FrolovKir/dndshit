'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';

interface CreditBudget {
  tier: string;
  totalTokens: number;
  usedTokens: number;
  resetAt: string;
}

interface Stats {
  totalProjects: number;
  totalRequests: number;
  totalTokens: number;
  byType: Record<string, number>;
  successRate: number;
}

interface ProfileData {
  user: {
    id: string;
    name: string;
    email?: string;
    createdAt: string;
  };
  budget: CreditBudget;
  stats: Stats;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-400">Загрузка профиля...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-400">Не удалось загрузить профиль</p>
      </div>
    );
  }

  const usagePercent = (profile.budget.usedTokens / profile.budget.totalTokens) * 100;
  const remainingTokens = profile.budget.totalTokens - profile.budget.usedTokens;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Профиль</h1>
        <p className="text-gray-400">{profile.user.name}</p>
      </div>

      {/* Tier Card */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Тариф: <span className="text-primary capitalize">{profile.budget.tier}</span>
            </h2>
            <p className="text-sm text-gray-400">
              Сброс лимита: {new Date(profile.budget.resetAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="secondary">Изменить тариф</Button>
          </Link>
        </div>

        {/* Token Usage */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Использовано токенов</span>
            <span className="font-mono">
              {profile.budget.usedTokens.toLocaleString()} / {profile.budget.totalTokens.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                usagePercent > 90
                  ? 'bg-danger'
                  : usagePercent > 70
                  ? 'bg-yellow-500'
                  : 'bg-secondary'
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Осталось</span>
            <span className={`font-mono ${remainingTokens < 10000 ? 'text-danger' : 'text-secondary'}`}>
              {remainingTokens.toLocaleString()} токенов
            </span>
          </div>
        </div>

        {usagePercent > 90 && (
          <div className="mt-4 p-3 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
            ⚠️ У вас заканчиваются токены. Рекомендуем обновить тариф.
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{profile.stats.totalProjects}</div>
            <div className="text-sm text-gray-400 mt-1">Проектов</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">{profile.stats.totalRequests}</div>
            <div className="text-sm text-gray-400 mt-1">Запросов</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">
              {(profile.stats.successRate * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">Успешных</div>
          </div>
        </Card>
      </div>

      {/* Usage by Type */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Использование по типам</h2>
        <div className="space-y-3">
          {Object.entries(profile.stats.byType).map(([type, tokens]) => {
            const percent = (tokens / profile.stats.totalTokens) * 100;
            const typeLabels: Record<string, string> = {
              session: '📚 Кампании',
              scene: '🎬 Сцены',
              npc: '🎭 NPC',
              encounter: '⚔️ Энкаунтеры',
            };
            
            return (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{typeLabels[type] || type}</span>
                  <span className="font-mono text-gray-400">{tokens.toLocaleString()} токенов</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Account Info */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Информация об аккаунте</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">ID пользователя</span>
            <span className="font-mono">{profile.user.id}</span>
          </div>
          {profile.user.email && (
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{profile.user.email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-400">Дата регистрации</span>
            <span>{new Date(profile.user.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

