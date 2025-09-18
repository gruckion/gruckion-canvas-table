# Canvas Table

The high-performance data grid toolkit for React.

Built with canvas rendering and virtualization, this library handles millions of rows with smooth 60fps performance. Features an intuitive API similar to TanStack Table for a familiar developer experience.

## Installation

```shell
npm install @gruckion/canvas-table
```

Or with pnpm:

```shell
pnpm add @gruckion/canvas-table
```

## Quick Start

Create a virtualized data grid with just a few lines:

```typescript
import {
  useCanvasTable,
  CanvasTable,
  CanvasTableViewport,
  CanvasTableScroller,
} from '@gruckion/canvas-table';

export default function DataGrid() {
  const table = useCanvasTable({
    rowCount: 100000,
    columnCount: 20,
    defaultColumnWidth: 120,
    defaultRowHeight: 30,
  });

  return (
    <CanvasTable table={table} height={600}>
      <CanvasTableViewport />
      <CanvasTableScroller />
    </CanvasTable>
  );
}
```

## Features

- 🚀 **Blazing Fast**: Render millions of cells with consistent 60fps performance
- 🎨 **Canvas-based**: Uses HTML5 Canvas instead of DOM for superior performance
- 🔄 **Virtualization**: Built-in row and column virtualization
- 🧩 **Composable**: Small, focused components that work together
- 📦 **Headless**: Core logic separated from rendering
- 🎯 **TypeScript**: Full type safety and IntelliSense support

### Roadmap

- ✅ Virtualization for millions of rows/columns
- ✅ Smooth 60fps scrolling
- ✅ TypeScript support
- ✅ Headless architecture
- ✅ Composable components
- 🚧 Column resizing (coming soon)
- 🚧 Row/column selection (coming soon)
- 🚧 Sticky headers (coming soon)
- 🚧 Cell editing (coming soon)

## Performance

Optimized for massive datasets:

- Handle 100M+ cells
- < 100ms initial render
- Consistent 60fps scrolling
- Memory-efficient virtualization

## API Reference

### useCanvasTable

The main hook for creating a table instance:

```typescript
const table = useCanvasTable({
  rowCount: 10000,
  columnCount: 100,
  defaultColumnWidth: 100,
  defaultRowHeight: 30,
  debugMode: false, // Enable debug overlay
});
```

### Components

**CanvasTable** - Main container component

```tsx
<CanvasTable table={table} height={600} width="100%">
  {children}
</CanvasTable>
```

**CanvasTableViewport** - Renders the canvas element

```tsx
<CanvasTableViewport className="custom-class" />
```

**CanvasTableScroller** - Provides virtual scrolling

```tsx
<CanvasTableScroller className="custom-class" />
```

## Documentation

Full documentation and examples available at [canvas-table.gruckion.com](https://canvas-table.gruckion.com).

## License

MIT
