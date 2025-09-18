'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';

interface ColumnDef<TData = any> {
  id: string;
  header: string;
  accessorKey?: string;
  accessorFn?: (row: TData) => any;
  cell?: (info: { value: any; row: TData }) => string;
}

interface ImprovedCanvasTableProps<TData = any> {
  data: TData[];
  columns: ColumnDef<TData>[];
  defaultColumnWidth?: number;
  defaultRowHeight?: number;
  className?: string;
}

interface ViewportBounds {
  firstRow: number;
  lastRow: number;
  firstCol: number;
  lastCol: number;
  offsetX: number;
  offsetY: number;
}

// Pure function to setup canvas with device pixel ratio
function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
  }
  return ctx;
}

// Pure function to calculate viewport bounds
function calculateViewport(
  scrollX: number,
  scrollY: number,
  viewportWidth: number,
  viewportHeight: number,
  totalRows: number,
  totalColumns: number,
  cellWidth: number,
  cellHeight: number
): ViewportBounds {
  return {
    firstRow: Math.floor(scrollY / cellHeight),
    lastRow: Math.min(
      Math.ceil((scrollY + viewportHeight) / cellHeight),
      totalRows
    ),
    firstCol: Math.floor(scrollX / cellWidth),
    lastCol: Math.min(
      Math.ceil((scrollX + viewportWidth) / cellWidth),
      totalColumns
    ),
    offsetX: -(scrollX % cellWidth),
    offsetY: -(scrollY % cellHeight)
  };
}

// Inline function for cell rendering - kept simple for performance
function renderCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  content: string,
  isHeader: boolean
) {
  ctx.strokeRect(x, y, width, height);

  if (isHeader) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#1f2937';
  } else {
    ctx.fillStyle = '#374151';
  }

  ctx.fillText(content, x + width / 2, y + height / 2);
}

// Function to resolve cell content
function getCellContent<TData extends Record<string, any>>(
  row: number,
  col: number,
  data: TData[],
  columns: ColumnDef<TData>[]
): string {
  // Header row
  if (row === 0) {
    return columns[col]?.header || `Col ${col + 1}`;
  }

  // Row headers (first column)
  if (col === 0) {
    return `Row ${row}`;
  }

  // Data cells
  const dataRowIndex = row - 1; // -1 because row 0 is header
  const dataRow = data[dataRowIndex];
  const column = columns[col];

  if (!dataRow || !column) return '';

  // Extract raw value
  const rawValue = column.accessorKey
    ? String(dataRow[column.accessorKey] ?? '')
    : column.accessorFn
      ? String(column.accessorFn(dataRow) ?? '')
      : '';

  // Apply optional cell formatter
  return column.cell && rawValue !== ''
    ? column.cell({ value: rawValue, row: dataRow })
    : rawValue;
}

// Function to render debug info
function renderDebugInfo(
  ctx: CanvasRenderingContext2D,
  bounds: ViewportBounds,
  viewportHeight: number,
  dataRows: number,
  columnCount: number
) {
  const visibleRows = bounds.lastRow - bounds.firstRow;
  const visibleCols = bounds.lastCol - bounds.firstCol;

  ctx.fillStyle = '#10b981';
  ctx.font = '10px monospace';
  ctx.fillText(
    `Improved: ${visibleRows}×${visibleCols} cells | Viewport: Row ${bounds.firstRow}-${bounds.lastRow}, Col ${bounds.firstCol}-${bounds.lastCol} | Data: ${dataRows}×${columnCount}`,
    10,
    viewportHeight - 10
  );
}

export function ImprovedCanvasTable<TData extends Record<string, any> = any>({
  data,
  columns,
  defaultColumnWidth = 100,
  defaultRowHeight = 30,
  className = ''
}: ImprovedCanvasTableProps<TData>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Computed values
  const totalRows = data.length + 1; // +1 for header row
  const totalColumns = columns.length;
  const totalWidth = totalColumns * defaultColumnWidth;
  const totalHeight = totalRows * defaultRowHeight;

  const renderGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const scrollContainer = scrollRef.current;

    if (!canvas || !container || !scrollContainer) return;

    // Artificial delay to simulate expensive rendering
    const start = performance.now();
    while (performance.now() - start < 100) {
      // Busy wait for 100ms
    }

    const scrollX = scrollContainer.scrollLeft;
    const scrollY = scrollContainer.scrollTop;
    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    // Calculate viewport bounds
    const bounds = calculateViewport(
      scrollX,
      scrollY,
      viewportWidth,
      viewportHeight,
      totalRows,
      totalColumns,
      defaultColumnWidth,
      defaultRowHeight
    );

    // Setup canvas with DPR
    const ctx = setupCanvas(canvas, viewportWidth, viewportHeight);
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // Setup rendering context
    ctx.save();
    ctx.translate(bounds.offsetX, bounds.offsetY);

    // Set default styles once
    ctx.strokeStyle = '#e5e7eb';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Main rendering loop - still inline for performance
    for (let row = bounds.firstRow; row <= bounds.lastRow; row++) {
      for (let col = bounds.firstCol; col <= bounds.lastCol; col++) {
        const x = (col - bounds.firstCol) * defaultColumnWidth;
        const y = (row - bounds.firstRow) * defaultRowHeight;

        // Get content and determine if it's a header
        const content = getCellContent(row, col, data, columns);
        const isHeader = row === 0 || col === 0;

        // Render the cell
        renderCell(ctx, x, y, defaultColumnWidth, defaultRowHeight, content, isHeader);
      }
    }

    ctx.restore();

    // Render debug info
    renderDebugInfo(ctx, bounds, viewportHeight, data.length, columns.length);
  }, [data, columns, defaultColumnWidth, defaultRowHeight, totalRows, totalColumns]);

  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      renderGrid();
    });
  }, [renderGrid]);

  useEffect(() => {
    const handleResize = () => {
      renderGrid();
    };

    window.addEventListener('resize', handleResize);
    renderGrid();
    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [renderGrid]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width: '100%', height: '600px' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ imageRendering: 'pixelated' }}
      />
      {!isInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white">Initializing grid...</div>
        </div>
      )}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-auto"
        onScroll={handleScroll}
      >
        <div
          style={{
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
            position: 'relative'
          }}
        />
      </div>
    </div>
  );
}
