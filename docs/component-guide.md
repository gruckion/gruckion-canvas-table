# Component Composition Guide

Learn how to compose Canvas Table components for different use cases following React best practices.

## Core Principles

### 1. Composition Over Configuration
Instead of passing dozens of props, compose smaller components:

```tsx
// ❌ Avoid: Monolithic configuration
<CanvasTable
  data={data}
  columns={columns}
  enableSelection={true}
  enableSorting={true}
  enableFiltering={true}
  stickyHeader={true}
  stickyFirstColumn={true}
  showScrollbars={true}
  // ... many more props
/>

// ✅ Prefer: Component composition
<CanvasTable table={table}>
  <StickyHeader />
  <FilterBar />
  <TableBody />
  <ScrollIndicators />
</CanvasTable>
```

### 2. Separation of Concerns
Each component has a single, well-defined responsibility:

```tsx
// Each component handles one concern
<CanvasTable table={table}>
  <TableToolbar />        {/* User controls */}
  <TableHeader />         {/* Column headers */}
  <TableBody />           {/* Data rendering */}
  <TableFooter />         {/* Summaries */}
  <TablePagination />     {/* Page navigation */}
</CanvasTable>
```

### 3. Hook-Based Logic
Extract logic into custom hooks for reusability:

```tsx
// Custom hook for table logic
function useDataTable(data) {
  const table = useCanvasTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useSelection(table);
  useFiltering(table);
  useSorting(table);

  return table;
}

// Clean component
function DataTable({ data }) {
  const table = useDataTable(data);
  return <CanvasTable table={table} />;
}
```

## Component Patterns

### Basic Table

Minimal setup for a simple data display:

```tsx
function BasicTable({ data }) {
  const columns = useMemo(() => [
    { id: 'name', header: 'Name', accessorKey: 'name' },
    { id: 'age', header: 'Age', accessorKey: 'age' },
    { id: 'email', header: 'Email', accessorKey: 'email' },
  ], []);

  const table = useCanvasTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <CanvasTable table={table} height={400}>
      <CanvasTableBody />
    </CanvasTable>
  );
}
```

### Interactive Table

Table with selection, sorting, and filtering:

```tsx
function InteractiveTable({ data }) {
  const table = useCanvasTable({
    data,
    columns,
    enableRowSelection: true,
    enableSorting: true,
    enableFiltering: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col h-full">
      <TableControls table={table} />
      <CanvasTable table={table} className="flex-1">
        <CanvasTableHeader />
        <CanvasTableBody />
      </CanvasTable>
      <TableStatus table={table} />
    </div>
  );
}

function TableControls({ table }) {
  return (
    <div className="p-4 border-b">
      <input
        placeholder="Search..."
        onChange={e => table.setGlobalFilter(e.target.value)}
        className="px-3 py-2 border rounded"
      />
      <button
        onClick={() => table.toggleAllRowsSelected()}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Toggle All
      </button>
    </div>
  );
}

function TableStatus({ table }) {
  const rowCount = table.getRowCount();
  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="p-2 border-t text-sm text-gray-600">
      {selectedCount} of {rowCount} rows selected
    </div>
  );
}
```

### Advanced Data Grid

Full-featured data grid with all capabilities:

```tsx
function AdvancedDataGrid({ data }) {
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [columnSizing, setColumnSizing] = useState({});

  const table = useCanvasTable({
    data,
    columns,
    state: {
      columnOrder,
      columnSizing,
    },
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    enableColumnReordering: true,
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
  });

  // Add advanced features via hooks
  useSticky(table, { leftColumns: 2, topRows: 1 });
  useKeyboardNavigation(table);
  useContextMenu(table);
  useExport(table);

  return (
    <DataGridProvider table={table}>
      <DataGridToolbar />
      <DataGridContainer>
        <DataGridHeaders />
        <DataGridBody />
        <DataGridScrollbars />
      </DataGridContainer>
      <DataGridStatusBar />
    </DataGridProvider>
  );
}
```

