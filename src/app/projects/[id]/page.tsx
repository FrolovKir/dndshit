'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import EditModal from '@/components/EditModal';
import ConfirmModal from '@/components/ConfirmModal';
import EditProjectForm from '@/components/EditProjectForm';
import EditSceneForm from '@/components/EditSceneForm';
import EditNPCForm from '@/components/EditNPCForm';
import EditEncounterForm from '@/components/EditEncounterForm';
import GenerateSceneForm from '@/components/GenerateSceneForm';
import GenerateNPCForm from '@/components/GenerateNPCForm';
import GenerateEncounterForm from '@/components/GenerateEncounterForm';
import GenerateQuestForm from '@/components/GenerateQuestForm';
import CreateSceneForm from '@/components/CreateSceneForm';
import CreateNPCForm from '@/components/CreateNPCForm';
import CreateEncounterForm from '@/components/CreateEncounterForm';
import CreatePlayerCharacterForm from '@/components/CreatePlayerCharacterForm';
import EditPlayerCharacterForm from '@/components/EditPlayerCharacterForm';
import CreateSessionForm from '@/components/CreateSessionForm';

interface Scene {
  id: string;
  title: string;
  description: string;
  sceneType: string;
  order: number;
}

interface NPC {
  id: string;
  name: string;
  race?: string;
  class?: string;
  level?: number;
  alignment?: string;
  personality?: string;
  backstory?: string;
  appearance?: string;
  motivations?: string;
  stats?: string;
  imageUrl?: string;
  roleInScene?: string;
  hiddenAgenda?: string;
  interactionOptions?: string;
}

interface Encounter {
  id: string;
  title: string;
  description: string;
  encounterType: string;
  difficulty?: string;
  monsters?: string;
  environment?: string;
  tactics?: string;
  rewards?: string;
  estimatedLevel?: number;
}

interface Quest {
  id: string;
  title: string;
  questType: string;
  description: string;
  questGiverId?: string;
  questGiverName?: string;
  objective: string;
  obstacles?: string;
  rewards?: string;
  complications?: string;
  consequences?: string;
  twist?: string;
  status: string;
  difficulty: string;
  estimatedSessions: number;
  relatedScenes?: string;
  relatedNPCs?: string;
}

interface PlayerCharacter {
  id: string;
  playerName: string;
  characterName: string;
  race: string;
  class: string;
  level: number;
  background?: string;
  alignment?: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHP: number;
  currentHP: number;
  armorClass: number;
  speed: number;
  proficiencyBonus: number;
  appearance?: string;
  personality?: string;
  backstory?: string;
  notes?: string;
  imageUrl?: string;
}

interface Session {
  id: string;
  sessionNumber: number;
  title: string;
  date: string;
  duration?: number;
  summary?: string;
  notes?: string;
  playerDecisions?: string;
  xpAwarded?: number;
  cliffhanger?: string;
  nextGoals?: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  synopsis?: string;
  setting?: string;
  scenes: Scene[];
  npcs: NPC[];
  encounters: Encounter[];
  quests: Quest[];
  playerCharacters: PlayerCharacter[];
  sessions: Session[];
}

