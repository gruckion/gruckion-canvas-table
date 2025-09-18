# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root package
```bash
# Install dependencies
pnpm install
```

### NextJS Example Application
```bash
# Navigate to NextJS example
cd examples/nextjs

# Install dependencies
pnpm install

# Run development server with Turbopack
pnpm dev

# Build production bundle with Turbopack
pnpm build

# Start production server
pnpm start
```

## Architecture Overview

This repository contains a high-performance canvas-based data grid implementation demonstrating virtualization techniques for rendering large datasets.

### Key Components

**Canvas Table Component** (`examples/nextjs/src/app/_components/canvas-table.tsx`):
- React component implementing a virtualized data grid using HTML Canvas
- Handles 100,000 rows × 20 columns efficiently through row/column virtualization
- Custom hooks for canvas management, resize handling, and performance optimization
- Implements virtual scrolling with on-demand data loading

### Technical Implementation Details

The canvas table uses several performance optimization strategies:

1. **Virtualization**: Only renders visible rows and columns, calculating viewport boundaries based on scroll position
2. **Async Data Loading**: Uses a `RowProvider` pattern with caching for efficient data fetching
3. **Device Pixel Ratio Handling**: Properly scales canvas for high-DPI displays
4. **RAF-based Rendering**: Uses `requestAnimationFrame` for smooth updates during scrolling

### TypeScript Configuration

- Strict mode enabled
- Module resolution: bundler
- Target: ES2017
- Path alias: `@/*` maps to `./src/*`

### Stack

- **Framework**: Next.js 15.5.3 with React 19.1.0
- **Build Tool**: Turbopack
- **Styling**: Tailwind CSS v4
- **UI Utilities**: clsx, tailwind-merge, class-variance-authority
- **Package Manager**: pnpm 10.12.2