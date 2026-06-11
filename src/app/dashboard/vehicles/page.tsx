import { Car } from "lucide-react";

export default function VehiclesPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Car className="h-8 w-8 text-yellow-500" />
            Vehículos
          </h1>
          <p className="text-zinc-400 mt-1">Gestioná el inventario de Rodmell Automotores.</p>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-md transition-colors">
          + Agregar Vehículo
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-white mb-2">No hay vehículos registrados</h3>
        <p className="text-zinc-500 mb-6">Comenzá agregando tu primer vehículo al stock.</p>
        <button className="bg-[#111] hover:bg-[#222] border border-[#333] text-white font-medium py-2 px-4 rounded-md transition-colors">
          Agregar desde catálogo
        </button>
      </div>
    </div>
  );
}