// Компонент для отображения NPC
function NPCCard({ npc, onEdit, onDelete }: { npc: NPC; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  
  // Парсим статы если они есть
  let stats: Record<string, number> | null = null;
  if (npc.stats) {
    try {
      stats = JSON.parse(npc.stats);
    } catch (e) {
      // Игнорируем ошибки парсинга
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Портрет и базовая информация */}
      <div className="flex gap-4">
        {/* Портрет */}
        {npc.imageUrl && (
          <div className="flex-shrink-0">
            <img 
              src={npc.imageUrl} 
              alt={npc.name}
              className="w-32 h-32 object-cover rounded-lg border-2 border-primary/20"
            />
          </div>
        )}
        
        {/* Основная информация */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-primary">{npc.name}</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                ✏️
              </Button>
              <Button variant="danger" size="sm" onClick={onDelete}>
                🗑️
              </Button>
            </div>
          </div>
          
          {/* Краткая информация */}
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            {npc.race && (
              <div>
                <span className="text-gray-500">Раса:</span>
                <span className="ml-2 text-gray-300">{npc.race}</span>
              </div>
            )}
            {npc.class && (
              <div>
                <span className="text-gray-500">Класс:</span>
                <span className="ml-2 text-gray-300">
                  {npc.class} {npc.level && `(ур. ${npc.level})`}
                </span>
              </div>
            )}
            {npc.alignment && (
              <div className="col-span-2">
                <span className="text-gray-500">Мировоззрение:</span>
                <span className="ml-2 text-gray-300">{npc.alignment}</span>
              </div>
            )}
          </div>

          {/* Характеристики (если есть) */}
          {stats && (
            <div className="grid grid-cols-6 gap-2 mb-3">
              {Object.entries(stats).map(([stat, value]) => (
                <div key={stat} className="text-center bg-gray-800/50 rounded px-1 py-1">
                  <div className="text-xs text-gray-500 uppercase">{stat}</div>
                  <div className="text-sm font-bold text-primary">{value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Внешность (краткая) */}
      {npc.appearance && (
        <div className="mt-3 text-sm">
          <span className="text-gray-500 font-medium">👤 Внешность:</span>
          <p className="text-gray-300 mt-1 line-clamp-2">{npc.appearance}</p>
        </div>
      )}

      {/* Роль в сцене */}
      {npc.roleInScene && (
        <div className="mt-3 text-sm">
          <span className="text-gray-500 font-medium">🎭 Роль в сцене:</span>
          <p className="text-gray-300 mt-1">{npc.roleInScene}</p>
        </div>
      )}

      {/* Скрытый интерес */}
      {npc.hiddenAgenda && (
        <div className="mt-3 text-sm">
          <span className="text-gray-500 font-medium">🔒 Скрытый интерес:</span>
          <p className="text-gray-300 mt-1 italic">{npc.hiddenAgenda}</p>
        </div>
      )}

      {/* Кнопка раскрытия */}
      {(npc.personality || npc.backstory || npc.motivations || npc.interactionOptions) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-3 border-t border-gray-800 text-sm text-primary hover:text-primary-light transition-colors flex items-center justify-center gap-2"
        >
          {expanded ? '▲ Свернуть' : '▼ Подробнее'}
        </button>
      )}

      {/* Расширенная информация */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800 space-y-3 animate-fade-in">
          {npc.personality && (
            <div className="text-sm">
              <div className="text-gray-500 font-medium mb-1">💭 Личность:</div>
              <p className="text-gray-300 whitespace-pre-wrap">{npc.personality}</p>
            </div>
          )}
          
          {npc.backstory && (
            <div className="text-sm">
              <div className="text-gray-500 font-medium mb-1">📜 Предыстория:</div>
              <p className="text-gray-300 whitespace-pre-wrap">{npc.backstory}</p>
            </div>
          )}
          
          {npc.motivations && (
            <div className="text-sm">
              <div className="text-gray-500 font-medium mb-1">🎯 Мотивации:</div>
              <p className="text-gray-300 whitespace-pre-wrap">{npc.motivations}</p>
            </div>
          )}

          {npc.interactionOptions && (() => {
            try {
              const options = JSON.parse(npc.interactionOptions);
              return (
                <div className="text-sm">
                  <div className="text-gray-500 font-medium mb-2">⚔️ Варианты взаимодействия:</div>
                  <div className="space-y-2 pl-3">
                    {options.if_players_fight && (
                      <div>
                        <span className="text-red-400 font-medium">• Если бой:</span>
                        <p className="text-gray-300 ml-4">{options.if_players_fight}</p>
                      </div>
                    )}
                    {options.if_players_negotiate && (
                      <div>
                        <span className="text-green-400 font-medium">• Если переговоры:</span>
                        <p className="text-gray-300 ml-4">{options.if_players_negotiate}</p>
                      </div>
                    )}
                    {options.if_players_ignore && (
                      <div>
                        <span className="text-gray-400 font-medium">• Если игнорирование:</span>
                        <p className="text-gray-300 ml-4">{options.if_players_ignore}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            } catch (e) {
              return null;
            }
          })()}
        </div>
      )}
    </Card>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'scenes' | 'npcs' | 'encounters' | 'quests' | 'sessions'>('overview');
  const [showAIForms, setShowAIForms] = useState(false);
  const [showManualForms, setShowManualForms] = useState(false);

  // Modal states
  const [editingProject, setEditingProject] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [editingEncounter, setEditingEncounter] = useState<Encounter | null>(null);
  const [editingPlayerCharacter, setEditingPlayerCharacter] = useState<PlayerCharacter | null>(null);
  
  // Session and character management
  const [showCreateCharacter, setShowCreateCharacter] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  
  // Delete confirmation states
  const [deletingProject, setDeletingProject] = useState(false);
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null);
  const [deletingNPC, setDeletingNPC] = useState<NPC | null>(null);
  const [deletingEncounter, setDeletingEncounter] = useState<Encounter | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchProject(params.id as string);
    }
  }, [params.id]);

  const fetchProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      setProject(data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeleteLoading(false);
      setDeletingProject(false);
    }
  };

  const handleDeleteScene = async () => {
    if (!deletingScene || !params.id) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/scenes/${deletingScene.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchProject(params.id as string);
      }
    } catch (error) {
      console.error('Error deleting scene:', error);
    } finally {
      setDeleteLoading(false);
      setDeletingScene(null);
    }
  };

  const handleDeleteNPC = async () => {
    if (!deletingNPC || !params.id) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/npcs/${deletingNPC.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchProject(params.id as string);
      }
    } catch (error) {
      console.error('Error deleting NPC:', error);
    } finally {
      setDeleteLoading(false);
      setDeletingNPC(null);
    }
  };

  const handleDeleteEncounter = async () => {
    if (!deletingEncounter || !params.id) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/encounters/${deletingEncounter.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchProject(params.id as string);
      }
    } catch (error) {
      console.error('Error deleting encounter:', error);
    } finally {
      setDeleteLoading(false);
      setDeletingEncounter(null);
    }
  };

  const handleEditSuccess = async () => {
    if (params.id) {
      await fetchProject(params.id as string);
    }
    setEditingProject(false);
    setEditingScene(null);
    setEditingNPC(null);
    setEditingEncounter(null);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-400">Загрузка проекта...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-400">Проект не найден</p>
        <Link href="/">
          <Button className="mt-4">← Вернуться на главную</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Обзор', count: null },
    { id: 'sessions', label: '📝 Сессии', count: project.sessions?.length || 0 },
    { id: 'scenes', label: 'Сцены', count: project.scenes.length },
    { id: 'npcs', label: 'NPC', count: project.npcs.length },
    { id: 'encounters', label: 'Энкаунтеры', count: project.encounters.length },
    { id: 'quests', label: 'Квесты', count: project.quests?.length || 0 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">← Назад</Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
          {project.setting && (
            <p className="text-gray-400">Сеттинг: {project.setting}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={() => setShowAIForms(!showAIForms)}>🤖 Генерация AI</Button>
          <Button variant="ghost" size="sm" onClick={() => setShowManualForms(!showManualForms)}>✚ Добавить вручную</Button>
          <Button variant="ghost" size="sm" onClick={() => setEditingProject(true)}>✏️ Редактировать</Button>
          <Link href={`/export?projectId=${project.id}`}>
            <Button variant="secondary" size="sm">📤 Экспорт</Button>
          </Link>
          <Button variant="danger" size="sm" onClick={() => setDeletingProject(true)}>🗑️ Удалить</Button>
        </div>
      </div>

      {/* AI Forms */}
      {showAIForms && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="font-bold mb-2">Сцены (AI)</h3>
              <GenerateSceneForm projects={[{ id: project.id, title: project.title }]} projectId={project.id} />
            </div>
            <div>
              <h3 className="font-bold mb-2">NPC (AI)</h3>
              <GenerateNPCForm 
                projects={[{ id: project.id, title: project.title }]}
                projectId={project.id}
                scenes={project.scenes.map(s => ({ id: s.id, title: s.title }))}
              />
            </div>
            <div>
              <h3 className="font-bold mb-2">Энкаунтер (AI)</h3>
              <GenerateEncounterForm projects={[{ id: project.id, title: project.title }]} projectId={project.id} />
            </div>
            <div>
              <h3 className="font-bold mb-2">Квест (AI)</h3>
              <GenerateQuestForm projectId={project.id} onSuccess={handleEditSuccess} />
            </div>
          </div>
        </Card>
      )}

      {/* Manual Forms */}
      {showManualForms && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-bold mb-2">Сцена (вручную)</h3>
              <CreateSceneForm projects={[{ id: project.id, title: project.title }]} projectId={project.id} onSuccess={handleEditSuccess} />
            </div>
            <div>
              <h3 className="font-bold mb-2">NPC (вручную)</h3>
              <CreateNPCForm projects={[{ id: project.id, title: project.title }]} projectId={project.id} scenes={project.scenes.map(s => ({ id: s.id, title: s.title }))} onSuccess={handleEditSuccess} />
            </div>
            <div>
              <h3 className="font-bold mb-2">Энкаунтер (вручную)</h3>
              <CreateEncounterForm projects={[{ id: project.id, title: project.title }]} projectId={project.id} onSuccess={handleEditSuccess} />
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gray-900 text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="ml-2 text-sm bg-gray-800 px-2 py-0.5 rounded">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {project.synopsis && (
              <Card>
                <h2 className="text-xl font-bold mb-4">Синопсис</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{project.synopsis}</p>
              </Card>
            )}
            
            {project.description && (
              <Card>
                <h2 className="text-xl font-bold mb-4">Описание</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{project.description}</p>
              </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{project.scenes.length}</div>
                  <div className="text-sm text-gray-400 mt-1">Сцен</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary">{project.npcs.length}</div>
                  <div className="text-sm text-gray-400 mt-1">NPC</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-500">{project.encounters.length}</div>
                  <div className="text-sm text-gray-400 mt-1">Энкаунтеров</div>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500">{project.quests?.length || 0}</div>
                  <div className="text-sm text-gray-400 mt-1">Квестов</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'scenes' && (
          <div className="space-y-4">
            {project.scenes.length === 0 ? (
              <Card>
                <p className="text-center text-gray-400 py-8">
                  Пока нет сцен. Создайте их на главной странице.
                </p>
              </Card>
            ) : (
              project.scenes.map((scene) => (
                <Card key={scene.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-sm font-mono text-gray-500">#{scene.order}</span>
                        <h3 className="text-xl font-bold text-primary">{scene.title}</h3>
                        <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                          {scene.sceneType}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap line-clamp-3">{scene.description}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => setEditingScene(scene)}>
                        ✏️
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setDeletingScene(scene)}>
                        🗑️
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'npcs' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.npcs.length === 0 ? (
              <Card className="col-span-full">
                <p className="text-center text-gray-400 py-8">
                  Пока нет NPC. Создайте их на главной странице.
                </p>
              </Card>
            ) : (
              project.npcs.map((npc) => (
                <NPCCard 
                  key={npc.id} 
                  npc={npc}
                  onEdit={() => setEditingNPC(npc)}
                  onDelete={() => setDeletingNPC(npc)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="space-y-4">
            {project.encounters.length === 0 ? (
              <Card>
                <p className="text-center text-gray-400 py-8">
                  Пока нет энкаунтеров. Создайте их на главной странице.
                </p>
              </Card>
            ) : (
              project.encounters.map((encounter) => {
                let monstersArray: any[] | null = null;
                if (encounter.monsters) {
                  try {
                    const m = JSON.parse(encounter.monsters);
                    if (Array.isArray(m)) monstersArray = m;
                  } catch {}
                }

                let rewardsObj: any | null = null;
                if (encounter.rewards) {
                  try {
                    const r = JSON.parse(encounter.rewards);
                    if (r && typeof r === 'object') rewardsObj = r;
                  } catch {}
                }

                return (
                  <Card key={encounter.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-bold text-primary">{encounter.title}</h3>
                          {encounter.difficulty && (
                            <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                              {encounter.difficulty}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                            {encounter.encounterType}
                          </span>
                          {encounter.estimatedLevel && (
                            <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                              Lvl {encounter.estimatedLevel}
                            </span>
                          )}
                        </div>

                        {encounter.description && (
                          <p className="text-gray-300 whitespace-pre-wrap mb-3">{encounter.description}</p>
                        )}

                        {/* Монстры */}
                        {monstersArray && monstersArray.length > 0 && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-500 font-medium mb-1">Монстры:</div>
                            <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                              {monstersArray.map((m: any, idx: number) => (
                                <li key={idx}>
                                  {m.name || 'Монстр'}
                                  {typeof m.count !== 'undefined' && ` × ${m.count}`}
                                  {typeof m.cr !== 'undefined' && ` (CR ${m.cr})`}
                                  {typeof m.hp !== 'undefined' && ` • HP ${m.hp}`}
                                  {typeof m.ac !== 'undefined' && ` • AC ${m.ac}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Награды */}
                        {(rewardsObj || encounter.rewards) && (
                          <div className="mb-3">
                            <div className="text-sm text-gray-500 font-medium mb-1">Награды:</div>
                            {rewardsObj ? (
                              <div className="text-sm text-gray-300 space-y-1">
                                {typeof rewardsObj.gold !== 'undefined' && (
                                  <div>Золото: {rewardsObj.gold}</div>
                                )}
                                {Array.isArray(rewardsObj.items) && rewardsObj.items.length > 0 && (
                                  <div>
                                    Предметы:
                                    <ul className="list-disc list-inside">
                                      {rewardsObj.items.map((it: any, i: number) => (
                                        <li key={i}>{typeof it === 'string' ? it : JSON.stringify(it)}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {typeof rewardsObj.xp !== 'undefined' && (
                                  <div>Опыт: {rewardsObj.xp}</div>
                                )}
                                {rewardsObj.note && (
                                  <div>{rewardsObj.note}</div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-300">{encounter.rewards}</p>
                            )}
                          </div>
                        )}

                        {/* Окружение и тактика */}
                        {(encounter.environment || encounter.tactics) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {encounter.environment && (
                              <div>
                                <div className="text-sm text-gray-500 font-medium mb-1">Окружение:</div>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{encounter.environment}</p>
                              </div>
                            )}
                            {encounter.tactics && (
                              <div>
                                <div className="text-sm text-gray-500 font-medium mb-1">Тактика:</div>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap">{encounter.tactics}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => setEditingEncounter(encounter)}>
                          ✏️
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setDeletingEncounter(encounter)}>
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-4">
            {!project.quests || project.quests.length === 0 ? (
              <Card>
                <p className="text-center text-gray-400 py-8">
                  Пока нет квестов. Создайте их через форму генерации выше.
                </p>
              </Card>
            ) : (
              project.quests.map((quest) => {
                let obstacles: any[] = [];
                let rewards: any = null;
                let consequences: any = null;
                let complications: any[] = [];

                try {
                  if (quest.obstacles) obstacles = JSON.parse(quest.obstacles);
                  if (quest.rewards) rewards = JSON.parse(quest.rewards);
                  if (quest.consequences) consequences = JSON.parse(quest.consequences);
                  if (quest.complications) complications = JSON.parse(quest.complications);
                } catch (e) {
                  console.error('Failed to parse quest data:', e);
                }

                return (
                  <Card key={quest.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-bold text-primary">{quest.title}</h3>
                          <span className="px-2 py-1 bg-gray-800 rounded text-xs">
                            {getQuestTypeLabel(quest.questType)}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getQuestDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getQuestStatusColor(quest.status)}`}>
                            {getQuestStatusLabel(quest.status)}
                          </span>
                        </div>

                        {quest.questGiverName && (
                          <p className="text-sm text-gray-400 mb-2">
                            📜 Квестодатель: <span className="text-primary">{quest.questGiverName}</span>
                          </p>
                        )}

                        <p className="text-gray-300 mb-3">{quest.description}</p>

                        <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3 mb-3">
                          <p className="text-sm font-medium text-blue-400 mb-1">🎯 Цель:</p>
                          <p className="text-sm text-gray-300">{quest.objective}</p>
                        </div>

                        {obstacles.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-400 mb-2">⚔️ Препятствия:</p>
                            <div className="space-y-2">
                              {obstacles.map((obstacle: any, i: number) => (
                                <div key={i} className="bg-gray-800/50 rounded p-2 text-sm">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium">{obstacle.title}</span>
                                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded">
                                      {obstacle.challenge_type}
                                    </span>
                                  </div>
                                  <p className="text-gray-400 text-xs">{obstacle.description}</p>
                                  {obstacle.difficulty_check && (
                                    <p className="text-xs text-yellow-400 mt-1">DC: {obstacle.difficulty_check}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {quest.twist && (
                          <div className="bg-purple-900/20 border border-purple-500/30 rounded p-3 mb-3">
                            <p className="text-sm font-medium text-purple-400 mb-1">🔮 Твист:</p>
                            <p className="text-sm text-gray-300">{quest.twist}</p>
                          </div>
                        )}

                        {rewards && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-400 mb-2">💰 Награды:</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {rewards.gold && (
                                <div className="bg-yellow-900/20 rounded p-2">
                                  <span className="text-yellow-400">Золото: {rewards.gold}</span>
                                </div>
                              )}
                              {rewards.xp && (
                                <div className="bg-green-900/20 rounded p-2">
                                  <span className="text-green-400">XP: {rewards.xp}</span>
                                </div>
                              )}
                              {rewards.items && Array.isArray(rewards.items) && rewards.items.length > 0 && (
                                <div className="col-span-2 bg-blue-900/20 rounded p-2">
                                  <span className="text-blue-400">Предметы:</span>
                                  <ul className="list-disc list-inside ml-2 text-gray-400">
                                    {rewards.items.map((item: string, i: number) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Примерная длительность: {quest.estimatedSessions} {quest.estimatedSessions === 1 ? 'сессия' : 'сессии'}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Добавить редактирование квеста
                            alert('Редактирование квестов будет добавлено позже');
                          }}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            if (confirm(`Удалить квест "${quest.title}"?`)) {
                              await fetch(`/api/quests/${quest.id}`, { method: 'DELETE' });
                              handleEditSuccess();
                            }
                          }}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-6">
            {/* Персонажи игроков */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">👥 Персонажи игроков</h2>
                <Button size="sm" onClick={() => setShowCreateCharacter(true)}>
                  + Добавить персонажа
                </Button>
              </div>

              {!project.playerCharacters || project.playerCharacters.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  Добавьте персонажей ваших игроков
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.playerCharacters.map((pc) => {
                    const strMod = Math.floor((pc.strength - 10) / 2);
                    const dexMod = Math.floor((pc.dexterity - 10) / 2);
                    const conMod = Math.floor((pc.constitution - 10) / 2);
                    const intMod = Math.floor((pc.intelligence - 10) / 2);
                    const wisMod = Math.floor((pc.wisdom - 10) / 2);
                    const chaMod = Math.floor((pc.charisma - 10) / 2);

                    return (
                      <Card key={pc.id} className="bg-gradient-to-br from-blue-900/10 to-purple-900/10">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-primary">{pc.characterName}</h3>
                            <p className="text-sm text-gray-400">
                              {pc.race} {pc.class} {pc.level}
                            </p>
                            <p className="text-xs text-gray-500">Игрок: {pc.playerName}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => setEditingPlayerCharacter(pc)}>
                              ✏️
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={async () => {
                                if (confirm(`Удалить персонажа ${pc.characterName}?`)) {
                                  await fetch(`/api/player-characters/${pc.id}`, { method: 'DELETE' });
                                  handleEditSuccess();
                                }
                              }}
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>

                        {/* Основные параметры */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-red-900/20 rounded p-2 text-center">
                            <div className="text-xs text-gray-500">HP</div>
                            <div className="text-lg font-bold text-red-400">
                              {pc.currentHP}/{pc.maxHP}
                            </div>
                          </div>
                          <div className="bg-blue-900/20 rounded p-2 text-center">
                            <div className="text-xs text-gray-500">AC</div>
                            <div className="text-lg font-bold text-blue-400">{pc.armorClass}</div>
                          </div>
                          <div className="bg-green-900/20 rounded p-2 text-center">
                            <div className="text-xs text-gray-500">Скорость</div>
                            <div className="text-lg font-bold text-green-400">{pc.speed} ft</div>
                          </div>
                        </div>

                        {/* Характеристики */}
                        <div className="grid grid-cols-6 gap-1 mb-3">
                          {[
                            { label: 'STR', value: pc.strength, mod: strMod },
                            { label: 'DEX', value: pc.dexterity, mod: dexMod },
                            { label: 'CON', value: pc.constitution, mod: conMod },
                            { label: 'INT', value: pc.intelligence, mod: intMod },
                            { label: 'WIS', value: pc.wisdom, mod: wisMod },
                            { label: 'CHA', value: pc.charisma, mod: chaMod },
                          ].map((stat) => (
                            <div key={stat.label} className="bg-gray-800/50 rounded p-1 text-center">
                              <div className="text-xs text-gray-500">{stat.label}</div>
                              <div className="text-sm font-bold">{stat.value}</div>
                              <div className="text-xs text-primary">
                                {stat.mod >= 0 ? '+' : ''}{stat.mod}
                              </div>
                            </div>
                          ))}
                        </div>

                        {pc.notes && (
                          <div className="text-xs text-gray-400 bg-yellow-900/10 border border-yellow-500/20 rounded p-2">
                            <strong>Заметки мастера:</strong> {pc.notes}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Заметки сессий */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">📖 Заметки сессий</h2>
                <Button size="sm" onClick={() => setShowCreateSession(true)}>
                  + Добавить сессию
                </Button>
              </div>

              {!project.sessions || project.sessions.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  Ведите заметки о каждой игровой сессии
                </p>
              ) : (
                <div className="space-y-4">
                  {project.sessions.map((session) => (
                    <Card key={session.id} className="bg-gray-800/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded">
                              Сессия #{session.sessionNumber}
                            </span>
                            <h3 className="font-bold">{session.title}</h3>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(session.date).toLocaleDateString('ru-RU')}
                            {session.duration && ` • ${Math.floor(session.duration / 60)}ч ${session.duration % 60}мин`}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={async () => {
                              if (confirm('Удалить запись сессии?')) {
                                await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' });
                                handleEditSuccess();
                              }
                            }}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>

                      {session.summary && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-400">Резюме:</p>
                          <p className="text-sm text-gray-300">{session.summary}</p>
                        </div>
                      )}

                      {session.notes && (
                        <details className="mb-2">
                          <summary className="text-sm font-medium text-gray-400 cursor-pointer hover:text-primary">
                            Детальные заметки
                          </summary>
                          <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">{session.notes}</p>
                        </details>
                      )}

                      {session.playerDecisions && (
                        <div className="mb-2 bg-blue-900/20 border border-blue-500/30 rounded p-2">
                          <p className="text-sm font-medium text-blue-400">Решения игроков:</p>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{session.playerDecisions}</p>
                        </div>
                      )}

                      {session.cliffhanger && (
                        <div className="mb-2 bg-purple-900/20 border border-purple-500/30 rounded p-2">
                          <p className="text-sm font-medium text-purple-400">Клиффхэнгер:</p>
                          <p className="text-sm text-gray-300">{session.cliffhanger}</p>
                        </div>
                      )}

                      {session.nextGoals && (
                        <div className="bg-green-900/20 border border-green-500/30 rounded p-2">
                          <p className="text-sm font-medium text-green-400">На следующую сессию:</p>
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{session.nextGoals}</p>
                        </div>
                      )}

                      {session.xpAwarded && session.xpAwarded > 0 && (
                        <div className="text-sm text-yellow-400 mt-2">
                          ✨ Выдано XP: {session.xpAwarded}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Modals для персонажей */}
      <EditModal
        isOpen={showCreateCharacter}
        title="Добавить персонажа игрока"
        onClose={() => setShowCreateCharacter(false)}
      >
        <CreatePlayerCharacterForm
          projectId={project.id}
          onSuccess={() => {
            setShowCreateCharacter(false);
            handleEditSuccess();
          }}
          onCancel={() => setShowCreateCharacter(false)}
        />
      </EditModal>

      {editingPlayerCharacter && (
        <EditModal
          isOpen={true}
          title="Редактировать персонажа"
          onClose={() => setEditingPlayerCharacter(null)}
        >
          <EditPlayerCharacterForm
            character={editingPlayerCharacter}
            onSuccess={() => {
              setEditingPlayerCharacter(null);
              handleEditSuccess();
            }}
            onCancel={() => setEditingPlayerCharacter(null)}
          />
        </EditModal>
      )}

      <EditModal
        isOpen={showCreateSession}
        title="Добавить запись сессии"
        onClose={() => setShowCreateSession(false)}
      >
        <CreateSessionForm
          projectId={project.id}
          onSuccess={() => {
            setShowCreateSession(false);
            handleEditSuccess();
          }}
          onCancel={() => setShowCreateSession(false)}
        />
      </EditModal>

      {/* Edit Modals */}
      <EditModal
        isOpen={editingProject}
        title="Редактировать кампанию"
        onClose={() => setEditingProject(false)}
      >
        <EditProjectForm
          project={project}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingProject(false)}
        />
      </EditModal>

      {editingScene && (
        <EditModal
          isOpen={true}
          title="Редактировать сцену"
          onClose={() => setEditingScene(null)}
        >
          <EditSceneForm
            scene={editingScene}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingScene(null)}
          />
        </EditModal>
      )}

      {editingNPC && (
        <EditModal
          isOpen={true}
          title="Редактировать NPC"
          onClose={() => setEditingNPC(null)}
        >
          <EditNPCForm
            npc={editingNPC}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingNPC(null)}
          />
        </EditModal>
      )}

      {editingEncounter && (
        <EditModal
          isOpen={true}
          title="Редактировать энкаунтер"
          onClose={() => setEditingEncounter(null)}
        >
          <EditEncounterForm
            encounter={editingEncounter}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingEncounter(null)}
          />
        </EditModal>
      )}

      {/* Delete Confirmation Modals */}
      <ConfirmModal
        isOpen={deletingProject}
        title="Удалить кампанию?"
        message={
          <div>
            <p className="mb-2">Вы уверены, что хотите удалить кампанию <strong>"{project.title}"</strong>?</p>
            <p className="text-sm text-gray-400">
              Будут удалены все сцены ({project.scenes.length}), NPC ({project.npcs.length}) и энкаунтеры ({project.encounters.length}).
            </p>
          </div>
        }
        confirmText="Удалить кампанию"
        onConfirm={handleDeleteProject}
        onCancel={() => setDeletingProject(false)}
        loading={deleteLoading}
        danger
      />

      {deletingScene && (
        <ConfirmModal
          isOpen={true}
          title="Удалить сцену?"
          message={`Вы уверены, что хотите удалить сцену "${deletingScene.title}"?`}
          confirmText="Удалить"
          onConfirm={handleDeleteScene}
          onCancel={() => setDeletingScene(null)}
          loading={deleteLoading}
          danger
        />
      )}

      {deletingNPC && (
        <ConfirmModal
          isOpen={true}
          title="Удалить NPC?"
          message={`Вы уверены, что хотите удалить персонажа "${deletingNPC.name}"?`}
          confirmText="Удалить"
          onConfirm={handleDeleteNPC}
          onCancel={() => setDeletingNPC(null)}
          loading={deleteLoading}
          danger
        />
      )}

      {deletingEncounter && (
        <ConfirmModal
          isOpen={true}
          title="Удалить энкаунтер?"
          message={`Вы уверены, что хотите удалить энкаунтер "${deletingEncounter.title}"?`}
          confirmText="Удалить"
          onConfirm={handleDeleteEncounter}
          onCancel={() => setDeletingEncounter(null)}
          loading={deleteLoading}
          danger
        />
      )}
    </div>
  );
}

// Вспомогательные функции для квестов
function getQuestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    investigation: '🔍 Расследование',
    rescue: '🆘 Спасение',
    escort: '🚶 Сопровождение',
    delivery: '📦 Доставка',
    heist: '💰 Ограбление',
    defense: '🛡️ Защита',
    assassination: '⚔️ Устранение',
    diplomatic: '🤝 Дипломатия',
  };
  return labels[type] || type;
}

function getQuestDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-900/30 text-green-400';
    case 'medium':
      return 'bg-yellow-900/30 text-yellow-400';
    case 'hard':
      return 'bg-red-900/30 text-red-400';
    default:
      return 'bg-gray-800 text-gray-400';
  }
}

function getQuestStatusColor(status: string): string {
  switch (status) {
    case 'available':
      return 'bg-blue-900/30 text-blue-400';
    case 'active':
      return 'bg-green-900/30 text-green-400';
    case 'completed':
      return 'bg-purple-900/30 text-purple-400';
    case 'failed':
      return 'bg-red-900/30 text-red-400';
    default:
      return 'bg-gray-800 text-gray-400';
  }
}

function getQuestStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: 'Доступен',
    active: 'Активен',
    completed: 'Выполнен',
    failed: 'Провален',
  };
  return labels[status] || status;
}
