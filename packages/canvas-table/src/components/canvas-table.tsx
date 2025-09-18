'use client';

import React, { useRef, useEffect, useCallback, createContext, useContext } from 'react';
import type { TableInstance } from '../types';

const TableContext = createContext<TableInstance | null>(null);

export function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within CanvasTable');
  }
  return context;
}

export interface CanvasTableProps {
  table: TableInstance;
  height?: number | string;
  width?: number | string;
  className?: string;
  children?: React.ReactNode;
}

export function CanvasTable({
  table,
  height = 600,
  width = '100%',
  className = '',
  children,
}: CanvasTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setContainer, render } = table;

  useEffect(() => {
    if (containerRef.current) {
      setContainer(containerRef.current);
    }

    return () => {
      setContainer(null);
    };
  }, [setContainer]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        render();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  return (
    <TableContext.Provider value={table}>
      <div
        ref={containerRef}
        className={`relative overflow-hidden ${className}`}
        style={{ width, height }}
      >
        {children}
      </div>
    </TableContext.Provider>
  );
}
