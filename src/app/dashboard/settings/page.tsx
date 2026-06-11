import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-8 w-8 text-yellow-500" />
            Configuración
          </h1>
          <p className="text-zinc-400 mt-1">Ajustes del sistema y preferencias de usuario.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-white mb-2">Sección en construcción</h3>
        <p className="text-zinc-500">Próximamente podrás configurar el sistema desde aquí.</p>
      </div>
    </div>
  );
}
