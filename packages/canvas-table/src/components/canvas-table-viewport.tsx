'use client';

import React, { useRef, useEffect } from 'react';
import { useTableContext } from './canvas-table';

export interface CanvasTableViewportProps {
  className?: string;
}

export function CanvasTableViewport({ className = '' }: CanvasTableViewportProps) {
  const table = useTableContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setCanvas } = table;

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }

    return () => {
      setCanvas(null);
    };
  }, [setCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 pointer-events-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
