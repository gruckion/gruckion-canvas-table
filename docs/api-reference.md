# API Reference

Complete API documentation for Canvas Table library.

## Core Hooks

### useCanvasTable

The main hook for creating a table instance.

```typescript
function useCanvasTable<TData>(
  options: TableOptions<TData>
): TableInstance<TData>
```

#### Parameters

```typescript
interface TableOptions<TData> {
  // Required
  data: TData[];
  columns: ColumnDef<TData>[];

  // Row Models
  getCoreRowModel?: () => RowModel<TData>;
  getFilteredRowModel?: () => RowModel<TData>;
  getSortedRowModel?: () => RowModel<TData>;
  getGroupedRowModel?: () => RowModel<TData>;

  // Features
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  enableMultiRowSelection?: boolean;
  enableColumnReordering?: boolean;
  enableColumnResizing?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;

  // Dimensions
  defaultColumnSize?: number;
  defaultRowSize?: number;
  minColumnSize?: number;
  maxColumnSize?: number;

  // Virtualization
  enableVirtualization?: boolean;
  overscan?: number;
  estimatedRowSize?: number;
  estimatedColumnSize?: number;

  // State
  initialState?: Partial<TableState>;
  onStateChange?: (state: TableState) => void;
  state?: Partial<TableState>;

  // Rendering
  renderCell?: CellRenderer<TData>;
  renderHeader?: HeaderRenderer;
  renderFooter?: FooterRenderer;

  // Events
  onCellClick?: (cell: Cell<TData>) => void;
  onCellHover?: (cell: Cell<TData>) => void;
  onSelectionChange?: (selection: RowSelectionState) => void;
  onColumnOrderChange?: (columnOrder: string[]) => void;

  // Performance
  debugMode?: boolean;
  maxRenderFrequency?: number;
  enableOffscreenRendering?: boolean;
}
```

#### Returns

```typescript
interface TableInstance<TData> {
  // Core
  options: TableOptions<TData>;
  initialState: TableState;

  // Row Access
  getRowModel(): RowModel<TData>;
  getCoreRowModel(): RowModel<TData>;
  getRow(id: string): Row<TData>;
  getRowCount(): number;

  // Column Access
  getAllColumns(): Column<TData>[];
  getColumn(id: string): Column<TData>;
  getHeaderGroups(): HeaderGroup<TData>[];
  getFlatHeaders(): Header<TData>[];

  // State
  getState(): TableState;
  setState(updater: StateUpdater): void;
  resetState(defaultState?: boolean): void;
  setOptions(newOptions: Partial<TableOptions<TData>>): void;

  // Selection
  getIsAllRowsSelected(): boolean;
  getIsSomeRowsSelected(): boolean;
  toggleAllRowsSelected(value?: boolean): void;
  getSelectedRowModel(): RowModel<TData>;

  // Rendering
  render(): void;
  invalidate(rect?: DirtyRect): void;
  forceRender(): void;

  // Canvas
  setCanvas(canvas: HTMLCanvasElement): void;
  getCanvas(): HTMLCanvasElement | null;
  getContext(): CanvasRenderingContext2D | null;

  // Lifecycle
  destroy(): void;
  reset(): void;
}
```

### useVirtualization

Hook for virtualization functionality.

```typescript
function useVirtualization(
  table: TableInstance,
  options?: VirtualizationOptions
): VirtualizerInstance
```

#### Parameters

```typescript
interface VirtualizationOptions {
  // Viewport
  height: number;
  width: number;

  // Items
  count: number;
  estimateSize: (index: number) => number;
  overscan?: number;

  // Scrolling
  scrollElement?: HTMLElement | null;
  horizontal?: boolean;
  scrollMargin?: number;
  scrollPaddingStart?: number;
  scrollPaddingEnd?: number;

  // Performance
  measureElement?: (element: HTMLElement) => void;
  debug?: boolean;
}
```

#### Returns

```typescript
interface VirtualizerInstance {
  // Measurements
  getTotalSize(): number;
  scrollToIndex(index: number, options?: ScrollToOptions): void;
  scrollToOffset(offset: number, options?: ScrollToOptions): void;

  // Visible Items
  getVirtualItems(): VirtualItem[];
  getVirtualItemForOffset(offset: number): VirtualItem;

  // Range
  range: {
    startIndex: number;
    endIndex: number;
    overscanStartIndex: number;
    overscanEndIndex: number;
  };

  // Scroll
  scrollOffset: number;
  scrollDirection: 'forward' | 'backward' | null;
  isScrolling: boolean;
}
```

### useSelection

Hook for row selection functionality.

