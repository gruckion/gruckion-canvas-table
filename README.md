# Canvas Table

A high-performance React canvas-based table library with virtualization, built as a monorepo.

## Project Structure

This is a pnpm workspace monorepo containing:

```
├── packages/
│   └── canvas-table/        # Core library package
│       ├── src/             # Source code
│       │   ├── components/  # React components
│       │   ├── hooks/       # React hooks
│       │   ├── core/        # Core rendering logic
│       │   └── types/       # TypeScript types
│       └── dist/           # Built output
│
├── examples/
│   └── nextjs/            # Next.js example application
│
└── docs/                  # Documentation
```

## Quick Start

### Development

1. Install dependencies:
```bash
pnpm install
```

2. Build the library:
```bash
cd packages/canvas-table
pnpm build
```

3. Run the example:
```bash
cd examples/nextjs
pnpm dev
```

### Library Development

The library uses tsup for building:

```bash
cd packages/canvas-table
pnpm dev    # Watch mode
pnpm build  # Production build
```

## Architecture

The library follows a **headless, composable architecture** with clear separation of concerns:

### Core Components

- **`useCanvasTable`**: Main hook for table instance creation
- **`useVirtualization`**: Handles viewport calculations and virtualization
- **`CanvasRenderer`**: Encapsulates all canvas drawing operations

### Component Composition

Instead of a monolithic component, the library provides composable pieces:

```tsx
<CanvasTable table={table}>
  <CanvasTableViewport />   // Canvas element
  <CanvasTableScroller />   // Scroll container
</CanvasTable>
```

### File Naming Convention

All files use **kebab-case** naming:
- `use-canvas-table.ts`
- `canvas-renderer.ts`
- `canvas-table-viewport.tsx`

## Features

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

## Contributing

Contributions are welcome! Please read the documentation in `/docs` to understand the architecture before contributing.

## License

MIT