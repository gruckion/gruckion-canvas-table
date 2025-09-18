import { CanvasTable } from "@/app/_components/canvas-table";
import { RefactoredCanvasTable } from "@/app/_components/refactored-canvas-table";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <main className="w-full h-full space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Original Monolithic Component</h2>
          <p className="text-gray-600">Single component handling everything (175 lines)</p>
          <CanvasTable />
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
