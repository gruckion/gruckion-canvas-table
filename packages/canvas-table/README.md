# @gruckion/canvas-table

A high-performance, headless React canvas-based table library with virtualization support for rendering millions of rows and columns.

## Features

- 🚀 **Blazing Fast**: Render millions of cells with consistent 60fps performance
- 🎨 **Canvas-based**: Uses HTML5 Canvas instead of DOM for superior performance
- 🔄 **Virtualization**: Built-in row and column virtualization
- 🧩 **Composable**: Small, focused components that work together
- 📦 **Headless**: Core logic separated from rendering
- 🎯 **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install @gruckion/canvas-table
# or
pnpm add @gruckion/canvas-table
# or
yarn add @gruckion/canvas-table
```

## Quick Start

```tsx
import {
  useCanvasTable,
  CanvasTable,
  CanvasTableViewport,
  CanvasTableScroller,
} from '@gruckion/canvas-table';

function MyTable() {
  const table = useCanvasTable({
    rowCount: 10000,
    columnCount: 100,
    defaultColumnWidth: 100,
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

## API Reference

### useCanvasTable

The main hook for creating a table instance.

```tsx
const table = useCanvasTable(options);
```

#### Options

- `rowCount` (number): Total number of rows
- `columnCount` (number): Total number of columns
- `defaultColumnWidth` (number): Default width for columns in pixels
- `defaultRowHeight` (number): Default height for rows in pixels
- `debugMode` (boolean): Enable debug overlay

### Components

#### CanvasTable

Main container component that provides table context.

```tsx
<CanvasTable table={table} height={600} width="100%">
  {children}
</CanvasTable>
```

#### CanvasTableViewport

Renders the canvas element where the table is drawn.

```tsx
<CanvasTableViewport className="custom-class" />
```

#### CanvasTableScroller

Provides scrolling functionality with virtualization.

```tsx
<CanvasTableScroller className="custom-class" />
```

## Architecture

The library follows a layered architecture:

1. **Hooks Layer**: Core business logic (`useCanvasTable`, `useVirtualization`)
2. **Components Layer**: React components for composition
3. **Renderer Layer**: Canvas drawing operations
4. **Types Layer**: TypeScript interfaces and types

## Performance

Canvas Table is designed to handle massive datasets:

- 100M+ cells (10,000+ rows × 10,000+ columns)
- Consistent 60 FPS scrolling
- < 100ms initial render
- < 200MB memory footprint for 1M visible cells

## License

MIT