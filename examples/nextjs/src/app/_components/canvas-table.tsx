"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState, RefObject } from "react";

/**
 * 
 * @param seed 
 * @returns 
 */
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

type GridSize = { width: number; height: number };
type Column = { id: string; title: string; width: number };
type Cell = { text: string };

type RowProvider = (start: number, endExclusive: number) => Promise<Cell[][]>;

/**
 * 
 * @param columns 
 * @param wordList 
 * @returns 
 */
function createDemoProvider(columns: Column[], wordList: string[]): RowProvider {
  const pageCache = new Map<string, Cell[][]>();

  return async (start: number, endExclusive: number) => {
    const key = `${start}-${endExclusive}`;
    const cached = pageCache.get(key);
    if (cached) return cached;

    const count = endExclusive - start;
    const rows: Cell[][] = new Array(count);
    for (let r = 0; r < count; r++) {
      const rowIndex = start + r;
      const rng = createRng(rowIndex + 13);
      const row: Cell[] = new Array(columns.length);
      for (let c = 0; c < columns.length; c++) {
        const w1 = wordList[Math.floor(rng() * wordList.length)];
        const w2 = wordList[Math.floor(rng() * wordList.length)];
        row[c] = { text: `R${rowIndex + 1} ${columns[c].title} ${w1} ${w2}` };
      }
      rows[r] = row;
    }

    pageCache.set(key, rows);
    return rows;
  };
}

/**
 * 
 * @returns 
 */
function useDevicePixelRatio() {
  const [scale, setScale] = useState(() => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1));
  useEffect(() => {
    const handler = () => setScale(window.devicePixelRatio || 1);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return scale;
}

/**
 * 
 * @param columns 
 * @returns 
 */
function useColumnOffsets(columns: Column[]) {
  return useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (const col of columns) {
      offsets.push(acc);
      acc += col.width;
    }
    return { offsets, totalWidth: acc };
  }, [columns]);
}

/**
 * 
 * @param canvasRef 
 * @param containerRef 
 * @param deviceScale 
 * @param draw 
 */
function useCanvasResize(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  deviceScale: number,
  draw: (ctx: CanvasRenderingContext2D, size: GridSize) => void
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const applySize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * deviceScale));
      canvas.height = Math.max(1, Math.floor(rect.height * deviceScale));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) draw(ctx, { width: rect.width, height: rect.height });
    };

    const ro = new ResizeObserver(applySize);
    ro.observe(container);
    applySize();
    return () => ro.disconnect();
  }, [canvasRef, containerRef, deviceScale, draw]);
}

/**
 * 
 * @returns 
 */
function useRaf() {
  const rafId = useRef<number | null>(null);
  const frame = (fn: () => void) => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      fn();
    });
  };
  useEffect(() => () => {
    if (rafId.current != null) cancelAnimationFrame(rafId.current);
  }, []);
  return frame;
}

/**
 * 
 * @param columnOffsets 
 * @param columns 
 * @param viewLeft 
 * @param viewRight 
 * @returns 
 */
function measureVisibleColumns(columnOffsets: number[], columns: Column[], viewLeft: number, viewRight: number) {
  let first = 0;
  while (first < columns.length && columnOffsets[first] + columns[first].width < viewLeft) first++;
  let last = first;
  while (last < columns.length && columnOffsets[last] < viewRight) last++;
  return { first, last };
}

/**
 * 
 * @param value 
 * @param min 
 * @param max 
 * @returns 
 */
function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 
 * @returns 
 */
