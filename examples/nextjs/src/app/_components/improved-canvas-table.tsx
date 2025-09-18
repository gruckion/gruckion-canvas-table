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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scrollX = scrollContainer.scrollLeft;
    const scrollY = scrollContainer.scrollTop;

    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    const firstVisibleRow = Math.floor(scrollY / defaultRowHeight);
    const lastVisibleRow = Math.min(
      Math.ceil((scrollY + viewportHeight) / defaultRowHeight),
      totalRows
    );

    const firstVisibleCol = Math.floor(scrollX / defaultColumnWidth);
    const lastVisibleCol = Math.min(
      Math.ceil((scrollX + viewportWidth) / defaultColumnWidth),
      totalColumns
    );

    const offsetY = -(scrollY % defaultRowHeight);
    const offsetX = -(scrollX % defaultColumnWidth);

    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewportWidth * dpr;
    canvas.height = viewportHeight * dpr;
    canvas.style.width = `${viewportWidth}px`;
    canvas.style.height = `${viewportHeight}px`;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.strokeStyle = '#e5e7eb';
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Main rendering loop with inline data access
    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
      for (let col = firstVisibleCol; col <= lastVisibleCol; col++) {
        const x = (col - firstVisibleCol) * defaultColumnWidth;
        const y = (row - firstVisibleRow) * defaultRowHeight;

        ctx.strokeRect(x, y, defaultColumnWidth, defaultRowHeight);

        // Row 0 = headers
        if (row === 0) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x, y, defaultColumnWidth, defaultRowHeight);
          ctx.fillStyle = '#1f2937';
          const header = columns[col]?.header || `Col ${col + 1}`;
          ctx.fillText(header, x + defaultColumnWidth / 2, y + defaultRowHeight / 2);
        } else if (col === 0) {
          // First column - grey background with row numbers
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x, y, defaultColumnWidth, defaultRowHeight);
          ctx.fillStyle = '#1f2937';
          ctx.fillText(`Row ${row}`, x + defaultColumnWidth / 2, y + defaultRowHeight / 2);
        } else {
          // Data cells - direct array access
          const dataRowIndex = row - 1; // -1 because row 0 is header
          const dataRow = data[dataRowIndex];

          if (dataRow && columns[col]) {
            const column = columns[col];
            let value = '';

            // Inline accessor logic - no function call overhead
            if (column.accessorKey) {
              value = String(dataRow[column.accessorKey] ?? '');
            } else if (column.accessorFn) {
              // Only call function if absolutely necessary
              value = String(column.accessorFn(dataRow) ?? '');
            }

            // Optional cell formatter
            if (column.cell && value !== '') {
              value = column.cell({ value, row: dataRow });
            }

            ctx.fillStyle = '#374151';
            ctx.fillText(value, x + defaultColumnWidth / 2, y + defaultRowHeight / 2);
          }
        }
      }
    }

    ctx.restore();

    // Debug info
    const visibleRows = lastVisibleRow - firstVisibleRow;
    const visibleCols = lastVisibleCol - firstVisibleCol;
    ctx.fillStyle = '#10b981';
    ctx.font = '10px monospace';
    ctx.fillText(
      `Improved: ${visibleRows}×${visibleCols} cells | Viewport: Row ${firstVisibleRow}-${lastVisibleRow}, Col ${firstVisibleCol}-${lastVisibleCol} | Data: ${data.length}×${columns.length}`,
      10,
      viewportHeight - 10
    );
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