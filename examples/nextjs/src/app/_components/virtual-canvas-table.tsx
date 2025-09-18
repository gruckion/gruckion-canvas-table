'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';

interface VirtualCanvasTableProps {
  rows?: number;
  columns?: number;
  cellWidth?: number;
  cellHeight?: number;
  className?: string;
}

export default function VirtualCanvasTable({
  rows = 10000,
  columns = 100,
  cellWidth = 100,
  cellHeight = 30,
  className = ''
}: VirtualCanvasTableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const totalWidth = columns * cellWidth;
  const totalHeight = rows * cellHeight;

  const renderGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const scrollContainer = scrollRef.current;

    if (!canvas || !container || !scrollContainer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scrollX = scrollContainer.scrollLeft;
    const scrollY = scrollContainer.scrollTop;

    const viewportWidth = container.clientWidth;
    const viewportHeight = container.clientHeight;

    const firstVisibleRow = Math.floor(scrollY / cellHeight);
    const lastVisibleRow = Math.min(
      Math.ceil((scrollY + viewportHeight) / cellHeight),
      rows
    );

    const firstVisibleCol = Math.floor(scrollX / cellWidth);
    const lastVisibleCol = Math.min(
      Math.ceil((scrollX + viewportWidth) / cellWidth),
      columns
    );

    const offsetY = -(scrollY % cellHeight);
    const offsetX = -(scrollX % cellWidth);

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

    for (let row = firstVisibleRow; row <= lastVisibleRow; row++) {
      for (let col = firstVisibleCol; col <= lastVisibleCol; col++) {
        const x = (col - firstVisibleCol) * cellWidth;
        const y = (row - firstVisibleRow) * cellHeight;

        ctx.strokeRect(x, y, cellWidth, cellHeight);

        if (row === 0) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x, y, cellWidth, cellHeight);
          ctx.fillStyle = '#1f2937';
          ctx.fillText(`Col ${col + 1}`, x + cellWidth / 2, y + cellHeight / 2);
        } else if (col === 0) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(x, y, cellWidth, cellHeight);
          ctx.fillStyle = '#1f2937';
          ctx.fillText(`Row ${row}`, x + cellWidth / 2, y + cellHeight / 2);
        } else {
          ctx.fillStyle = '#374151';
          ctx.fillText(`${row},${col}`, x + cellWidth / 2, y + cellHeight / 2);
        }
      }
    }

    ctx.restore();

    const visibleRows = lastVisibleRow - firstVisibleRow;
    const visibleCols = lastVisibleCol - firstVisibleCol;
    ctx.fillStyle = '#10b981';
    ctx.font = '10px monospace';
    ctx.fillText(
      `Rendering: ${visibleRows}×${visibleCols} cells | Viewport: Row ${firstVisibleRow}-${lastVisibleRow}, Col ${firstVisibleCol}-${lastVisibleCol}`,
      10,
      viewportHeight - 10
    );
  }, [rows, columns, cellWidth, cellHeight]);

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