export default function CanvasDataGrid() {
  const rowCount = 100_000;
  const columnCount = 20;
  const rowHeight = 28;
  const headerHeight = 34;
  const fontFamily = "12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

  const columns = useMemo<Column[]>(() => {
    const cols: Column[] = [];
    for (let i = 0; i < columnCount; i++) {
      const width = 110 + ((i * 37) % 90); // varied but readable
      cols.push({ id: `c${i}`, title: `Col ${i + 1}`, width });
    }
    return cols;
  }, []);

  const { offsets: columnOffsets, totalWidth } = useColumnOffsets(columns);
  const totalHeight = headerHeight + rowCount * rowHeight;

  const words = useMemo(
    () =>
      [
        "alpha",
        "bravo",
        "charlie",
        "delta",
        "echo",
        "foxtrot",
        "golf",
        "hotel",
        "india",
        "juliet",
        "kilo",
        "lima",
        "mike",
        "november",
        "oscar",
        "papa",
        "quebec",
        "romeo",
        "sierra",
        "tango",
        "uniform",
        "victor",
        "whiskey",
        "xray",
        "yankee",
        "zulu",
      ],
    []
  );

  const getRows = useMemo(() => createDemoProvider(columns, words), [columns, words]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const deviceScale = useDevicePixelRatio();
  const raf = useRaf();

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, size: GridSize) => {
      const viewLeft = scrollLeft;
      const viewTop = scrollTop;
      const viewRight = viewLeft + size.width;
      const viewBottom = viewTop + size.height;

      ctx.save();
      ctx.scale(deviceScale, deviceScale);
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.textBaseline = "middle";
      ctx.font = fontFamily;

      // Header background
      ctx.fillStyle = "#f6f7f9";
      ctx.fillRect(0, 0, size.width, headerHeight - (viewTop > 0 ? 0 : 0));

      const visibleCols = measureVisibleColumns(columnOffsets, columns, viewLeft, viewRight);

      // Header
      ctx.fillStyle = "#111";
      for (let c = visibleCols.first; c < visibleCols.last; c++) {
        const x = columnOffsets[c] - viewLeft;
        const col = columns[c];
        ctx.fillText(col.title, x + 8, headerHeight / 2);
        ctx.beginPath();
        ctx.moveTo(x + col.width - 0.5, 0);
        ctx.lineTo(x + col.width - 0.5, headerHeight);
        ctx.strokeStyle = "#ddd";
        ctx.stroke();
      }

      // Rows
      const firstRowIndex = clamp(Math.floor((viewTop - headerHeight) / rowHeight), 0, rowCount - 1);
      const lastRowIndex = clamp(Math.floor((viewBottom - headerHeight) / rowHeight), 0, rowCount - 1);

      if (firstRowIndex <= lastRowIndex) {
        getRows(firstRowIndex, lastRowIndex + 1).then((page) => {
          raf(() => {
            // Get fresh container dimensions and scroll position
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const currentScrollLeft = container.scrollLeft;
            const currentScrollTop = container.scrollTop;
            const currentWidth = rect.width;
            const currentHeight = rect.height;

            // Recalculate visible columns with current scroll position
            const currentViewLeft = currentScrollLeft;
            const currentViewRight = currentScrollLeft + currentWidth;
            const currentVisibleCols = measureVisibleColumns(columnOffsets, columns, currentViewLeft, currentViewRight);

            // Clear the row area first
            ctx.save();
            ctx.scale(deviceScale, deviceScale);
            ctx.clearRect(0, headerHeight, currentWidth, currentHeight - headerHeight);
            ctx.textBaseline = "middle";
            ctx.font = fontFamily;

            for (let r = firstRowIndex; r <= lastRowIndex; r++) {
              const y = headerHeight + r * rowHeight - currentScrollTop;
              const isEven = r % 2 === 0;
              ctx.fillStyle = isEven ? "#ffffff" : "#fbfbfc";
              ctx.fillRect(0, y, currentWidth, rowHeight);

              ctx.beginPath();
              ctx.moveTo(0, y + rowHeight - 0.5);
              ctx.lineTo(currentWidth, y + rowHeight - 0.5);
              ctx.strokeStyle = "#eee";
              ctx.stroke();

              const row = page[r - firstRowIndex];
              ctx.fillStyle = "#222";
              for (let c = currentVisibleCols.first; c < currentVisibleCols.last; c++) {
                const col = columns[c];
                const x = columnOffsets[c] - currentScrollLeft;
                const text = row[c]?.text ?? "";
                ctx.save();
                ctx.beginPath();
                ctx.rect(x + 4, y, col.width - 8, rowHeight);
                ctx.clip();
                ctx.fillText(text, x + 8, y + rowHeight / 2);
                ctx.restore();
              }
            }

            for (let c = currentVisibleCols.first; c < currentVisibleCols.last; c++) {
              const x = columnOffsets[c] + columns[c].width - 0.5 - currentScrollLeft;
              ctx.beginPath();
              ctx.moveTo(x, headerHeight);
              ctx.lineTo(x, currentHeight);
              ctx.strokeStyle = "#f0f0f0";
              ctx.stroke();
            }

            ctx.restore();
          });
        });
      }

      ctx.restore();
    },
    [columns, columnOffsets, rowCount, rowHeight, headerHeight, totalWidth, deviceScale, fontFamily, getRows, scrollLeft, scrollTop, raf, containerRef, measureVisibleColumns]
  );

  useCanvasResize(canvasRef, containerRef, deviceScale, draw);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = container.getBoundingClientRect();
    draw(ctx, { width: rect.width, height: rect.height });
  }, [scrollLeft, scrollTop, draw]);

  return (
    <div className="w-full h-full min-h-[520px] flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between">
        <div className="font-medium">Canvas DataGrid Demo</div>
        <div className="text-xs opacity-70">{rowCount.toLocaleString()} rows × {columns.length} columns</div>
      </div>
      <div
        ref={containerRef}
        className="relative w-full h-[480px] overflow-auto rounded-xl border border-gray-200 bg-white"
        onScroll={(e) => {
          const el = e.currentTarget;
          setScrollLeft(el.scrollLeft);
          setScrollTop(el.scrollTop);
        }}
      >
        <div style={{ width: totalWidth, height: totalHeight }} />
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
      </div>
      <div className="text-xs text-gray-500">
        Scroll horizontally and vertically. The grid virtualizes rows and columns and draws to a single HTML canvas.
      </div>
    </div>
  );
}
