# Canvas Table

The high-performance data grid toolkit for React.

Created by Gruckion, this free open-source library provides a blazing-fast canvas-based table implementation for React applications with an intuitive API similar to TanStack Table.

## Installation

```shell
npm install @gruckion/canvas-table
```

## Setup

Create a table instance with your configuration:

```typescript
// app/table.tsx
import { useCanvasTable } from '@gruckion/canvas-table';

export function createTable() {
  return useCanvasTable({
    rowCount: 100000,
    columnCount: 20,
    defaultColumnWidth: 120,
    defaultRowHeight: 30,
  });
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
- 🚧 Styling with CSS / Tailwind

## Performance

Optimized for massive datasets:

- Handle 100M+ cells
- < 100ms initial render
- Consistent 60fps scrolling
- Memory-efficient virtualization

## Usage

Use in your React component:

```typescript
// app/page.tsx
import {
  CanvasTable,
  CanvasTableViewport,
  CanvasTableScroller,
  useCanvasTable,
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

## Examples

See the [Next.js example](./examples/nextjs) for a complete implementation.

## Documentation

Visit [canvas-table.gruckion.com](https://canvas-table.gruckion.com) for full documentation.

## License

MIT