## Custom Components

### Custom Cell Renderer

Create specialized cell renderers:

```tsx
function StatusCell({ cell }) {
  const status = cell.getValue();

  return (
    <div className="flex items-center gap-2">
      <StatusIndicator status={status} />
      <span>{status}</span>
    </div>
  );
}

function CurrencyCell({ cell }) {
  const value = cell.getValue();
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

  return <span className="font-mono">{formatted}</span>;
}

// Use in column definition
const columns = [
  {
    id: 'status',
    cell: StatusCell,
  },
  {
    id: 'price',
    cell: CurrencyCell,
  },
];
```

### Custom Header Component

Enhance headers with additional functionality:

```tsx
function SortableHeader({ column, table }) {
  return (
    <button
      className="flex items-center gap-1 w-full"
      onClick={column.getToggleSortingHandler()}
    >
      <span>{column.columnDef.header}</span>
      <SortIndicator column={column} />
    </button>
  );
}

function SortIndicator({ column }) {
  if (!column.getIsSorted()) {
    return <ChevronUpDown className="w-4 h-4 opacity-50" />;
  }

  return column.getIsSorted() === 'asc' ? (
    <ChevronUp className="w-4 h-4" />
  ) : (
    <ChevronDown className="w-4 h-4" />
  );
}
```

### Custom Scrollbars

Replace default scrollbars with custom implementation:

```tsx
function CustomScrollbars({ table }) {
  const [showScrollbars, setShowScrollbars] = useState(false);
  const hideTimeout = useRef<NodeJS.Timeout>();

  const handleScroll = useCallback(() => {
    setShowScrollbars(true);

    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      setShowScrollbars(false);
    }, 1000);
  }, []);

  return (
    <>
      <HorizontalScrollbar
        table={table}
        visible={showScrollbars}
        onScroll={handleScroll}
      />
      <VerticalScrollbar
        table={table}
        visible={showScrollbars}
        onScroll={handleScroll}
      />
    </>
  );
}
```

## Composition Patterns

### Provider Pattern

Share table state across components:

```tsx
const TableContext = createContext<TableInstance | null>(null);

function TableProvider({ children, ...props }) {
  const table = useCanvasTable(props);

  return (
    <TableContext.Provider value={table}>
      {children}
    </TableContext.Provider>
  );
}

function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within TableProvider');
  }
  return context;
}

// Usage
function MyTable({ data }) {
  return (
    <TableProvider data={data} columns={columns}>
      <TableHeader />
      <TableBody />
      <TableFooter />
    </TableProvider>
  );
}
```

### Compound Component Pattern

Create related components that work together:

```tsx
const Table = ({ children, ...props }) => {
  const table = useCanvasTable(props);
  return <TableContext.Provider value={table}>{children}</TableContext.Provider>;
};

Table.Header = function TableHeader({ children }) {
  const table = useTableContext();
  return <div className="table-header">{children || <DefaultHeader />}</div>;
};

Table.Body = function TableBody({ children }) {
  const table = useTableContext();
  return <div className="table-body">{children || <DefaultBody />}</div>;
};

Table.Footer = function TableFooter({ children }) {
  const table = useTableContext();
  return <div className="table-footer">{children || <DefaultFooter />}</div>;
};

// Usage
<Table data={data} columns={columns}>
  <Table.Header />
  <Table.Body />
  <Table.Footer />
</Table>
```

### Render Props Pattern

Provide flexibility with render props:

```tsx
function TableWrapper({ table, children }) {
  const renderProps = {
    table,
    rows: table.getRowModel().rows,
    columns: table.getAllColumns(),
    state: table.getState(),
  };

  return (
    <div className="table-wrapper">
      {typeof children === 'function' ? children(renderProps) : children}
    </div>
  );
}

// Usage
<TableWrapper table={table}>
  {({ rows, columns, state }) => (
    <>
      <div>Showing {rows.length} rows</div>
      <div>Selected: {Object.keys(state.rowSelection).length}</div>
      <CanvasTableBody />
    </>
  )}
</TableWrapper>
```

