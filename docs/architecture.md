# Architecture Overview

Canvas Table follows a layered architecture with clear separation of concerns, enabling flexibility, performance, and maintainability.

## Core Design Principles

### 1. Headless Architecture
The core library provides logic without prescribing UI implementation. Developers control styling and rendering details while the library handles data management and canvas operations.

### 2. Component Composition
Small, focused components that work together rather than monolithic components. This enables tree-shaking, code splitting, and better testing.

### 3. Hook-Based API
Leverages React hooks for state management, side effects, and logic encapsulation. Hooks are composable and follow React's mental model.

### 4. Plugin System
Features are implemented as plugins that can be enabled/disabled. This keeps the core lightweight while allowing extensibility.

### 5. Performance First
Every design decision considers performance implications. Memoization, virtualization, and efficient re-renders are built into the architecture.

## System Layers

```
┌─────────────────────────────────────┐
│      Application Layer              │
│   (User Implementation)             │
│   • Custom styling                  │
│   • Business logic                  │
│   • Data fetching                   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Component Layer                │
│   (Pre-built Components)            │
│   • CanvasTable                     │
│   • CanvasTableHeader               │
│   • CanvasTableBody                 │
│   • CanvasTableScrollbars           │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Hooks Layer                 │
│      (Core Business Logic)          │
│   • useCanvasTable                  │
│   • useVirtualization               │
│   • useSelection                    │
│   • useReordering                   │
│   • useSticky                       │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      State Management               │
│   (Centralized State Store)         │
│   • Table instance                  │
│   • Plugin registry                 │
│   • Event emitter                   │
│   • State synchronization           │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Rendering Engine               │
│   (Canvas Operations)               │
│   • Draw commands                   │
│   • Layer management                │
│   • Dirty rect tracking             │
│   • Animation frames                │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│    Virtualization Engine            │
│   (Performance Optimization)        │
│   • Viewport calculation            │
│   • Buffer management               │
│   • Scroll synchronization          │
│   • Incremental loading             │
└─────────────────────────────────────┘

## Component Architecture

### Core Table Instance

```typescript
interface TableInstance<TData> {
  // Data access
  getRowModel(): RowModel<TData>;
  getHeaderGroups(): HeaderGroup[];
  getFooterGroups(): FooterGroup[];

  // State management
  getState(): TableState;
  setState(updater: StateUpdater): void;
  resetState(): void;

  // Feature flags
  getCanSelect(): boolean;
  getCanReorder(): boolean;
  getCanResize(): boolean;

  // Canvas operations
  render(): void;
  invalidate(rect?: DirtyRect): void;

  // Event handling
  on(event: string, handler: Handler): void;
  off(event: string, handler: Handler): void;
  emit(event: string, data?: any): void;
}
```

### Hook Composition

Hooks are designed to be composable and independent:

```typescript
// Core table hook
const table = useCanvasTable(options);

// Feature hooks (opt-in)
useRowSelection(table);
useColumnReordering(table);
useStickyColumns(table, { left: 2 });
useKeyboardNavigation(table);

// Rendering hook
const canvasRef = useCanvasRenderer(table);
```

## Data Flow

### 1. Initialization Flow
```
User Config → Create Table Instance → Register Plugins → Initialize State → Setup Canvas
```

### 2. Render Flow
```
State Change → Mark Dirty → Request Animation Frame → Calculate Visible Range → Render Cells → Commit to Canvas
```

### 3. Interaction Flow
```
User Input → Event Handler → Update State → Trigger Re-render → Update Canvas
```

## Separation of Concerns

### Data Layer
**Responsibilities:**
- Data fetching and caching
- Row and column models
- Sorting, filtering, grouping logic
- Data transformations

**Key Components:**
- `RowModel`
- `ColumnModel`
- `DataProvider`
- `FilterFn`, `SortFn`

### State Layer
**Responsibilities:**
- Centralized state management
- State persistence
- Undo/redo functionality
- State synchronization

**Key Components:**
- `TableState`
- `StateManager`
- `StateHistory`
- `StatePersister`

### Virtualization Layer
**Responsibilities:**
- Viewport calculations
- Visible range determination
- Buffer management
- Smooth scrolling

**Key Components:**
- `VirtualizerInstance`
- `ViewportManager`
- `ScrollManager`
- `BufferStrategy`

### Rendering Layer
**Responsibilities:**
- Canvas drawing operations
- Cell rendering
- Style application
- Performance optimizations

**Key Components:**
- `CanvasRenderer`
- `CellRenderer`
- `LayerManager`
- `RenderQueue`

### Interaction Layer
**Responsibilities:**
- User input handling
- Gesture recognition
- Keyboard navigation
- Accessibility

**Key Components:**
- `EventManager`
- `GestureDetector`
- `KeyboardHandler`
- `A11yManager`

## Plugin Architecture

Plugins extend functionality without modifying core:

```typescript
interface Plugin<TData> {
  name: string;
  version: string;

