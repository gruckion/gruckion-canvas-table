# Canvas Table Documentation

A high-performance, headless React canvas-based table library with TanStack Table API compatibility.

## Overview

Canvas Table is a React library designed to render massive datasets (100M+ cells) using HTML5 Canvas instead of DOM elements. It provides a composable, hook-based API following React best practices.

## Key Features

- **Massive Scale**: Handle millions of rows and columns with consistent 60fps performance
- **Headless Design**: Core logic separated from rendering for maximum flexibility
- **TanStack Compatible**: Familiar API for developers already using TanStack Table
- **Virtualization**: Built-in row and column virtualization
- **Feature Rich**: Selection, reordering, sticky columns/rows, and more
- **TypeScript First**: Full type safety and IntelliSense support
- **Composable**: Mix and match features using React hooks

## Documentation Structure

- [Architecture Overview](./architecture.md) - System design and component layers
- [API Reference](./api-reference.md) - Complete API documentation
- [Component Guide](./component-guide.md) - Component composition patterns
- [Performance Guide](./performance.md) - Optimization strategies
- [Migration Guide](./migration-from-tanstack.md) - Moving from TanStack Table
- [Examples](./examples.md) - Common use cases and patterns

## Quick Start

```tsx
import { useCanvasTable, CanvasTable } from 'canvas-table';

function MyTable() {
  const table = useCanvasTable({
    data,
    columns,
    enableRowSelection: true,
  });

  return <CanvasTable table={table} />;
}
```

## Why Canvas Table?

Traditional DOM-based tables hit performance walls with large datasets:
- DOM manipulation is expensive
- Browser layout/reflow calculations slow down with many elements
- Memory usage grows linearly with cell count

Canvas Table solves these issues by:
- Rendering only visible cells (virtualization)
- Using immediate mode rendering (no DOM reconciliation)
- Optimizing memory with data streaming
- Leveraging GPU acceleration through Canvas API