## Feature Composition

### Composing Multiple Features

Combine features using hooks:

```tsx
function useFullFeaturedTable(data) {
  const table = useCanvasTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Layer features via hooks
  const selection = useSelection(table, {
    enableMultiRowSelection: true,
    enableRangeSelection: true,
  });

  const sorting = useSorting(table, {
    enableMultiSort: true,
    enableRemovingSort: true,
  });

  const filtering = useFiltering(table, {
    enableColumnFilters: true,
    enableGlobalFilter: true,
  });

  const pagination = usePagination(table, {
    pageSize: 50,
    pageSizeOptions: [25, 50, 100],
  });

  return {
    table,
    selection,
    sorting,
    filtering,
    pagination,
  };
}
```

### Conditional Features

Enable features based on conditions:

```tsx
function AdaptiveTable({ data, enableAdvancedFeatures }) {
  const table = useCanvasTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Conditionally add features
  if (enableAdvancedFeatures) {
    useSelection(table);
    useColumnReordering(table);
    useColumnResizing(table);
  }

  // Always-on features
  useVirtualization(table);
  useKeyboardNavigation(table);

  return <CanvasTable table={table} />;
}
```

## Performance Optimization

### Memoization Strategy

Optimize re-renders with proper memoization:

```tsx
const MemoizedHeader = memo(function Header({ table }) {
  return <CanvasTableHeader />;
});

const MemoizedBody = memo(function Body({ table }) {
  return <CanvasTableBody />;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.table.getState().sorting === nextProps.table.getState().sorting;
});

function OptimizedTable({ data }) {
  const columns = useMemo(() => generateColumns(), []);
  const table = useCanvasTable({ data, columns });

  return (
    <CanvasTable table={table}>
      <MemoizedHeader table={table} />
      <MemoizedBody table={table} />
    </CanvasTable>
  );
}
```

### Lazy Loading Components

Load features on demand:

```tsx
const LazyExportDialog = lazy(() => import('./ExportDialog'));
const LazyAdvancedFilters = lazy(() => import('./AdvancedFilters'));

function TableWithLazyFeatures({ data }) {
  const [showExport, setShowExport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <CanvasTable table={table} />

      {showExport && (
        <Suspense fallback={<Spinner />}>
          <LazyExportDialog table={table} />
        </Suspense>
      )}

      {showFilters && (
        <Suspense fallback={<Spinner />}>
          <LazyAdvancedFilters table={table} />
        </Suspense>
      )}
    </>
  );
}
```

## Testing Components

### Component Testing

Test individual components in isolation:

```tsx
describe('TableHeader', () => {
  it('renders column headers', () => {
    const table = createMockTable({
      columns: [
        { id: 'name', header: 'Name' },
        { id: 'age', header: 'Age' },
      ],
    });

    render(<TableHeader table={table} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('handles sorting on click', () => {
    const table = createMockTable({ enableSorting: true });
    const onSort = jest.fn();
    table.on('sort', onSort);

    render(<TableHeader table={table} />);
    fireEvent.click(screen.getByText('Name'));

    expect(onSort).toHaveBeenCalled();
  });
});
```

### Integration Testing

Test component composition:

```tsx
describe('DataTable Integration', () => {
  it('filters and sorts data correctly', async () => {
    const data = generateTestData(100);

    render(
      <DataTable
        data={data}
        enableFiltering
        enableSorting
      />
    );

    // Test filtering
    const searchInput = screen.getByPlaceholderText('Search...');
    await userEvent.type(searchInput, 'John');

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(5); // Filtered results

    // Test sorting
    const nameHeader = screen.getByText('Name');
    await userEvent.click(nameHeader);

    const firstRow = rows[0];
    expect(firstRow).toHaveTextContent('John Adams');
  });
});
```