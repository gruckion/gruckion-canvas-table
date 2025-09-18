import VirtualCanvasTable from "@/app/_components/virtual-canvas-table";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 sm:p-20">
      <main className="w-full h-full space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Virtual Canvas Table (100 columns × 10,000 rows)</h2>
          <VirtualCanvasTable />
        </div>
      </main>
    </div>
  );
}
