'use client';

import React from 'react';
import {
  useCanvasTable,
  CanvasTable,
  CanvasTableViewport,
  CanvasTableScroller,
} from '@gruckion/canvas-table';

export interface RefactoredCanvasTableProps {
  rows?: number;
  columns?: number;
  cellWidth?: number;
  cellHeight?: number;
  className?: string;
  debugMode?: boolean;
}

export function RefactoredCanvasTable({
  rows = 10000,
  columns = 100,
  cellWidth = 100,
  cellHeight = 30,
  className = '',
  debugMode = true,
}: RefactoredCanvasTableProps) {
  const table = useCanvasTable({
    rowCount: rows,
    columnCount: columns,
    defaultColumnWidth: cellWidth,
    defaultRowHeight: cellHeight,
    debugMode,
  });

  return (
    <CanvasTable table={table} className={className} height={600}>
      <CanvasTableViewport />
      <CanvasTableScroller />
    </CanvasTable>
  );
}