```typescript
function useSelection(
  table: TableInstance,
  options?: SelectionOptions
): SelectionInstance
```

#### Parameters

```typescript
interface SelectionOptions {
  enableRowSelection?: boolean | ((row: Row) => boolean);
  enableMultiRowSelection?: boolean;
  enableRangeSelection?: boolean;
  enableCellSelection?: boolean;
  selectOnClick?: boolean;
  resetOnDataChange?: boolean;
}
```

### useColumnReordering

Hook for column reordering via drag and drop.

```typescript
function useColumnReordering(
  table: TableInstance,
  options?: ReorderingOptions
): ReorderingInstance
```

### useSticky

Hook for sticky rows and columns.

```typescript
function useSticky(
  table: TableInstance,
  options?: StickyOptions
): StickyInstance
```

#### Parameters

```typescript
interface StickyOptions {
  leftColumns?: number;
  rightColumns?: number;
  topRows?: number;
  bottomRows?: number;
}
```

## Components

### CanvasTable

Main table component.

```tsx
interface CanvasTableProps {
  table: TableInstance;
  className?: string;
  height?: number | string;
  width?: number | string;
  onScroll?: (event: ScrollEvent) => void;
  children?: ReactNode;
}

<CanvasTable table={table} height={600}>
  <CanvasTableHeader />
  <CanvasTableBody />
  <CanvasTableScrollbars />
</CanvasTable>
```

### CanvasTableHeader

Renders table headers.

```tsx
interface CanvasTableHeaderProps {
  sticky?: boolean;
  className?: string;
  renderHeader?: (header: Header) => ReactNode;
}
```

### CanvasTableBody

Renders table body with virtualization.

```tsx
interface CanvasTableBodyProps {
  className?: string;
  renderCell?: (cell: Cell) => ReactNode;
  onCellClick?: (cell: Cell) => void;
  onCellHover?: (cell: Cell) => void;
}
```

### CanvasTableScrollbars

Custom scrollbars for the table.

```tsx
interface CanvasTableScrollbarsProps {
  showHorizontal?: boolean;
  showVertical?: boolean;
  autoHide?: boolean;
  className?: string;
}
```

## Column Definition

### Basic Column

```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    size: 200,
  },
  {
    id: 'age',
    header: 'Age',
    accessorFn: row => row.age,
    size: 100,
  },
];
```

### Advanced Column

```typescript
const columns: ColumnDef<Person>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onChange={table.toggleAllRowsSelected}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.toggleSelected}
      />
    ),
    size: 50,
    enableSorting: false,
    enableResizing: false,
  },
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    cell: info => info.getValue(),
    footer: info => info.column.id,
    sortingFn: 'alphanumeric',
    filterFn: 'includesString',
    size: 200,
    minSize: 100,
    maxSize: 400,
    enableColumnFilter: true,
    enableGlobalFilter: true,
  },
];
```

## State Management

### Table State

```typescript
interface TableState {
  // Selection
  rowSelection: RowSelectionState;
  cellSelection: CellSelectionState;

  // Ordering
  columnOrder: string[];
  columnSizing: ColumnSizingState;
  columnVisibility: ColumnVisibilityState;

  // Sorting & Filtering
  sorting: SortingState;
  filters: FiltersState;
  globalFilter: any;

  // Grouping
  grouping: GroupingState;
  expanded: ExpandedState;

  // Pagination
  pagination: PaginationState;

  // Viewport
  scrollLeft: number;
  scrollTop: number;
  viewportWidth: number;
  viewportHeight: number;
}
```

### State Updates

```typescript
// Controlled state
const [state, setState] = useState<TableState>();

const table = useCanvasTable({
  state,
  onStateChange: setState,
  // ...
});

// Uncontrolled with callbacks
const table = useCanvasTable({
  onRowSelectionChange: (selection) => {
    console.log('Selection changed:', selection);
  },
  // ...
});

// Direct state updates
table.setState(prev => ({
  ...prev,
  rowSelection: { '1': true, '2': true }
}));
```

## Rendering

### Custom Cell Renderer

```typescript
const renderCell: CellRenderer<Person> = ({
  cell,
  ctx,
  x,
  y,
  width,
  height,
}) => {
  const value = cell.getValue();

  // Custom drawing
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width, height);

  ctx.fillStyle = '#000000';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x + width / 2, y + height / 2);

  // Return true if handled, false to use default
  return true;
};
```

### Layer System

```typescript
// Register custom layer
table.addLayer({
  id: 'selection',
  zIndex: 10,
  render: (ctx, viewport) => {
    // Draw selection overlay
    const selection = table.getState().rowSelection;
    // ... drawing logic
  },
});
```

