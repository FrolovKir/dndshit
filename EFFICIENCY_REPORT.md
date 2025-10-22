# Code Efficiency Analysis Report

## Project: DnD GenLab Assistant

This report identifies several areas in the codebase where efficiency can be improved. The analysis covers performance, code duplication, and resource utilization issues.

---

## 1. Duplicate JSON Parsing Logic (High Priority)

**Location:** Multiple API routes in `src/app/api/generate/`

**Issue:** The same JSON parsing and markdown cleanup logic is duplicated across multiple generation endpoints:
- `src/app/api/generate/npc/route.ts` (lines 84-96)
- `src/app/api/generate/scene/route.ts` (lines 82-93)
- `src/app/api/generate/quest/route.ts` (lines 107-117)
- `src/app/api/generate/campaign-scenes/route.ts` (lines 79-87)

**Example from npc/route.ts:**
```typescript
let cleanedContent = response.content.trim();
if (cleanedContent.includes('```json')) {
  cleanedContent = cleanedContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
}
if (cleanedContent.includes('```')) {
  cleanedContent = cleanedContent.replace(/^```\n?/g, '').replace(/```\n?$/g, '');
}
npcData = JSON.parse(cleanedContent);
```

**Impact:** Code duplication makes maintenance harder and increases the chance of bugs when logic needs to be updated.

**Recommendation:** Extract this logic into a shared utility function in `src/lib/llm.ts` or a new `src/lib/json-parser.ts` file.

---

## 2. Repeated Database Queries for Project Context (Medium Priority)

**Location:** Multiple generation routes

**Issue:** Many generation endpoints fetch the same project data independently:
- `src/app/api/generate/npc/route.ts` (lines 21-35)
- `src/app/api/generate/scene/route.ts` (lines 21-35)
- `src/app/api/generate/quest/route.ts` (lines 32-52)

Each route fetches the project and then parses the description JSON separately. This pattern is repeated across multiple files.

**Example:**
```typescript
const project = await prisma.project.findUnique({
  where: { id: projectId },
});

let projectDetails;
try {
  projectDetails = JSON.parse(project.description || '{}');
} catch (e) {
  projectDetails = {};
}
```

**Impact:** Multiple database queries and repeated JSON parsing operations for the same data.

**Recommendation:** Create a helper function `getProjectWithDetails(projectId)` that returns both the project and parsed details in one call.

---

## 3. Inefficient JSON Parsing in Frontend Components (Medium Priority)

**Location:** `src/app/projects/[id]/page.tsx`

**Issue:** JSON parsing happens inside render functions and loops without memoization:
- Line 147: `JSON.parse(npc.stats)` inside NPCCard component
- Line 280: `JSON.parse(npc.interactionOptions)` inside render
- Multiple similar instances throughout the component

**Example:**
```typescript
function NPCCard({ npc, onEdit, onDelete }) {
  // This runs on every render
  let stats: Record<string, number> | null = null;
  if (npc.stats) {
    try {
      stats = JSON.parse(npc.stats);
    } catch (e) {
      // Ignore
    }
  }
  // ...
}
```

**Impact:** Unnecessary JSON parsing on every component render, even when data hasn't changed.

**Recommendation:** Use `useMemo` to cache parsed JSON values or parse them once when data is fetched.

---

## 4. Redundant Database Update After Create (Low Priority)

**Location:** `src/app/api/generate/campaign-scenes/route.ts` (lines 117-144)

**Issue:** The code creates a scene, then immediately updates it with metadata:

```typescript
const scene = await prisma.scene.create({
  data: {
    projectId: project.id,
    title: sceneData.title || 'Без названия',
    description: sceneData.description || '',
    // ...
  },
});

// Immediately update the same scene
const descriptionWithMeta = `${sceneData.description}\n\n<!-- METADATA: ${JSON.stringify(sceneMetadata)} -->`;
await prisma.scene.update({
  where: { id: scene.id },
  data: { description: descriptionWithMeta },
});
```

**Impact:** Two database operations instead of one, doubling the database round-trip time.

**Recommendation:** Include the metadata in the initial create operation.

---

## 5. Inefficient Token Estimation (Low Priority)

**Location:** `src/lib/credits.ts` (line 136-138)

**Issue:** The token estimation function uses a simple character count divided by 4:

```typescript
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

**Impact:** This is a very rough approximation that doesn't account for tokenization rules. It can lead to underestimation or overestimation of actual token usage.

**Recommendation:** Consider using a proper tokenizer library like `tiktoken` for more accurate estimates, especially for budget-critical operations.

---

## 6. Missing Database Query Optimization (Medium Priority)

**Location:** `src/app/api/projects/route.ts` (lines 18-30)

**Issue:** The GET endpoint fetches all projects with counts but doesn't implement pagination:

```typescript
const projects = await prisma.project.findMany({
  where: { userId },
  orderBy: { updatedAt: 'desc' },
  include: {
    _count: {
      select: {
        scenes: true,
        npcs: true,
        encounters: true,
      },
    },
  },
});
```

**Impact:** As users create more projects, this query will become slower and consume more memory.

**Recommendation:** Implement pagination with `take` and `skip` parameters.

---

## 7. Duplicate Scene Count Query (Low Priority)

**Location:** Multiple files

**Issue:** Both `src/app/api/scenes/route.ts` (line 26) and `src/app/api/generate/scene/route.ts` (line 109-111) perform the same scene count query:

```typescript
const scenesCount = await prisma.scene.count({
  where: { projectId },
});
```

**Impact:** Extra database query that could be avoided by using a transaction or returning the count from the create operation.

**Recommendation:** Use Prisma's `createMany` with `skipDuplicates` or fetch the count as part of a larger query.

---

## Summary

The most impactful improvements would be:

1. **Extract duplicate JSON parsing logic** - Reduces code duplication and improves maintainability
2. **Create project context helper function** - Reduces database queries and repeated parsing
3. **Memoize JSON parsing in React components** - Improves frontend rendering performance
4. **Combine database operations** - Reduces database round trips

These changes would improve both code quality and runtime performance without requiring major architectural changes.
