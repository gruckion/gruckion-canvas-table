import { useMemo } from 'react';
import type { ViewportInfo, VisibleRange } from '../types';

export interface VirtualizationOptions {
  totalRows: number;
  totalColumns: number;
  rowHeight: number | ((index: number) => number);
  columnWidth: number | ((index: number) => number);
  overscan?: number;
}

export function useVirtualization(
  viewport: ViewportInfo,
  options: VirtualizationOptions
) {
  const { totalRows, totalColumns, rowHeight, columnWidth, overscan = 3 } = options;

  const visibleRange = useMemo((): VisibleRange => {
    const getRowHeight = typeof rowHeight === 'function' ? rowHeight : () => rowHeight;
    const getColumnWidth = typeof columnWidth === 'function' ? columnWidth : () => columnWidth;

    const defaultRowHeight = typeof rowHeight === 'number' ? rowHeight : 30;
    const defaultColumnWidth = typeof columnWidth === 'number' ? columnWidth : 100;

    const firstVisibleRow = Math.floor(viewport.scrollY / defaultRowHeight);
    const lastVisibleRow = Math.ceil((viewport.scrollY + viewport.height) / defaultRowHeight);

    const firstVisibleColumn = Math.floor(viewport.scrollX / defaultColumnWidth);
    const lastVisibleColumn = Math.ceil((viewport.scrollX + viewport.width) / defaultColumnWidth);

    const rowStart = Math.max(0, firstVisibleRow - overscan);
    const rowEnd = Math.min(totalRows - 1, lastVisibleRow + overscan);

    const columnStart = Math.max(0, firstVisibleColumn - overscan);
    const columnEnd = Math.min(totalColumns - 1, lastVisibleColumn + overscan);

    const offsetY = -(viewport.scrollY % defaultRowHeight);
    const offsetX = -(viewport.scrollX % defaultColumnWidth);

    return {
      rowStart,
      rowEnd,
      columnStart,
      columnEnd,
      offsetX,
      offsetY,
    };
  }, [
    viewport.scrollX,
    viewport.scrollY,
    viewport.width,
    viewport.height,
    totalRows,
    totalColumns,
    rowHeight,
    columnWidth,
    overscan,
  ]);

  return visibleRange;
}
