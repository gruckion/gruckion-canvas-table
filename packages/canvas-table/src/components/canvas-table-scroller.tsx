'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { useTableContext } from './canvas-table';

export interface CanvasTableScrollerProps {
  className?: string;
}

export function CanvasTableScroller({ className = '' }: CanvasTableScrollerProps) {
  const table = useTableContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const { setScrollContainer, setContainer, render, getTotalWidth, getTotalHeight } = table;

  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (scrollRef.current) {
        const container = scrollRef.current.parentElement;
        if (container) {
          setContainer(container);
        }
        render();
      }
    });
  }, [setContainer, render]);

  useEffect(() => {
    if (scrollRef.current) {
      setScrollContainer(scrollRef.current);
    }

    return () => {
      setScrollContainer(null);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [setScrollContainer]);

  const totalWidth = getTotalWidth();
  const totalHeight = getTotalHeight();

  return (
    <div
      ref={scrollRef}
      className={`absolute inset-0 overflow-auto ${className}`}
      onScroll={handleScroll}
    >
      <div
        style={{
          width: `${totalWidth}px`,
          height: `${totalHeight}px`,
          position: 'relative',
        }}
      />
    </div>
  );
}