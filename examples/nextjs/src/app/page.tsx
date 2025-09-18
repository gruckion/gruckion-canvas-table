'use client';

import { useMemo } from "react";
import { CanvasTable } from "@/app/_components/canvas-table";
import { ImprovedCanvasTable } from "@/app/_components/improved-canvas-table";
import { RefactoredCanvasTable } from "@/app/_components/refactored-canvas-table";

export default function Home() {
  // Generate test data with 10000 rows and 100 columns
  const data = useMemo(() =>
    Array.from({ length: 10000 }, (_, rowIndex) => {
      const row: Record<string, any> = {};
      for (let colIndex = 0; colIndex < 100; colIndex++) {
        row[`col${colIndex}`] = `${rowIndex + 1},${colIndex + 1}`;
      }
      return row;
    })
    , []);

  // Generate column definitions
  const columns = useMemo(() =>
    Array.from({ length: 100 }, (_, colIndex) => ({
      id: `col${colIndex}`,
      header: colIndex === 0 ? 'Row' : `Col ${colIndex + 1}`,
      accessorKey: `col${colIndex}`,
      // Special formatting for first column to show row numbers
      cell: colIndex === 0
        ? ({ row }: any) => {
          const rowIndex = data.indexOf(row);
          return `Row ${rowIndex + 1}`;
        }
        : undefined
    }))
    , [data]);

  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <main className="w-full h-full space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Original Monolithic Component</h2>
          <p className="text-gray-600">Single component handling everything (175 lines)</p>
          <CanvasTable />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Improved Canvas Table</h2>
          <p className="text-gray-600">Takes data & columns props, maintains original performance</p>
          <ImprovedCanvasTable data={data} columns={columns} />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Refactored Architecture</h2>
          <p className="text-gray-600">Composable components with separation of concerns</p>
          <RefactoredCanvasTable debugMode={true} />
        </div>
      </main>
    </div>
  );
}
