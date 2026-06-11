import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-yellow-500" />
            Clientes
          </h1>
          <p className="text-zinc-400 mt-1">Base de datos de compradores e interesados.</p>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded-md transition-colors">
          + Nuevo Cliente
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-white mb-2">Sección en construcción</h3>
        <p className="text-zinc-500">Próximamente podrás ver aquí tu lista de clientes.</p>
      </div>
    </div>
  );
}