  // Lifecycle hooks
  onInit?(table: TableInstance<TData>): void;
  onDestroy?(table: TableInstance<TData>): void;

  // State extensions
  getInitialState?(): Partial<TableState>;
  stateReducer?(state: TableState, action: Action): TableState;

  // Rendering hooks
  beforeRender?(ctx: CanvasRenderingContext2D): void;
  afterRender?(ctx: CanvasRenderingContext2D): void;
  renderCell?(cell: Cell, ctx: CanvasRenderingContext2D): boolean;

  // Event handlers
  handlers?: Record<string, Handler>;
}
```

### Built-in Plugins

1. **Selection Plugin**: Row, column, and cell selection
2. **Reordering Plugin**: Drag-and-drop for rows/columns
3. **Sticky Plugin**: Fixed rows and columns
4. **Resize Plugin**: Column and row resizing
5. **Sort Plugin**: Multi-column sorting
6. **Filter Plugin**: Column and global filtering

## Performance Strategies

### 1. Render Layers
- **Static Layer**: Grid lines, headers (cached)
- **Data Layer**: Cell content (virtualized)
- **Overlay Layer**: Selection, hover effects
- **Debug Layer**: Performance metrics (optional)

### 2. Dirty Rectangle Tracking
Only redraw changed regions instead of full canvas:
```typescript
interface DirtyRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### 3. Off-screen Canvas
Pre-render cells in background for smooth scrolling:
```typescript
const offscreenCanvas = new OffscreenCanvas(width, height);
const worker = new Worker('renderer.worker.js');
worker.postMessage({ canvas: offscreenCanvas }, [offscreenCanvas]);
```

### 4. Shared Memory
Use SharedArrayBuffer for efficient data transfer between workers:
```typescript
const buffer = new SharedArrayBuffer(rows * columns * bytesPerCell);
const dataView = new Float32Array(buffer);
```

## Memory Management

### 1. Data Virtualization
- Load data in chunks
- Dispose unused data
- Implement LRU cache

### 2. Canvas Optimization
- Reuse canvas contexts
- Clear only dirty regions
- Manage layer lifecycle

### 3. Event Cleanup
- Remove listeners on unmount
- Cancel animation frames
- Clear timeouts/intervals

## Type Safety

Full TypeScript support with generics:

```typescript
interface TableOptions<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getCoreRowModel: () => RowModel<TData>;
  enableRowSelection?: boolean;
  enableColumnReordering?: boolean;
}

interface ColumnDef<TData> {
  id: string;
  header: string | ((info: HeaderContext) => string);
  cell: (info: CellContext<TData>) => string;
  size?: number;
  minSize?: number;
  maxSize?: number;
}
```

## Testing Strategy

### 1. Unit Tests
- Hook logic
- State management
- Virtualization calculations

### 2. Integration Tests
- Plugin interactions
- Event flow
- Render pipeline

### 3. Performance Tests
- Frame rate monitoring
- Memory profiling
- Scroll performance

### 4. Visual Tests
- Canvas snapshot testing
- Pixel-perfect rendering
- Cross-browser compatibility