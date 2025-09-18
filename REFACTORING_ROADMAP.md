# Canvas Table Refactoring Roadmap

## Vision

Build a high-performance, headless table library that leverages Canvas for rendering while maintaining the developer experience and extensibility of modern table libraries like TanStack Table.

## Core Principles

### 1. Performance First

- **Hot Path Optimization**: Keep rendering loops inline with minimal function calls
- **Direct Property Access**: Use direct property access for frequently accessed state
- **Lazy Initialization**: Features only initialize when actually used
- **Object Pooling**: Reuse objects in high-frequency operations

### 2. Progressive Enhancement

- **Minimal Core**: Base functionality works with zero configuration
- **Composable Features**: Add capabilities via composition, not inheritance
- **Tree-Shaking**: Unused features are eliminated from bundles

### 3. Developer Experience

- **Familiar API**: Similar patterns to TanStack Table
- **Type Safety**: Full TypeScript support with inference
- **Extensible**: Easy to add custom features

## Phase 1: Foundation (Current Sprint)

### 1.1 Create Table Instance Pattern

```typescript
interface TableInstance<TData> {
  // Core
  getData: () => TData[];
  getColumns: () => ColumnDef<TData>[];
  getRowCount: () => number;
  getColumnCount: () => number;

  // Viewport
  getViewportBounds: () => ViewportBounds;
  scrollToRow: (index: number) => void;
  scrollToColumn: (index: number) => void;

  // Rendering
  renderGrid: () => void;

  // State
  getState: () => TableState;
  setState: (updater: (prev: TableState) => TableState) => void;
}
```

**Benefits:**

- Programmatic control over table
- State accessible outside component
- Foundation for headless architecture

### 1.2 Extract Row Model

```typescript
interface RowModel<TData> {
  rows: Row<TData>[];
  flatRows: Row<TData>[];
  rowsById: Record<string, Row<TData>>;
  getRowById: (id: string) => Row<TData> | undefined;
  getRowAtIndex: (index: number) => Row<TData> | undefined;
}
```

**Implementation Priority:**

1. `getCoreRowModel` - Direct data mapping
2. `getSortedRowModel` - Client-side sorting
3. `getFilteredRowModel` - Client-side filtering
4. `getGroupedRowModel` - Row grouping

## Phase 2: Feature System

### 2.1 Plugin Architecture

```typescript
interface TableFeature<TData> {
  id: string;
  // Lifecycle hooks
  onInit?: (table: TableInstance<TData>) => void;
  onDestroy?: (table: TableInstance<TData>) => void;

  // Enhancement hooks
  enhanceColumns?: (columns: ColumnDef<TData>[]) => ColumnDef<TData>[];
  enhanceRow?: (row: Row<TData>) => Row<TData>;
  enhanceCell?: (cell: Cell<TData>) => Cell<TData>;

  // State management
  getDefaultState?: () => any;
  onStateChange?: (state: any) => void;

  // Rendering hooks
  beforeRender?: (ctx: RenderContext) => void;
  afterRender?: (ctx: RenderContext) => void;
}
```

**Core Features to Implement:**

- Sorting
- Filtering
- Selection (row, cell, range)
- Column Resizing
- Column Reordering
- Virtualization (enhanced)
- Pagination

### 2.2 State Management

```typescript
class TableStateManager<TState> {
  // Direct access for hot paths
  scrollX: number = 0;
  scrollY: number = 0;
  viewportWidth: number = 0;
  viewportHeight: number = 0;

  // Complex state with subscriptions
  private state: TState;
  private listeners = new Set<StateListener<TState>>();

  batchUpdate(updates: Partial<TState>): void;
  subscribe(listener: StateListener<TState>): () => void;
}
```

## Phase 3: Rendering Abstraction

### 3.1 Renderer Interface

```typescript
interface GridRenderer {
  // Setup
  initialize(container: HTMLElement, options: RendererOptions): void;
  setDimensions(width: number, height: number): void;

  // Rendering
  clear(): void;
  renderCell(cell: CellRenderData): void;
  renderCells(cells: CellRenderData[]): void;

  // Optimization
  startBatch(): void;
  endBatch(): void;

  // Cleanup
  destroy(): void;
}
```

**Renderer Implementations:**

1. **CanvasRenderer** (current) - 2D Canvas API
2. **WebGLRenderer** (future) - For millions of cells
3. **DOMRenderer** (fallback) - Accessibility and SEO
4. **HybridRenderer** (experimental) - DOM headers, Canvas body

### 3.2 Render Pipeline

```typescript
interface RenderPipeline {
  // Stages that can be customized
  prepare(context: RenderContext): void;
  calculate(context: RenderContext): void;
  render(context: RenderContext): void;
  cleanup(context: RenderContext): void;
}
```

## Phase 4: Advanced Features

### 4.1 Virtual Scrolling 2.0

- **Dynamic row heights**
- **Horizontal virtualization**
- **Overscan optimization**
- **Smooth scrolling physics**

### 4.2 Data Operations

- **Incremental loading**
- **Infinite scroll**
- **Real-time updates**
- **Optimistic updates**

### 4.3 Interaction Layer

- **Cell editing**
- **Keyboard navigation**
- **Context menus**
- **Drag and drop**

## Phase 5: Ecosystem

### 5.1 Framework Adapters

```typescript
// React
export { useCanvasTable } from '@canvas-table/react';

// Vue
export { useCanvasTable } from '@canvas-table/vue';

// Svelte
export { createCanvasTable } from '@canvas-table/svelte';

// Vanilla
export { createCanvasTable } from '@canvas-table/core';
```

### 5.2 Theme System

- Tailwind plugin for theme generation
- CSS-in-JS support
- Dark mode support
- Theme customization API

### 5.3 Developer Tools

- Performance profiler
- Debug mode with visual indicators
- Chrome extension for inspection
- Storybook integration

## Migration Strategy

### From Current to Phase 1

1. Extract table logic from component to hook
2. Create table instance with current functionality
3. Add getCoreRowModel wrapper
4. Ensure no performance regression

### Benchmarks

Performance targets for 100,000 rows × 100 columns:

- Initial render: < 16ms
- Scroll frame: < 8ms
- Sort operation: < 100ms
- Filter operation: < 50ms
- Memory usage: < 100MB

### Testing Strategy

- Unit tests for core logic
- Performance benchmarks for each feature
- Visual regression tests for rendering
- E2E tests for interactions

## API Compatibility

### TanStack Table Compatibility

We'll maintain API compatibility where it makes sense:

- Similar option names
- Similar method signatures
- Compatible type definitions
- Migration guide from TanStack

### Breaking Changes

Where we diverge for performance:

- No row model nesting (use flat structure)
- No automatic re-renders (explicit render calls)
- Canvas-specific options (can't be avoided)

## Timeline Estimates

- **Phase 1**: 2-3 weeks
- **Phase 2**: 3-4 weeks
- **Phase 3**: 2-3 weeks
- **Phase 4**: 4-6 weeks
- **Phase 5**: Ongoing

## Success Metrics

1. **Performance**: 10x faster than DOM-based tables
2. **Bundle Size**: < 20KB gzipped core
3. **Adoption**: 1000+ GitHub stars in first year
4. **Developer Experience**: 90% positive feedback
5. **Documentation**: 100% API coverage

## Next Steps

1. ✅ Complete improved-canvas-table.tsx with separated concerns
2. ⏳ Create useCanvasTable hook
3. ⏳ Implement getCoreRowModel
4. ⏳ Add first feature (sorting)
5. ⏳ Create benchmarking suite
