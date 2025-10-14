'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';

interface Project {
  id: string;
  title: string;
  description?: string;
  setting?: string;
  updatedAt: string;
  _count: {
    scenes: number;
    npcs: number;
    encounters: number;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-400">Загрузка проектов...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Все проекты</h1>
        <Link href="/">
          <Button variant="secondary">+ Создать новый</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">Пока нет проектов</p>
            <p className="text-sm">Вернитесь на главную страницу, чтобы создать первую кампанию</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card hover className="h-full">
                <h3 className="font-bold text-xl mb-2 text-primary">{project.title}</h3>
                
                {project.setting && (
                  <p className="text-sm text-gray-500 mb-3">🗺️ {project.setting}</p>
                )}
                
                {project.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-auto">
                  <span>🎬 {project._count.scenes}</span>
                  <span>🎭 {project._count.npcs}</span>
                  <span>⚔️ {project._count.encounters}</span>
                </div>
                
                <div className="mt-4 text-xs text-gray-600">
                  Обновлено: {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

