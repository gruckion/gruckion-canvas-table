import type { ViewportInfo, VisibleRange } from '../types';

export interface ViewportRangeOptions {
  totalRows: number;
  totalColumns: number;
  rowHeight: number | ((index: number) => number);
  columnWidth: number | ((index: number) => number);
}

export function useViewportRange(
  viewport: ViewportInfo,
  options: ViewportRangeOptions
) {
  const { totalRows, totalColumns, rowHeight, columnWidth } = options;

  const defaultRowHeight = typeof rowHeight === 'number' ? rowHeight : 30;
  const defaultColumnWidth = typeof columnWidth === 'number' ? columnWidth : 100;

  const firstVisibleRow = Math.floor(viewport.scrollY / defaultRowHeight);
  const lastVisibleRow = Math.ceil((viewport.scrollY + viewport.height) / defaultRowHeight);

  const firstVisibleColumn = Math.floor(viewport.scrollX / defaultColumnWidth);
  const lastVisibleColumn = Math.ceil((viewport.scrollX + viewport.width) / defaultColumnWidth);

  const rowStart = firstVisibleRow;
  const rowEnd = Math.min(totalRows - 1, lastVisibleRow);

  const columnStart = firstVisibleColumn;
  const columnEnd = Math.min(totalColumns - 1, lastVisibleColumn);

  const offsetY = -(viewport.scrollY % defaultRowHeight);
  const offsetX = -(viewport.scrollX % defaultColumnWidth);

  const visibleRange: VisibleRange = {
    rowStart,
    rowEnd,
    columnStart,
    columnEnd,
    offsetX,
    offsetY,
  };

  return visibleRange;
}
