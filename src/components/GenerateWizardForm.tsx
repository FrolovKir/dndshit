'use client';

import { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import Textarea from './Textarea';

interface GenerateWizardFormProps {
  onSuccess?: () => void;
}

type Step = 'base' | 'scenes' | 'npcs' | 'encounters' | 'complete';

interface StepProgress {
  step: Step;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
  tokensUsed?: number;
  itemsCreated?: number;
}

export default function GenerateWizardForm({ onSuccess }: GenerateWizardFormProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('base');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [sceneIds, setSceneIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    overview: '',
    tone: '',
    atmospheric: '',
    setting: '',
    conflictScale: 'региональный',
    levelRange: '1-5',
    playerCount: '4',
    playstyle: 'баланс',
    sessionLength: 'средняя',
    experience: 'смешанная',
    constraints: '',
  });

  const [progress, setProgress] = useState<StepProgress[]>([
    { step: 'base', label: 'Создание основы кампании', status: 'pending' },
    { step: 'scenes', label: 'Генерация 10 сцен', status: 'pending' },
    { step: 'npcs', label: 'Создание NPC для каждой сцены', status: 'pending' },
    { step: 'encounters', label: 'Детализация боевых энкаунтеров', status: 'pending' },
    { step: 'complete', label: 'Завершение', status: 'pending' },
  ]);

  const updateProgress = (step: Step, updates: Partial<StepProgress>) => {
    setProgress(prev => prev.map(p =>
      p.step === step ? { ...p, ...updates } : p
    ));
  };

  const handleStartWizard = async () => {
    setLoading(true);
    setCurrentStep('base');

    try {
      // ШАГ 1: Создание базового описания кампании
      updateProgress('base', { status: 'in_progress', message: 'Генерируем основу кампании...' });

      const baseResponse = await fetch('/api/generate/campaign-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overview: formData.overview || undefined,
          tone: formData.tone || undefined,
          atmospheric: formData.atmospheric || undefined,
          setting: formData.setting || undefined,
          conflictScale: formData.conflictScale || undefined,
          levelRange: formData.levelRange || undefined,
          playerCount: parseInt(formData.playerCount),
          playstyle: formData.playstyle || undefined,
          sessionLength: formData.sessionLength || undefined,
          experience: formData.experience || undefined,
          constraints: formData.constraints || undefined,
        }),
      });

      if (!baseResponse.ok) {
        const error = await baseResponse.json();
        throw new Error(error.error || 'Failed to generate campaign base');
      }

      const baseData = await baseResponse.json();
      setProjectId(baseData.project.id);

      updateProgress('base', {
        status: 'completed',
        message: `Кампания "${baseData.campaignData.title}" создана`,
        tokensUsed: baseData.tokensUsed,
      });

      // ШАГ 2: Генерация сцен
      setCurrentStep('scenes');
      updateProgress('scenes', { status: 'in_progress', message: 'Генерируем 10 детальных сцен...' });

      const scenesResponse = await fetch('/api/generate/campaign-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: baseData.project.id }),
      });

      if (!scenesResponse.ok) {
        const error = await scenesResponse.json();
        throw new Error(error.error || 'Failed to generate scenes');
      }

      const scenesData = await scenesResponse.json();
      setSceneIds(scenesData.sceneIds);

      updateProgress('scenes', {
        status: 'completed',
        message: `Создано ${scenesData.scenesCreated} сцен`,
        tokensUsed: scenesData.tokensUsed,
        itemsCreated: scenesData.scenesCreated,
      });

      // ШАГ 3: Генерация NPC для каждой сцены
      setCurrentStep('npcs');
      updateProgress('npcs', { status: 'in_progress', message: 'Создаем NPC для каждой сцены...' });

      let totalNpcs = 0;
      let totalNpcTokens = 0;

      for (let i = 0; i < scenesData.sceneIds.length; i++) {
        const sceneId = scenesData.sceneIds[i];
        updateProgress('npcs', {
          status: 'in_progress',
          message: `Создаем NPC для сцены ${i + 1}/${scenesData.sceneIds.length}...`,
        });

        const npcsResponse = await fetch('/api/generate/scene-npcs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneId }),
        });

        if (npcsResponse.ok) {
          const npcsData = await npcsResponse.json();
          totalNpcs += npcsData.npcsCreated;
          totalNpcTokens += npcsData.tokensUsed;
        }
      }

      updateProgress('npcs', {
        status: 'completed',
        message: `Создано ${totalNpcs} NPC`,
        tokensUsed: totalNpcTokens,
        itemsCreated: totalNpcs,
      });

      // ШАГ 4: Генерация детальных энкаунтеров для боевых сцен
      setCurrentStep('encounters');
      updateProgress('encounters', { status: 'in_progress', message: 'Создаем детальные энкаунтеры...' });

      // Получаем боевые сцены по новому типу
      const combatScenes = scenesData.scenesData.scenes.filter(
        (s: any) => (s.type || s.sceneType) === 'Conflict' || s.sceneType === 'combat'
      );

      let totalEncounters = 0;
      let totalEncounterTokens = 0;

      // Целимся в 10-20 энкаунтеров: если боевых сцен меньше — дублируем раунды
      const targetMin = 10;
      const targetMax = 20;
      const rounds = Math.max(1, Math.ceil(targetMin / Math.max(1, combatScenes.length)));

      for (let r = 0; r < rounds; r++) {
        for (let i = 0; i < combatScenes.length; i++) {
          const sceneIndex = scenesData.scenesData.scenes.indexOf(combatScenes[i]);
          const sceneId = scenesData.sceneIds[sceneIndex];

          updateProgress('encounters', {
            status: 'in_progress',
            message: `Детализируем энкаунтер ${totalEncounters + 1}/${Math.min(targetMax, combatScenes.length * rounds)}...`,
          });

          const encounterResponse = await fetch('/api/generate/scene-encounter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sceneId }),
          });

          if (encounterResponse.ok) {
            const encounterData = await encounterResponse.json();
            totalEncounters++;
            totalEncounterTokens += encounterData.tokensUsed;
          }

          if (totalEncounters >= targetMax) break;
        }
        if (totalEncounters >= targetMax) break;
      }

      updateProgress('encounters', {
        status: 'completed',
        message: `Создано ${totalEncounters} энкаунтеров`,
        tokensUsed: totalEncounterTokens,
        itemsCreated: totalEncounters,
      });

      // Завершение
      setCurrentStep('complete');
      updateProgress('complete', { status: 'completed', message: 'Кампания полностью готова!' });

      // Успех!
      setFormData({
        overview: '',
        tone: '',
        atmospheric: '',
        setting: '',
        conflictScale: 'региональный',
        levelRange: '1-5',
        playerCount: '4',
        playstyle: 'баланс',
        sessionLength: 'средняя',
        experience: 'смешанная',
        constraints: '',
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);

    } catch (error: any) {
      console.error('Wizard error:', error);
      updateProgress(currentStep, {
        status: 'error',
        message: error.message || 'Произошла ошибка',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalTokens = progress.reduce((sum, p) => sum + (p.tokensUsed || 0), 0);
  const totalItems = progress.reduce((sum, p) => sum + (p.itemsCreated || 0), 0);
  const completedSteps = progress.filter(p => p.status === 'completed').length;
  const progressPercent = (completedSteps / progress.length) * 100;

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); handleStartWizard(); }} className="space-y-4">
        <Textarea
          label="Общее описание (свободная форма)"
          placeholder="О чем кампания? Основные мотивы, настроение, идеи..."
          value={formData.overview}
          onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
          rows={3}
          disabled={loading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Тон и жанр"
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            placeholder="тёмное фэнтези / эпик / нуар / стимпанк"
            disabled={loading}
          />
          <Input
            label="Атмосфера (ассоциации)"
            value={formData.atmospheric}
            onChange={(e) => setFormData({ ...formData, atmospheric: e.target.value })}
            placeholder="Ведьмак + Bloodborne + Dark Souls"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Масштаб конфликта"
            value={formData.conflictScale}
            onChange={(e) => setFormData({ ...formData, conflictScale: e.target.value })}
            disabled={loading}
          >
            <option value="локальный">🏘️ Локальный (город/регион)</option>
            <option value="региональный">🏰 Региональный (королевство)</option>
            <option value="мировая угроза">🌍 Мировая угроза</option>
            <option value="планарный">✨ Планарный (мультивселенная)</option>
          </Select>

          <Select
            label="Диапазон уровней"
            value={formData.levelRange}
            onChange={(e) => setFormData({ ...formData, levelRange: e.target.value })}
            disabled={loading}
          >
            <option value="1-5">🌱 1-5 уровни (новички)</option>
            <option value="3-8">⚔️ 3-8 уровни (герои)</option>
            <option value="5-10">🏆 5-10 уровни (чемпионы)</option>
            <option value="9-15">👑 9-15 уровни (лорды)</option>
            <option value="15-20">⭐ 15-20 уровни (легенды)</option>
          </Select>

          <Select
            label="Количество игроков"
            value={formData.playerCount}
            onChange={(e) => setFormData({ ...formData, playerCount: e.target.value })}
            disabled={loading}
          >
            <option value="2">👥 2 игрока (дуэт)</option>
            <option value="3">👥 3 игрока</option>
            <option value="4">👥 4 игрока (стандарт)</option>
            <option value="5">👥 5 игроков</option>
            <option value="6">👥 6 игроков (большая группа)</option>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Стиль прохождения"
            value={formData.playstyle}
            onChange={(e) => setFormData({ ...formData, playstyle: e.target.value })}
            disabled={loading}
          >
            <option value="боёв больше">⚔️ Боёв больше</option>
            <option value="социалька">🎭 Социальные взаимодействия</option>
            <option value="баланс">⚖️ Сбалансированно</option>
            <option value="исследование мира">🗺️ Исследование мира</option>
            <option value="интриги">🕵️ Интриги и заговоры</option>
          </Select>

          <Select
            label="Длительность сессий"
            value={formData.sessionLength}
            onChange={(e) => setFormData({ ...formData, sessionLength: e.target.value })}
            disabled={loading}
          >
            <option value="короткая">⏱️ Короткие (2-3 часа)</option>
            <option value="средняя">🕐 Средние (4-5 часов)</option>
            <option value="длинная">🕕 Длинные (6+ часов)</option>
          </Select>

          <Select
            label="Опыт группы"
            value={formData.experience || 'смешанная'}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
            disabled={loading}
          >
            <option value="новички">🌱 Новички</option>
            <option value="смешанная">🎯 Смешанная</option>
            <option value="опытные">⭐ Опытные игроки</option>
          </Select>
        </div>

        <Input
          label="Ограничения (опционально)"
          value={formData.constraints}
          onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
          placeholder="нет высоких технологий, магия редка, нет богов, только люди..."
          disabled={loading}
        />

        <Input
          label="Сеттинг / Мир (опционально)"
          value={formData.setting}
          onChange={(e) => setFormData({ ...formData, setting: e.target.value })}
          placeholder="Forgotten Realms, Эберрон, свой мир..."
          disabled={loading}
        />

        <Button type="submit" loading={loading} className="w-full text-lg py-3">
          🎲 Запустить генерацию полной кампании
        </Button>
      </form>

      {/* Progress Section */}
      {loading || completedSteps > 0 ? (
        <div className="space-y-4 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">Прогресс генерации</h3>
            <span className="text-sm text-foreground/60">{Math.round(progressPercent)}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-background/50 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3 mt-4">
            {progress.map((step, idx) => (
              <div key={step.step} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {step.status === 'completed' && (
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-background text-sm">✓</span>
                    </div>
                  )}
                  {step.status === 'in_progress' && (
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  )}
                  {step.status === 'pending' && (
                    <div className="w-6 h-6 rounded-full border-2 border-foreground/20" />
                  )}
                  {step.status === 'error' && (
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-sm">✕</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-medium">{step.label}</div>
                  {step.message && (
                    <div className={`text-sm mt-1 ${
                      step.status === 'error' ? 'text-red-500' : 'text-foreground/60'
                    }`}>
                      {step.message}
                    </div>
                  )}
                  {step.tokensUsed && (
                    <div className="text-xs text-foreground/40 mt-1">
                      Токенов: {step.tokensUsed.toLocaleString()}
                      {step.itemsCreated && ` • Создано: ${step.itemsCreated}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {completedSteps === progress.length && (
            <div className="mt-6 p-4 bg-secondary/10 border border-secondary rounded-lg">
              <div className="text-center">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-bold text-lg mb-2">Кампания готова к игре!</div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{totalItems}</div>
                    <div className="text-xs text-foreground/60">Элементов создано</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalTokens.toLocaleString()}</div>
                    <div className="text-xs text-foreground/60">Токенов использовано</div>
                  </div>
                </div>
                <div className="text-sm text-foreground/60 mt-4">
                  Проверьте список проектов ниже →
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Info Block */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm">
        <div className="font-medium mb-2">🚀 Как работает поэтапная генерация:</div>
        <ol className="list-decimal list-inside space-y-1 text-foreground/70">
          <li><strong>Основа:</strong> Создается синопсис, антагонист, ключевые локации (~2000 токенов)</li>
          <li><strong>Сцены:</strong> Генерируются 10 детальных сцен с описаниями (~6000 токенов)</li>
          <li><strong>NPC:</strong> Для каждой сцены создается 2-3 персонажа (~3000 токенов × 10)</li>
          <li><strong>Энкаунтеры:</strong> Боевые сцены получают детальную тактику (~2500 токенов × 3-4)</li>
        </ol>
        <div className="mt-3 pt-3 border-t border-primary/20">
          <strong>Итого:</strong> ~40,000-50,000 токенов • 25-30 NPC • 3-4 энкаунтера • Готовая кампания!
        </div>
      </div>
    </div>
  );
}

