import type { RenderContext, VisibleRange } from '../types';

export interface RendererOptions {
  cellWidth: number;
  cellHeight: number;
  headerBgColor?: string;
  headerTextColor?: string;
  cellTextColor?: string;
  gridLineColor?: string;
  debugMode?: boolean;
}

export class CanvasRenderer {
  private options: RendererOptions;
  private dpr: number;

  constructor(options: RendererOptions) {
    this.options = {
      headerBgColor: '#f3f4f6',
      headerTextColor: '#1f2937',
      cellTextColor: '#374151',
      gridLineColor: '#e5e7eb',
      debugMode: false,
      ...options,
    };
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }

  setupCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number
  ): CanvasRenderingContext2D | null {
    canvas.width = width * this.dpr;
    canvas.height = height * this.dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(this.dpr, this.dpr);
    return ctx;
  }

  clear(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.clearRect(0, 0, width, height);
  }

  renderCell(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    content: string,
    isHeader = false
  ) {
    ctx.strokeStyle = this.options.gridLineColor!;
    ctx.strokeRect(x, y, width, height);

    if (isHeader) {
      ctx.fillStyle = this.options.headerBgColor!;
      ctx.fillRect(x, y, width, height);
      ctx.fillStyle = this.options.headerTextColor!;
    } else {
      ctx.fillStyle = this.options.cellTextColor!;
    }

    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(content, x + width / 2, y + height / 2);
  }

  renderGrid(
    ctx: CanvasRenderingContext2D,
    visibleRange: VisibleRange,
    getCellContent: (row: number, col: number) => string
  ) {
    const { cellWidth, cellHeight } = this.options;

    // Artificial delay to simulate expensive rendering
    const start = performance.now();
    while (performance.now() - start < 100) {
      // Busy wait for 100ms
    }

    ctx.save();
    ctx.translate(visibleRange.offsetX, visibleRange.offsetY);

    for (let row = visibleRange.rowStart; row <= visibleRange.rowEnd; row++) {
      for (let col = visibleRange.columnStart; col <= visibleRange.columnEnd; col++) {
        const x = (col - visibleRange.columnStart) * cellWidth;
        const y = (row - visibleRange.rowStart) * cellHeight;

        const content = getCellContent(row, col);
        const isHeader = row === 0 || col === 0;

        this.renderCell(ctx, x, y, cellWidth, cellHeight, content, isHeader);
      }
    }

    ctx.restore();
  }

  renderDebugInfo(
    ctx: CanvasRenderingContext2D,
    visibleRange: VisibleRange,
    viewportHeight: number
  ) {
    if (!this.options.debugMode) return;

    const visibleRows = visibleRange.rowEnd - visibleRange.rowStart + 1;
    const visibleCols = visibleRange.columnEnd - visibleRange.columnStart + 1;

    ctx.fillStyle = '#10b981';
    ctx.font = '10px monospace';
    ctx.fillText(
      `Rendering: ${visibleRows}×${visibleCols} cells | Rows: ${visibleRange.rowStart}-${visibleRange.rowEnd}, Cols: ${visibleRange.columnStart}-${visibleRange.columnEnd}`,
      10,
      viewportHeight - 10
    );
  }
}