## Events

### Event Types

```typescript
// Mouse events
onCellClick?: (cell: Cell, event: MouseEvent) => void;
onCellDoubleClick?: (cell: Cell, event: MouseEvent) => void;
onCellRightClick?: (cell: Cell, event: MouseEvent) => void;
onCellHover?: (cell: Cell, event: MouseEvent) => void;

// Selection events
onRowSelect?: (row: Row) => void;
onRowDeselect?: (row: Row) => void;
onSelectionChange?: (selection: RowSelectionState) => void;

// Reordering events
onColumnDragStart?: (column: Column) => void;
onColumnDragEnd?: (column: Column, newIndex: number) => void;
onRowDragStart?: (row: Row) => void;
onRowDragEnd?: (row: Row, newIndex: number) => void;

// Resize events
onColumnResize?: (column: Column, size: number) => void;
onRowResize?: (row: Row, size: number) => void;

// Scroll events
onScroll?: (event: ScrollEvent) => void;
onScrollEnd?: () => void;
```

### Event Subscription

```typescript
// Subscribe to events
const unsubscribe = table.on('cellClick', (cell) => {
  console.log('Cell clicked:', cell);
});

// Cleanup
unsubscribe();

// Multiple event handlers
table.on('scroll', handler1);
table.on('scroll', handler2);

// Remove specific handler
table.off('scroll', handler1);
```

## Performance

### Optimization Options

```typescript
const table = useCanvasTable({
  // Virtualization
  enableVirtualization: true,
  overscan: 5, // Render 5 extra rows/columns

  // Rendering
  maxRenderFrequency: 60, // Max 60fps
  enableOffscreenRendering: true,
  enableDirtyRectTracking: true,

  // Memory
  enableDataVirtualization: true,
  dataChunkSize: 1000,
  maxCachedRows: 10000,

  // Debug
  debugMode: true,
  debugRenderBoundaries: true,
  debugPerformance: true,
});
```

### Performance Monitoring

```typescript
// Get performance metrics
const metrics = table.getPerformanceMetrics();
console.log({
  fps: metrics.fps,
  renderTime: metrics.renderTime,
  memoryUsage: metrics.memoryUsage,
  visibleCells: metrics.visibleCells,
});

// Performance observer
table.on('performanceUpdate', (metrics) => {
  if (metrics.fps < 30) {
    console.warn('Low FPS detected');
  }
});
```

## Utilities

### Sorting Functions

```typescript
// Built-in sorting functions
const sortingFns = {
  alphanumeric: (rowA, rowB, columnId) => { /* ... */ },
  numeric: (rowA, rowB, columnId) => { /* ... */ },
  datetime: (rowA, rowB, columnId) => { /* ... */ },
  basic: (rowA, rowB, columnId) => { /* ... */ },
};

// Custom sorting function
const customSort: SortingFn<Person> = (rowA, rowB, columnId) => {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);
  return a < b ? -1 : a > b ? 1 : 0;
};
```

### Filter Functions

```typescript
// Built-in filter functions
const filterFns = {
  includesString: (row, columnId, filterValue) => { /* ... */ },
  equals: (row, columnId, filterValue) => { /* ... */ },
  between: (row, columnId, filterValue) => { /* ... */ },
  arrayIncludes: (row, columnId, filterValue) => { /* ... */ },
};

// Custom filter function
const customFilter: FilterFn<Person> = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
};
```

## TypeScript Types

### Core Types

```typescript
// Row type
interface Row<TData> {
  id: string;
  index: number;
  original: TData;
  depth: number;
  getValue<TValue>(columnId: string): TValue;
  getAllCells(): Cell<TData>[];
  getIsSelected(): boolean;
  toggleSelected(value?: boolean): void;
}

// Cell type
interface Cell<TData> {
  id: string;
  row: Row<TData>;
  column: Column<TData>;
  getValue(): any;
  renderValue(): any;
  getContext(): CellContext<TData>;
}

// Column type
interface Column<TData> {
  id: string;
  depth: number;
  accessorFn?: AccessorFn<TData>;
  columnDef: ColumnDef<TData>;
  getSize(): number;
  getStart(): number;
  getCanResize(): boolean;
  getCanReorder(): boolean;
}
```

### Context Types

```typescript
interface CellContext<TData> {
  table: TableInstance<TData>;
  column: Column<TData>;
  row: Row<TData>;
  cell: Cell<TData>;
  getValue: () => any;
  renderValue: () => any;
}

interface HeaderContext<TData> {
  table: TableInstance<TData>;
  column: Column<TData>;
  header: Header<TData>;
}
```