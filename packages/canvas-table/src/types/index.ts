export interface TableOptions<TData = any> {
  data?: TData[];
  columns?: ColumnDef<TData>[];

  rowCount?: number;
  columnCount?: number;

  defaultColumnWidth?: number;
  defaultRowHeight?: number;

  enableVirtualization?: boolean;
  overscan?: number;

  debugMode?: boolean;
}

export interface ColumnDef<TData = any> {
  id: string;
  header?: string | ((context: HeaderContext) => string);
  cell?: (context: CellContext<TData>) => string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

export interface TableState {
  scrollLeft: number;
  scrollTop: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface TableInstance<TData = any> {
  options: TableOptions<TData>;
  state: TableState;

  getRowCount(): number;
  getColumnCount(): number;

  getColumnWidth(index: number): number;
  getRowHeight(index: number): number;

  getTotalWidth(): number;
  getTotalHeight(): number;

  setCanvas(canvas: HTMLCanvasElement | null): void;
  setContainer(container: HTMLElement | null): void;
  setScrollContainer(container: HTMLElement | null): void;

  render(): void;
  destroy(): void;
}

export interface ViewportInfo {
  scrollX: number;
  scrollY: number;
  width: number;
  height: number;
}

export interface VisibleRange {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
  offsetX: number;
  offsetY: number;
}

export interface CellContext<TData = any> {
  row: number;
  column: number;
  value?: TData;
}

export interface HeaderContext {
  column: number;
}

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  viewport: ViewportInfo;
  visibleRange: VisibleRange;
  cellWidth: number;
  cellHeight: number;
}