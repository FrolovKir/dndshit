'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Select from '@/components/Select';
import { exportToMarkdown, exportToJSON, exportToPDF, downloadFile } from '@/lib/export';

interface Project {
  id: string;
  title: string;
  description?: string;
  synopsis?: string;
  setting?: string;
  scenes: any[];
  npcs: any[];
  encounters: any[];
}

export default function ExportPage() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [preview, setPreview] = useState('');
  const [format, setFormat] = useState<'markdown' | 'pdf' | 'json'>('markdown');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const projectId = searchParams?.get('projectId');
    if (projectId && projects.length > 0) {
      setSelectedProjectId(projectId);
      fetchProject(projectId);
    }
  }, [searchParams, projects]);

  useEffect(() => {
    if (selectedProject) {
      generatePreview();
    }
  }, [selectedProject, format]);

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

  const fetchProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setSelectedProject(data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id);
    if (id) {
      fetchProject(id);
    } else {
      setSelectedProject(null);
      setPreview('');
    }
  };

  const generatePreview = () => {
    if (!selectedProject) return;

    switch (format) {
      case 'markdown':
        setPreview(exportToMarkdown(selectedProject));
        break;
      case 'json':
        setPreview(exportToJSON(selectedProject));
        break;
      case 'pdf':
        setPreview('Предпросмотр PDF недоступен. Нажмите "Скачать" для генерации PDF.');
        break;
    }
  };

  const handleExport = () => {
    if (!selectedProject) return;

    setExporting(true);

    try {
      const filename = selectedProject.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      switch (format) {
        case 'markdown':
          const md = exportToMarkdown(selectedProject);
          downloadFile(md, `${filename}.md`, 'text/markdown');
          break;
        case 'json':
          const json = exportToJSON(selectedProject);
          downloadFile(json, `${filename}.json`, 'application/json');
          break;
        case 'pdf':
          exportToPDF(selectedProject);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте. Проверьте консоль.');
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-400">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Экспорт проектов</h1>
        <p className="text-gray-400">
          Экспортируйте ваши кампании в Markdown, PDF или JSON
        </p>
      </div>

      {/* Controls */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Выберите проект"
            options={[
              { value: '', label: 'Выберите проект...' },
              ...projects.map((p) => ({ value: p.id, label: p.title })),
            ]}
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          />

          <Select
            label="Формат экспорта"
            options={[
              { value: 'markdown', label: 'Markdown (.md)' },
              { value: 'json', label: 'JSON (.json)' },
              { value: 'pdf', label: 'PDF (.pdf)' },
            ]}
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            disabled={!selectedProject}
          />
        </div>

        {selectedProject && (
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleExport}
              loading={exporting}
            >
              📥 Скачать {format.toUpperCase()}
            </Button>
          </div>
        )}
      </Card>

      {/* Project Info */}
      {selectedProject && (
        <Card>
          <h2 className="text-xl font-bold mb-4">{selectedProject.title}</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Сцен:</span>{' '}
              <span className="font-bold">{selectedProject.scenes.length}</span>
            </div>
            <div>
              <span className="text-gray-400">NPC:</span>{' '}
              <span className="font-bold">{selectedProject.npcs.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Энкаунтеров:</span>{' '}
              <span className="font-bold">{selectedProject.encounters.length}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Preview */}
      {preview && (
        <Card>
          <h2 className="text-xl font-bold mb-4">Предпросмотр</h2>
          <div className="bg-black rounded-lg p-4 overflow-auto max-h-[600px] font-mono text-sm">
            <pre className="whitespace-pre-wrap break-words">{preview}</pre>
          </div>
        </Card>
      )}

      {/* No Project Selected */}
      {!selectedProject && !loading && (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">Выберите проект для экспорта</p>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <h2 className="text-lg font-bold mb-3">ℹ️ О форматах экспорта</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <strong className="text-primary">Markdown (.md)</strong> — удобен для чтения и редактирования 
            в текстовых редакторах. Идеален для публикации в вики или блоге.
          </div>
          <div>
            <strong className="text-secondary">JSON (.json)</strong> — структурированные данные, 
            удобны для импорта в другие приложения или для бэкапа.
          </div>
          <div>
            <strong className="text-purple-500">PDF (.pdf)</strong> — готовый к печати документ. 
            Подходит для использования за столом во время игры.
          </div>
        </div>
      </Card>
    </div>
  );
}

