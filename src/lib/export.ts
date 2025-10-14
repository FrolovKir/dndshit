/**
 * Библиотека для экспорта проектов в различные форматы
 */

const ATTRIBUTION = '\n\n---\n**Uses 5e SRD (CC BY 4.0). Compatible content, not affiliated with Wizards of the Coast.**';

interface ExportProject {
  title: string;
  description?: string;
  synopsis?: string;
  setting?: string;
  scenes: any[];
  npcs: any[];
  encounters: any[];
}

/**
 * Экспорт в Markdown
 */
export function exportToMarkdown(project: ExportProject): string {
  let md = `# ${project.title}\n\n`;

  if (project.setting) {
    md += `**Сеттинг:** ${project.setting}\n\n`;
  }

  if (project.synopsis) {
    md += `## Синопсис\n\n${project.synopsis}\n\n`;
  }

  if (project.description) {
    md += `## Описание\n\n${project.description}\n\n`;
  }

  // Scenes
  if (project.scenes.length > 0) {
    md += `## Сцены\n\n`;
    project.scenes
      .sort((a, b) => a.order - b.order)
      .forEach((scene, idx) => {
        md += `### ${idx + 1}. ${scene.title}\n\n`;
        md += `**Тип:** ${scene.sceneType}\n\n`;
        md += `${scene.description}\n\n`;
        md += `---\n\n`;
      });
  }

  // NPCs
  if (project.npcs.length > 0) {
    md += `## Персонажи (NPC)\n\n`;
    project.npcs.forEach((npc) => {
      md += `### ${npc.name}\n\n`;
      if (npc.race || npc.class) {
        md += `**${npc.race || ''}${npc.race && npc.class ? ' ' : ''}${npc.class || ''}**`;
        if (npc.level) md += ` (${npc.level} уровень)`;
        md += `\n\n`;
      }
      if (npc.alignment) md += `**Мировоззрение:** ${npc.alignment}\n\n`;
      if (npc.appearance) md += `**Внешность:** ${npc.appearance}\n\n`;
      if (npc.personality) md += `**Личность:** ${npc.personality}\n\n`;
      if (npc.backstory) md += `**Предыстория:** ${npc.backstory}\n\n`;
      if (npc.motivations) md += `**Мотивации:** ${npc.motivations}\n\n`;
      
      if (npc.stats) {
        try {
          const stats = typeof npc.stats === 'string' ? JSON.parse(npc.stats) : npc.stats;
          md += `**Характеристики:**\n`;
          md += `- STR: ${stats.STR} | DEX: ${stats.DEX} | CON: ${stats.CON}\n`;
          md += `- INT: ${stats.INT} | WIS: ${stats.WIS} | CHA: ${stats.CHA}\n\n`;
        } catch (e) {
          // ignore
        }
      }
      
      md += `---\n\n`;
    });
  }

  // Encounters
  if (project.encounters.length > 0) {
    md += `## Энкаунтеры\n\n`;
    project.encounters.forEach((enc) => {
      md += `### ${enc.title}\n\n`;
      md += `**Тип:** ${enc.encounterType}`;
      if (enc.difficulty) md += ` | **Сложность:** ${enc.difficulty}`;
      if (enc.estimatedLevel) md += ` | **Рекомендуемый уровень:** ${enc.estimatedLevel}`;
      md += `\n\n`;
      
      md += `${enc.description}\n\n`;
      
      if (enc.monsters) {
        try {
          const monsters = typeof enc.monsters === 'string' ? JSON.parse(enc.monsters) : enc.monsters;
          if (Array.isArray(monsters) && monsters.length > 0) {
            md += `**Противники:**\n`;
            monsters.forEach((m: any) => {
              md += `- ${m.name} x${m.count} (CR ${m.cr})`;
              if (m.hp) md += ` — HP: ${m.hp}`;
              if (m.ac) md += `, AC: ${m.ac}`;
              md += `\n`;
            });
            md += `\n`;
          }
        } catch (e) {
          // ignore
        }
      }

      if (enc.environment) md += `**Окружение:** ${enc.environment}\n\n`;
      if (enc.tactics) md += `**Тактика:** ${enc.tactics}\n\n`;
      
      if (enc.rewards) {
        try {
          const rewards = typeof enc.rewards === 'string' ? JSON.parse(enc.rewards) : enc.rewards;
          md += `**Награды:**\n`;
          if (rewards.gold) md += `- Золото: ${rewards.gold} GP\n`;
          if (rewards.items && Array.isArray(rewards.items)) {
            rewards.items.forEach((item: string) => {
              md += `- ${item}\n`;
            });
          }
          md += `\n`;
        } catch (e) {
          // ignore
        }
      }

      md += `---\n\n`;
    });
  }

  md += ATTRIBUTION;
  return md;
}

/**
 * Экспорт в JSON
 */
export function exportToJSON(project: ExportProject): string {
  const exportData = {
    ...project,
    exportedAt: new Date().toISOString(),
    attribution: 'Uses 5e SRD (CC BY 4.0). Compatible content, not affiliated with Wizards of the Coast.',
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Экспорт в PDF (используя jsPDF)
 * Для упрощения, создадим простой текстовый PDF
 */
export function exportToPDF(project: ExportProject): void {
  // Для PDF используем динамический импорт jsPDF
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;
    let y = margin;

    // Helper для добавления текста с переносом
    const addText = (text: string, size: number = 12, style: 'normal' | 'bold' = 'normal') => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += size * 0.5;
      });
      
      y += 3;
    };

    // Title
    addText(project.title, 20, 'bold');
    y += 5;

    if (project.setting) {
      addText(`Сеттинг: ${project.setting}`, 10);
    }

    if (project.synopsis) {
      y += 5;
      addText('Синопсис', 14, 'bold');
      addText(project.synopsis, 10);
    }

    if (project.description) {
      y += 5;
      addText('Описание', 14, 'bold');
      addText(project.description, 10);
    }

    // Scenes
    if (project.scenes.length > 0) {
      y += 10;
      addText('Сцены', 16, 'bold');
      project.scenes
        .sort((a, b) => a.order - b.order)
        .forEach((scene, idx) => {
          y += 5;
          addText(`${idx + 1}. ${scene.title}`, 12, 'bold');
          addText(`Тип: ${scene.sceneType}`, 10);
          addText(scene.description, 10);
        });
    }

    // NPCs
    if (project.npcs.length > 0) {
      y += 10;
      addText('Персонажи (NPC)', 16, 'bold');
      project.npcs.forEach((npc) => {
        y += 5;
        addText(npc.name, 12, 'bold');
        if (npc.race || npc.class) {
          addText(`${npc.race || ''} ${npc.class || ''}${npc.level ? ` (${npc.level} lvl)` : ''}`, 10);
        }
        if (npc.backstory) addText(npc.backstory, 10);
      });
    }

    // Attribution
    y += 10;
    addText('Uses 5e SRD (CC BY 4.0). Compatible content, not affiliated with Wizards of the Coast.', 8);

    // Save
    doc.save(`${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  });
}

/**
 * Скачать файл
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

