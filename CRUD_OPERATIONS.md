# 🔧 CRUD Операции - Руководство

## Обзор

Теперь в приложении реализован полный CRUD (Create, Read, Update, Delete) для всех сущностей!

## Что доступно

### ✅ Создание (Create)
- **Пустая кампания** - ручное создание без AI
- **Пустая сцена** - быстрое добавление сцены
- **Пустой NPC** - создание персонажа вручную
- **Пустой энкаунтер** - создание боя вручную

### ✅ Чтение (Read)
- Просмотр всех проектов
- Детальный просмотр кампании со всеми элементами

### ✅ Обновление (Update)
- Редактирование проектов через API
- Редактирование сцен
- Редактирование NPC
- Редактирование энкаунтеров

### ✅ Удаление (Delete)
- Удаление проектов
- Удаление сцен
- Удаление NPC
- Удаление энкаунтеров

---

## API Эндпоинты

### Projects (Кампании)

#### Создать пустой проект
```http
POST /api/projects
Content-Type: application/json

{
  "title": "Название кампании",
  "description": "Описание (опционально)",
  "setting": "Forgotten Realms"
}
```

#### Обновить проект
```http
PATCH /api/projects/[id]
Content-Type: application/json

{
  "title": "Новое название",
  "description": "Новое описание",
  "synopsis": "Новый синопсис",
  "setting": "Новый сеттинг"
}
```

#### Удалить проект
```http
DELETE /api/projects/[id]
```

---

### Scenes (Сцены)

#### Создать пустую сцену
```http
POST /api/scenes
Content-Type: application/json

{
  "projectId": "project-id",
  "title": "Название сцены",
  "description": "Описание (опционально)",
  "sceneType": "story|combat|social|exploration"
}
```

#### Обновить сцену
```http
PATCH /api/scenes/[id]
Content-Type: application/json

{
  "title": "Новое название",
  "description": "Новое описание",
  "sceneType": "combat",
  "order": 5
}
```

#### Удалить сцену
```http
DELETE /api/scenes/[id]
```

---

### NPCs (Персонажи)

#### Создать пустого NPC
```http
POST /api/npcs
Content-Type: application/json

{
  "projectId": "project-id",
  "name": "Имя NPC",
  "race": "Human",
  "npcClass": "Commoner",
  "level": 1,
  "alignment": "Neutral"
}
```

#### Обновить NPC
```http
PATCH /api/npcs/[id]
Content-Type: application/json

{
  "name": "Новое имя",
  "race": "Elf",
  "npcClass": "Wizard",
  "level": 5,
  "personality": "Мудрый и спокойный",
  "backstory": "Предыстория...",
  "appearance": "Внешность...",
  "motivations": "Мотивации..."
}
```

#### Удалить NPC
```http
DELETE /api/npcs/[id]
```

---

### Encounters (Энкаунтеры)

#### Создать пустой энкаунтер
```http
POST /api/encounters
Content-Type: application/json

{
  "projectId": "project-id",
  "title": "Название энкаунтера",
  "encounterType": "combat",
  "difficulty": "medium",
  "estimatedLevel": 3
}
```

#### Обновить энкаунтер
```http
PATCH /api/encounters/[id]
Content-Type: application/json

{
  "title": "Новое название",
  "description": "Описание боя",
  "difficulty": "hard",
  "monsters": "[{\"name\": \"Goblin\", \"count\": 5}]",
  "environment": "Темный лес",
  "tactics": "Засада из-за деревьев"
}
```

#### Удалить энкаунтер
```http
DELETE /api/encounters/[id]
```

---

## Использование в UI

### Главная страница

Теперь есть **два раздела вкладок**:

#### 🤖 AI Генерация
- Кампания (Поэтапно) 🚀
- Быстрая кампания ⚡
- Сцена (AI) 🎬
- NPC (AI) 🎭
- Энкаунтер (AI) ⚔️

#### ✋ Ручное создание
- Новая кампания 📚
- Новая сцена ➕
- Новый NPC ➕
- Новый энкаунтер ➕

### Формы создания

#### CreateProjectForm
```tsx
<CreateProjectForm onSuccess={() => refetch()} />
```

#### CreateSceneForm
```tsx
<CreateSceneForm 
  projects={projects} 
  onSuccess={() => refetch()} 
/>
```

#### CreateNPCForm
```tsx
<CreateNPCForm 
  projects={projects} 
  onSuccess={() => refetch()} 
/>
```

#### CreateEncounterForm
```tsx
<CreateEncounterForm 
  projects={projects} 
  onSuccess={() => refetch()} 
/>
```

---

## Компоненты

### ConfirmModal
Модальное окно подтверждения удаления:

```tsx
<ConfirmModal
  isOpen={showConfirm}
  title="Удалить проект?"
  message="Это действие нельзя отменить. Будут удалены все сцены, NPC и энкаунтеры."
  confirmText="Удалить"
  cancelText="Отмена"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
  danger={true}
/>
```

### EditModal
Универсальное модальное окно для редактирования:

```tsx
<EditModal
  isOpen={showEdit}
  title="Редактировать проект"
  onClose={() => setShowEdit(false)}
>
  <EditProjectForm project={project} onSuccess={handleUpdate} />
</EditModal>
```

---

## Примеры использования

### 1. Создать пустую кампанию
1. Откройте главную страницу
2. Перейдите в раздел **"Ручное создание"**
3. Выберите **"Новая кампания"** 📚
4. Заполните название и сеттинг
5. Нажмите **"Создать пустую кампанию"**

### 2. Добавить сцены вручную
1. Выберите **"Новая сцена"** ➕
2. Выберите кампанию
3. Укажите название и тип
4. Нажмите **"Создать пустую сцену"**

### 3. Редактирование (через API)
```javascript
// Обновить название сцены
await fetch(`/api/scenes/${sceneId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Новое название сцены'
  })
});
```

### 4. Удаление с подтверждением
```javascript
const [showConfirm, setShowConfirm] = useState(false);

const handleDelete = async () => {
  await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE'
  });
  setShowConfirm(false);
  refetch();
};

// В JSX:
<button onClick={() => setShowConfirm(true)}>
  Удалить
</button>

<ConfirmModal
  isOpen={showConfirm}
  title="Удалить проект?"
  message="Вы уверены?"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
  danger
/>
```

---

## Workflow: AI + Ручное редактирование

### Рекомендуемый подход:

1. **Создайте основу с AI:**
   - Используйте "Кампания (Поэтапно)" для генерации
   - Получите 10 сцен + 20-30 NPC

2. **Дополните вручную:**
   - Добавьте дополнительные сцены (➕ Новая сцена)
   - Создайте специфических NPC (➕ Новый NPC)
   - Добавьте особые энкаунтеры (➕ Новый энкаунтер)

3. **Редактируйте детали:**
   - Через API обновляйте описания
   - Корректируйте имена и характеристики
   - Удаляйте ненужные элементы

---

## Безопасность

### Удаление с каскадом
При удалении проекта **автоматически удаляются**:
- ✅ Все сцены проекта
- ✅ Все NPC проекта
- ✅ Все энкаунтеры проекта

**Поэтому:** Всегда подтверждайте удаление через `ConfirmModal`!

---

## Что дальше?

### Планируется добавить:
- 📝 Инлайн-редактирование на странице проекта
- 🔄 Drag & drop для изменения порядка сцен
- 📋 Копирование сцен/NPC между проектами
- 🗂️ Массовые операции

---

**Теперь у вас полный контроль над контентом!** ✨

Создавайте с AI или вручную, редактируйте как хотите, удаляйте что не нужно!


