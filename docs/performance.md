# Performance Optimization Guide

Strategies and techniques for achieving maximum performance with Canvas Table when rendering millions of cells.

## Performance Goals

Canvas Table is designed to handle:
- **100M+ cells** (10,000+ rows × 10,000+ columns)
- **60 FPS** smooth scrolling
- **< 100ms** initial render
- **< 16ms** frame time during interactions
- **< 200MB** memory footprint for 1M visible cells

## Core Optimizations

### 1. Virtualization

Only render visible cells plus a small overscan buffer:

```typescript
// Calculate visible range
const visibleRange = {
  rowStart: Math.floor(scrollTop / rowHeight),
  rowEnd: Math.ceil((scrollTop + viewportHeight) / rowHeight),
  colStart: Math.floor(scrollLeft / colWidth),
  colEnd: Math.ceil((scrollLeft + viewportWidth) / colWidth),
};

// Add overscan for smooth scrolling
const overscan = 5;
const renderRange = {
  rowStart: Math.max(0, visibleRange.rowStart - overscan),
  rowEnd: Math.min(totalRows, visibleRange.rowEnd + overscan),
  colStart: Math.max(0, visibleRange.colStart - overscan),
  colEnd: Math.min(totalCols, visibleRange.colEnd + overscan),
};
```

### 2. Canvas Layer System

Separate static and dynamic content into layers:

```typescript
class LayerManager {
  private layers: Map<string, OffscreenCanvas> = new Map();

  addLayer(id: string, zIndex: number) {
    const canvas = new OffscreenCanvas(width, height);
    this.layers.set(id, { canvas, zIndex, dirty: true });
  }

  render(mainCtx: CanvasRenderingContext2D) {
    // Render only dirty layers
    for (const [id, layer] of this.layers) {
      if (layer.dirty) {
        this.renderLayer(layer);
        layer.dirty = false;
      }
      mainCtx.drawImage(layer.canvas, 0, 0);
    }
  }
}

// Usage
const layers = new LayerManager();
layers.addLayer('grid', 0);      // Static grid lines
layers.addLayer('data', 1);      // Cell data
layers.addLayer('selection', 2); // Selection overlay
layers.addLayer('hover', 3);     // Hover effects
```

### 3. Dirty Rectangle Tracking

Only redraw changed regions:

```typescript
class DirtyRectManager {
  private dirtyRects: Set<DirtyRect> = new Set();

  markDirty(rect: DirtyRect) {
    this.dirtyRects.add(rect);
  }

  render(ctx: CanvasRenderingContext2D) {
    // Merge overlapping rectangles
    const merged = this.mergeRects(this.dirtyRects);

    for (const rect of merged) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rect.x, rect.y, rect.width, rect.height);
      ctx.clip();

      // Render only the dirty region
      this.renderCells(ctx, rect);

      ctx.restore();
    }

    this.dirtyRects.clear();
  }

  private mergeRects(rects: Set<DirtyRect>): DirtyRect[] {
    // Algorithm to merge overlapping rectangles
    // Returns optimized set of non-overlapping rectangles
  }
}
```

### 4. Request Animation Frame Optimization

Batch updates and maintain 60 FPS:

```typescript
class RenderScheduler {
  private frameId: number | null = null;
  private tasks: Set<() => void> = new Set();
  private lastFrameTime = 0;
  private targetFPS = 60;
  private frameInterval = 1000 / this.targetFPS;

  schedule(task: () => void) {
    this.tasks.add(task);

    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private tick = (currentTime: number) => {
    const deltaTime = currentTime - this.lastFrameTime;

    if (deltaTime >= this.frameInterval) {
      // Execute all pending tasks
      for (const task of this.tasks) {
        task();
      }
      this.tasks.clear();
      this.lastFrameTime = currentTime;
    }

    if (this.tasks.size > 0) {
      this.frameId = requestAnimationFrame(this.tick);
    } else {
      this.frameId = null;
    }
  };
}
```

### 5. Web Workers for Heavy Computation

Offload expensive operations to workers:

```typescript
// main.ts
class TableWorkerManager {
  private worker: Worker;
  private offscreenCanvas: OffscreenCanvas;

  constructor(canvas: HTMLCanvasElement) {
    this.worker = new Worker('table.worker.js');
    this.offscreenCanvas = canvas.transferControlToOffscreen();

    this.worker.postMessage({
      type: 'init',
      canvas: this.offscreenCanvas,
    }, [this.offscreenCanvas]);
  }

  updateData(data: ArrayBuffer) {
    this.worker.postMessage({
      type: 'updateData',
      data,
    }, [data]);
  }
}

// table.worker.ts
self.addEventListener('message', (e) => {
  const { type, data } = e.data;

  switch (type) {
    case 'init':
      initCanvas(data.canvas);
      break;
    case 'updateData':
      renderData(data);
      break;
  }
});

function renderData(data: ArrayBuffer) {
  // Perform heavy rendering in worker
  const view = new Float32Array(data);
  // ... render cells
}
```

## Memory Optimization

### 1. Data Virtualization

