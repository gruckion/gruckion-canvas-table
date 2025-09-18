import { useRef, useCallback, useReducer, useEffect, useMemo } from 'react';
import { CanvasRenderer } from '../core/canvas-renderer';
import { useViewportRange } from './use-viewport-range';
import type { TableOptions, TableState, TableInstance, ViewportInfo } from '../types';

interface InternalState extends TableState {
  canvas: HTMLCanvasElement | null;
  container: HTMLElement | null;
  scrollContainer: HTMLElement | null;
}

type Action =
  | { type: 'SET_CANVAS'; canvas: HTMLCanvasElement | null }
  | { type: 'SET_CONTAINER'; container: HTMLElement | null }
  | { type: 'SET_SCROLL_CONTAINER'; container: HTMLElement | null }
  | { type: 'UPDATE_VIEWPORT'; viewport: Partial<ViewportInfo> }
  | { type: 'UPDATE_STATE'; state: Partial<TableState> };

function stateReducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case 'SET_CANVAS':
      return { ...state, canvas: action.canvas };
    case 'SET_CONTAINER':
      return { ...state, container: action.container };
    case 'SET_SCROLL_CONTAINER':
      return { ...state, scrollContainer: action.container };
    case 'UPDATE_VIEWPORT':
      return { ...state, ...action.viewport };
    case 'UPDATE_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

export function useCanvasTable<TData = any>(
  options: TableOptions<TData>
): TableInstance<TData> {
  const {
    rowCount = 10000,
    columnCount = 100,
    defaultColumnWidth = 100,
    defaultRowHeight = 30,
    debugMode = false,
  } = options;

  const [state, dispatch] = useReducer(stateReducer, {
    scrollLeft: 0,
    scrollTop: 0,
    viewportWidth: 0,
    viewportHeight: 0,
    canvas: null,
    container: null,
    scrollContainer: null,
  });

  const rendererRef = useRef<CanvasRenderer | undefined>(undefined);
  const animationFrameRef = useRef<number>(0);

  if (!rendererRef.current) {
    rendererRef.current = new CanvasRenderer({
      cellWidth: defaultColumnWidth,
      cellHeight: defaultRowHeight,
      debugMode,
    });
  }

  const viewport: ViewportInfo = {
    scrollX: state.scrollLeft,
    scrollY: state.scrollTop,
    width: state.viewportWidth,
    height: state.viewportHeight,
  };

  const visibleRange = useViewportRange(viewport, {
    totalRows: rowCount,
    totalColumns: columnCount,
    rowHeight: defaultRowHeight,
    columnWidth: defaultColumnWidth,
  });

  const getCellContent = useCallback(
    (row: number, col: number): string => {
      if (row === 0) {
        return `Col ${col + 1}`;
      } else if (col === 0) {
        return `Row ${row}`;
      }
      return `${row},${col}`;
    },
    []
  );

  const render = useCallback(() => {
    if (!state.canvas || !state.container) return;

    const ctx = rendererRef.current!.setupCanvas(
      state.canvas,
      state.viewportWidth,
      state.viewportHeight
    );

    if (!ctx) return;

    rendererRef.current!.clear(ctx, state.viewportWidth, state.viewportHeight);
    rendererRef.current!.renderGrid(ctx, visibleRange, getCellContent);
    rendererRef.current!.renderDebugInfo(ctx, visibleRange, state.viewportHeight);
  }, [
    state.canvas,
    state.container,
    state.viewportWidth,
    state.viewportHeight,
    visibleRange,
    getCellContent,
  ]);

  const updateViewport = useCallback(() => {
    if (!state.container || !state.scrollContainer) return;

    dispatch({
      type: 'UPDATE_STATE',
      state: {
        scrollLeft: state.scrollContainer.scrollLeft,
        scrollTop: state.scrollContainer.scrollTop,
        viewportWidth: state.container.clientWidth,
        viewportHeight: state.container.clientHeight,
      }
    });
  }, [state.container, state.scrollContainer]);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(() => {
      render();
    });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  const setCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    dispatch({ type: 'SET_CANVAS', canvas });
    if (canvas) updateViewport();
  }, [updateViewport]);

  const setContainer = useCallback((container: HTMLElement | null) => {
    dispatch({ type: 'SET_CONTAINER', container });
    if (container) updateViewport();
  }, [updateViewport]);

  const setScrollContainer = useCallback((container: HTMLElement | null) => {
    dispatch({ type: 'SET_SCROLL_CONTAINER', container });
    if (container) updateViewport();
  }, [updateViewport]);

  const destroy = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const instance: TableInstance<TData> = useMemo(
    () => ({
      options,
      state: {
        scrollLeft: state.scrollLeft,
        scrollTop: state.scrollTop,
        viewportWidth: state.viewportWidth,
        viewportHeight: state.viewportHeight,
      },

      getRowCount: () => rowCount,
      getColumnCount: () => columnCount,

      getColumnWidth: () => defaultColumnWidth,
      getRowHeight: () => defaultRowHeight,

      getTotalWidth: () => columnCount * defaultColumnWidth,
      getTotalHeight: () => rowCount * defaultRowHeight,

      setCanvas,
      setContainer,
      setScrollContainer,
      render,
      destroy,
    }),
    [
      options,
      state.scrollLeft,
      state.scrollTop,
      state.viewportWidth,
      state.viewportHeight,
      rowCount,
      columnCount,
      defaultColumnWidth,
      defaultRowHeight,
      setCanvas,
      setContainer,
      setScrollContainer,
      render,
      destroy,
    ]
  );

  return instance;
}
