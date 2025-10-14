'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import GenerateWizardForm from '@/components/GenerateWizardForm';
import CreateProjectForm from '@/components/CreateProjectForm';

interface Project {
  id: string;
  title: string;
  description?: string;
  updatedAt: string;
  _count: {
    scenes: number;
    npcs: number;
    encounters: number;
  };
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'session' | 'create-project'>('session');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'session', label: 'Кампания (AI)', icon: '🚀', category: 'generate' },
    { id: 'create-project', label: 'Новая кампания', icon: '📚', category: 'create' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          DnD GenLab Assistant
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Создавайте увлекательные кампании, сцены, персонажей и энкаунтеры для D&D 5e 
          с помощью искусственного интеллекта
        </p>
      </div>

      {/* Generator Section */}
      <Card className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Создание контента</h2>
          <div className="text-sm text-gray-400">
            <span className="text-primary">AI генерация</span> или{' '}
            <span className="text-secondary">ручное создание</span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Генерация</div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {tabs.filter(t => t.category === 'generate').map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Ручное создание</div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {tabs.filter(t => t.category === 'create').map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Forms */}
        <div className="mt-6">
          {activeTab === 'session' && <GenerateWizardForm onSuccess={fetchProjects} />}
          {activeTab === 'create-project' && <CreateProjectForm onSuccess={fetchProjects} />}
        </div>
      </Card>

      {/* Projects List */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Ваши проекты</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm">Все проекты →</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Загрузка проектов...
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Пока нет проектов</p>
              <p className="text-sm">Создайте свою первую кампанию выше</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card hover>
                  <h3 className="font-bold text-lg mb-2 text-primary">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>🎬 {project._count.scenes}</span>
                    <span>🎭 {project._count.npcs}</span>
                    <span>⚔️ {project._count.encounters}</span>
                  </div>
                  <div className="mt-4 text-xs text-gray-600">
                    Обновлено: {new Date(project.updatedAt).toLocaleDateString('ru')}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{projects.length}</div>
            <div className="text-sm text-gray-400 mt-1">Проектов</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">
              {projects.reduce((sum, p) => sum + p._count.scenes, 0)}
            </div>
            <div className="text-sm text-gray-400 mt-1">Сцен создано</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500">
              {projects.reduce((sum, p) => sum + p._count.npcs, 0)}
            </div>
            <div className="text-sm text-gray-400 mt-1">NPC создано</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

