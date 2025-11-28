# DataFlow BI - AI Agent Instructions

## Project Overview
DataFlow BI is a **visual diagram editor** for designing data pipelines and analytics workflows using React Flow. Users drag-and-drop nodes (Data Source, Table, Measure) onto a canvas, connect them with edges, and save multiple projects to IndexedDB. This is an AI Studio app deployed via Gemini, focused on interactive visual design rather than database processing.

## Architecture Essentials

### Core Stack
- **Framework**: React 19.2 + TypeScript (~5.8)
- **Graph Visualization**: `@xyflow/react` 12.9.3 (React Flow library)
- **Styling**: Tailwind CSS (via Vite)
- **Data Persistence**: IndexedDB (wrapped in `services/db.ts`)
- **Build**: Vite 6.2 with React plugin

### Big Picture Data Flow
```
User Action (drag/drop/double-click)
  ↓
Nodes/Edges State (React hooks: useNodesState, useEdgesState)
  ↓
Canvas Render (ReactFlow with custom node/edge components)
  ↓
Auto-save (debounced 2000ms on node/edge changes)
  ↓
IndexedDB (via db.saveProject() in Flow component)
```

### Key Component Hierarchy
- **`App.tsx`** → ReactFlowProvider wrapper
- **`Flow()`** (in App.tsx) → Main orchestrator
  - Manages projects array + activeProjectId state
  - Listens to node/edge changes via useNodesState/useEdgesState hooks
  - Handles drag-drop, double-click editing, export
  - Auto-saves every 2s via `saveCurrentProject()` callback
- **`Sidebar.tsx`** → Project switcher + node toolbox (drag-start handlers)
- **Custom Node Components** (`CustomNodes.tsx`)
  - Wrapper components: SourceNode, TableNode, MeasureNode
  - Each wraps `NodeWrapper` for consistent styling
  - Renders icon + title + label, Input/Output handles (Position.Left/Right)
- **`CustomEdge.tsx`** → Edge renderer with optional label
  - Uses `getSmoothStepPath()` for routing
  - Respects `data.color` for custom edge coloring
  - Hides label if empty string

### State Management Pattern
- **Project**: `{ id, name, createdAt, updatedAt, nodes[], edges[] }`
- **Nodes**: ReactFlow Node type with `data: { label, color?, description? }`
- **Edges**: ReactFlow Edge type with `data: { color }` and label
- **Editing**: Modal dialog (`EditModal`) for double-clicked nodes/edges

## Critical Developer Workflows

### Local Development
```bash
npm install              # Install dependencies
GEMINI_API_KEY=... npm run dev    # Start Vite server on port 3000 (requires .env.local)
npm run build            # Production build to dist/
npm run preview          # Preview built version
```

### Key Environment Variable
- **`GEMINI_API_KEY`** (required in `.env.local`) → Exposed to browser via `process.env.GEMINI_API_KEY` in vite.config.ts

### Database (IndexedDB)
Located in `services/db.ts`:
- Lazy initialization on first `db.getAllProjects()` call
- Store name: `'projects'`
- Key path: `'id'` (projects are keyed by UUID)
- **No migrations needed**: Version 1 is hardcoded

## Project-Specific Conventions

### Color System (`types.ts`)
- **Default palette**: 10 colors in `CUSTOM_PALETTE[]`
  - First 3 are type defaults (Gray=Source, Blue=Table, Green=Measure)
  - Remaining 7 are accent colors (Rose, Orange, Yellow, Teal, Cyan, Indigo, Purple)
- Nodes/edges can override via `data.color` field
- Selected nodes use `ring-2 ring-offset-1` style + semi-transparent background shadow

### Node Types (Enum in `types.ts`)
```typescript
enum NodeType { SOURCE = 'source', TABLE = 'table', MEASURE = 'measure' }
```
- Each type has a corresponding component in `CustomNodes.tsx`
- Components are registered in `nodeTypes` export (used in ReactFlow config)

### Styling Approach
- **Tailwind-first**: All interactive elements use Tailwind classes + inline `style={}` for dynamic colors
- **Icons**: Lucide React (`lucide-react` v0.555)
- **Modal**: Fixed overlay with backdrop blur, fade-in animation
- **Responsive**: Mobile-first; sidebar toggles on small screens

### Double-Click Editing Pattern
When user double-clicks a node/edge:
1. Modal state updates with `{ isOpen: true, type, id, label, color }`
2. User modifies label/color
3. `handleSaveModal()` updates node/edge data in state
4. Auto-save triggers after 2s
5. Modal closes

### Export to PNG
- Uses `html-to-image` library
- Exports entire ReactFlow canvas as PNG
- Triggered by "Download" button in toolbar

## Integration Points & External Dependencies

### React Flow (`@xyflow/react`)
- **Providers**: `ReactFlowProvider` wraps entire app
- **Hooks**: `useNodesState`, `useEdgesState`, `useReactFlow()` (for screenToFlowPosition, getNodes, getEdges)
- **Events**: `onConnect`, `onDrop`, `onDragOver`, `onNodeDoubleClick`, `onEdgeDoubleClick`
- **Edge types**: Custom edge types must be registered in `edgeTypes` object
- **Node types**: Custom node types registered in `nodeTypes` object

### Drag-and-Drop Flow
1. **Toolbox items** (in Sidebar): `onDragStart` sets `application/reactflow` data with NodeType
2. **ReactFlow canvas**: `onDragOver` prevents default, `onDrop` reads data type
3. **New node creation**: `screenToFlowPosition` converts client coords to canvas coords, UUID assigned

### localStorage (None Used)
- Persistence is **IndexedDB only** (no localStorage fallback)
- Each project is independently serializable (no cross-project references)

## Common Pitfalls & Patterns to Avoid

1. **Don't mutate state directly**: Always use `setNodes(nds => nds.map(...))` or `setEdges(eds => eds.map(...))`
2. **Color sync**: When editing a node/edge, update both `data.color` (for storage) and visual style simultaneously
3. **Modal lifecycle**: Ensure modal closes after save/delete—check `EditModal` for `isOpen` gate
4. **Auto-save timing**: 2s debounce is intentional to reduce IndexedDB writes; don't add more auto-save triggers
5. **Node deletion**: Use Backspace/Delete keys (configured in ReactFlow `deleteKeyCode`), or modal delete button
6. **Edge labels**: Empty labels are allowed (rendered as arrows only); don't validate label length

## Testing Considerations
- Manual testing via `npm run dev` is primary workflow (Vite HMR)
- IndexedDB state persists across hot reloads (not cleared by Vite)
- Export PNG to verify visual correctness of complex diagrams

## Future Extension Points
- **Additional node types**: Add enum value to `NodeType`, create component in `CustomNodes.tsx`, register in `nodeTypes`
- **Custom edge routing**: Replace `getSmoothStepPath()` in `CustomEdge.tsx` with alternative
- **Real-time collaboration**: Extend db.ts with sync/subscription primitives (currently single-user only)