Load and unload data chunks dynamically:

```typescript
class VirtualDataManager<T> {
  private cache = new LRUCache<number, T[]>(100); // Cache 100 chunks
  private chunkSize = 1000;

  async getRows(start: number, end: number): Promise<T[]> {
    const chunks = this.getRequiredChunks(start, end);
    const rows: T[] = [];

    for (const chunkIndex of chunks) {
      let chunk = this.cache.get(chunkIndex);

      if (!chunk) {
        chunk = await this.fetchChunk(chunkIndex);
        this.cache.set(chunkIndex, chunk);
      }

      rows.push(...chunk);
    }

    return rows.slice(start % this.chunkSize, end % this.chunkSize);
  }

  private getRequiredChunks(start: number, end: number): number[] {
    const startChunk = Math.floor(start / this.chunkSize);
    const endChunk = Math.floor(end / this.chunkSize);
    return Array.from({ length: endChunk - startChunk + 1 },
                      (_, i) => startChunk + i);
  }
}
```

### 2. Object Pooling

Reuse objects to reduce garbage collection:

```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// Usage
const cellPool = new ObjectPool(
  () => ({ x: 0, y: 0, width: 0, height: 0, value: '' }),
  (cell) => { cell.value = ''; }
);
```

### 3. SharedArrayBuffer for Large Datasets

Share memory between workers:

```typescript
class SharedDataTable {
  private buffer: SharedArrayBuffer;
  private view: Float32Array;
  private metadata: Int32Array;

  constructor(rows: number, cols: number) {
    const dataSize = rows * cols * 4; // 4 bytes per float
    const metadataSize = 1024; // Metadata space

    this.buffer = new SharedArrayBuffer(dataSize + metadataSize);
    this.view = new Float32Array(this.buffer, 0, rows * cols);
    this.metadata = new Int32Array(this.buffer, dataSize, metadataSize / 4);
  }

  setValue(row: number, col: number, value: number) {
    const index = row * this.cols + col;
    Atomics.store(this.view, index, value);
  }

  getValue(row: number, col: number): number {
    const index = row * this.cols + col;
    return Atomics.load(this.view, index);
  }
}
```

## Rendering Optimizations

### 1. Batch Canvas Operations

Minimize state changes and draw calls:

```typescript
class BatchRenderer {
  private commands: RenderCommand[] = [];

  addRect(x: number, y: number, width: number, height: number, style: string) {
    this.commands.push({ type: 'rect', x, y, width, height, style });
  }

  addText(text: string, x: number, y: number, style: TextStyle) {
    this.commands.push({ type: 'text', text, x, y, style });
  }

  flush(ctx: CanvasRenderingContext2D) {
    // Group by style to minimize state changes
    const grouped = this.groupByStyle(this.commands);

    for (const [style, commands] of grouped) {
      this.applyStyle(ctx, style);

      for (const cmd of commands) {
        switch (cmd.type) {
          case 'rect':
            ctx.fillRect(cmd.x, cmd.y, cmd.width, cmd.height);
            break;
          case 'text':
            ctx.fillText(cmd.text, cmd.x, cmd.y);
            break;
        }
      }
    }

    this.commands = [];
  }
}
```

### 2. Text Rendering Cache

Cache rendered text as images:

```typescript
class TextCache {
  private cache = new Map<string, ImageBitmap>();
  private offscreen = new OffscreenCanvas(200, 50);
  private ctx = this.offscreen.getContext('2d')!;

  async getText(text: string, font: string): Promise<ImageBitmap> {
    const key = `${text}:${font}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Render text to offscreen canvas
    this.ctx.clearRect(0, 0, 200, 50);
    this.ctx.font = font;
    this.ctx.fillText(text, 0, 25);

    // Create bitmap
    const bitmap = await createImageBitmap(this.offscreen);
    this.cache.set(key, bitmap);

    return bitmap;
  }

  clear() {
    for (const bitmap of this.cache.values()) {
      bitmap.close();
    }
    this.cache.clear();
  }
}
```

### 3. GPU Acceleration

Leverage WebGL for massive datasets:

```typescript
class WebGLRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private buffers: {
    position: WebGLBuffer;
    color: WebGLBuffer;
  };

  render(cells: Cell[]) {
    const positions: number[] = [];
    const colors: number[] = [];

    for (const cell of cells) {
      // Convert cell to vertex data
      positions.push(
        cell.x, cell.y,
        cell.x + cell.width, cell.y,
        cell.x, cell.y + cell.height,
        cell.x + cell.width, cell.y + cell.height
      );

      const color = this.getColorForValue(cell.value);
      colors.push(...color, ...color, ...color, ...color);
    }

    // Upload to GPU
    this.updateBuffer(this.buffers.position, positions);
    this.updateBuffer(this.buffers.color, colors);

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, cells.length * 4);
  }
}
```

## Scroll Performance

### 1. Scroll Debouncing

Prevent excessive renders during scrolling:

```typescript
class ScrollManager {
  private scrollRAF: number | null = null;
  private isScrolling = false;
  private scrollEndTimer: NodeJS.Timeout | null = null;

  handleScroll = (event: Event) => {
    if (!this.isScrolling) {
      this.onScrollStart();
    }

    // Cancel previous frame
    if (this.scrollRAF) {
      cancelAnimationFrame(this.scrollRAF);
    }

    // Schedule render
    this.scrollRAF = requestAnimationFrame(() => {
      this.render();
      this.scrollRAF = null;
    });

    // Detect scroll end
    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }

    this.scrollEndTimer = setTimeout(() => {
      this.onScrollEnd();
    }, 150);
  };

  private onScrollStart() {
    this.isScrolling = true;
    // Reduce render quality for performance
    this.setRenderQuality('low');
  }

  private onScrollEnd() {
    this.isScrolling = false;
    // Restore full quality
    this.setRenderQuality('high');
    // Render final frame
    this.renderHighQuality();
  }
}
```

### 2. Momentum Scrolling

Implement smooth momentum scrolling:

```typescript
class MomentumScroller {
  private velocity = { x: 0, y: 0 };
  private lastPosition = { x: 0, y: 0 };
  private friction = 0.95;
  private threshold = 0.5;

  startMomentum(initialVelocity: Point) {
    this.velocity = initialVelocity;
    this.animate();
  }

  private animate = () => {
    // Apply friction
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    // Stop if below threshold
    if (Math.abs(this.velocity.x) < this.threshold &&
        Math.abs(this.velocity.y) < this.threshold) {
      return;
    }

    // Update position
    this.scrollTo(
      this.lastPosition.x + this.velocity.x,
      this.lastPosition.y + this.velocity.y
    );

    requestAnimationFrame(this.animate);
  };
}
```

## Profiling and Monitoring

### 1. Performance Metrics

Track key performance indicators:

```typescript
class PerformanceMonitor {
  private metrics = {
    fps: 0,
    frameTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    visibleCells: 0,
  };

  private frames: number[] = [];
  private lastTime = performance.now();

  startFrame() {
    this.frameStart = performance.now();
  }

  endFrame() {
    const now = performance.now();
    const frameTime = now - this.frameStart;
    const deltaTime = now - this.lastTime;

    this.frames.push(frameTime);

    // Keep last 60 frames
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    // Calculate metrics
    this.metrics.fps = 1000 / deltaTime;
    this.metrics.frameTime = frameTime;
    this.metrics.renderTime = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;

    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }

    this.lastTime = now;
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

### 2. Debug Overlay

Visual performance debugging:

```typescript
class DebugOverlay {
  render(ctx: CanvasRenderingContext2D, metrics: PerformanceMetrics) {
    ctx.save();

    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 100);

    // Performance text
    ctx.fillStyle = this.getFPSColor(metrics.fps);
    ctx.font = '12px monospace';
    ctx.fillText(`FPS: ${metrics.fps.toFixed(1)}`, 20, 30);
    ctx.fillText(`Frame: ${metrics.frameTime.toFixed(2)}ms`, 20, 45);
    ctx.fillText(`Cells: ${metrics.visibleCells}`, 20, 60);
    ctx.fillText(`Memory: ${(metrics.memoryUsage / 1048576).toFixed(1)}MB`, 20, 75);

    // Draw performance graph
    this.drawGraph(ctx, this.fpsHistory, 20, 85, 180, 20);

    ctx.restore();
  }

  private getFPSColor(fps: number): string {
    if (fps >= 55) return '#00ff00';
    if (fps >= 30) return '#ffff00';
    return '#ff0000';
  }
}
```

## Best Practices

### 1. Use Production Build

Always use production builds for performance testing:

```json
{
  "scripts": {
    "build:prod": "NODE_ENV=production webpack --mode production",
    "analyze": "webpack-bundle-analyzer"
  }
}
```

### 2. Lazy Load Features

Load features only when needed:

```typescript
// Lazy load heavy features
const loadAdvancedFeatures = async () => {
  const { AdvancedFilters, DataExporter, ChartRenderer } = await import('./features');

  return {
    filters: new AdvancedFilters(),
    exporter: new DataExporter(),
    charts: new ChartRenderer(),
  };
};
```

### 3. Optimize Bundle Size

Tree-shake unused code:

```typescript
// ❌ Avoid: Importing entire library
import * as utils from './utils';

// ✅ Prefer: Import specific functions
import { debounce, throttle } from './utils';
```

### 4. Profile Regular

Set up automated performance testing:

```typescript
describe('Performance Tests', () => {
  it('maintains 60fps with 10k visible cells', async () => {
    const table = createTable({ rows: 10000, cols: 100 });
    const monitor = new PerformanceMonitor();

    // Simulate scrolling
    for (let i = 0; i < 100; i++) {
      table.scrollTo(i * 100, i * 30);
      await waitForFrame();
      monitor.measure();
    }

    const metrics = monitor.getAverageMetrics();
    expect(metrics.fps).toBeGreaterThan(55);
    expect(metrics.frameTime).toBeLessThan(17);
  });
});
```