import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Users, DollarSign, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Bienvenido de vuelta, {session?.user?.name || "Administrador"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#0a0a0a] border-[#222] hover:border-yellow-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Vehículos en Stock
            </CardTitle>
            <Car className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">124</div>
            <p className="text-xs text-zinc-500 mt-1">
              +4 agregados este mes
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0a0a0a] border-[#222] hover:border-yellow-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Ventas del Mes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$145,000</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#222] hover:border-yellow-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Nuevos Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+48</div>
            <p className="text-xs text-zinc-500 mt-1">
              +18% en los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0a0a0a] border-[#222] hover:border-yellow-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Actividad Reciente
            </CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Alta</div>
            <p className="text-xs text-zinc-500 mt-1">
              12 acciones en la última hora
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <Card className="col-span-4 bg-[#0a0a0a] border-[#222]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Últimos Vehículos Agregados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full rounded-md border border-[#333] border-dashed flex items-center justify-center bg-[#111]">
              <span className="text-sm text-zinc-500">Tabla de vehículos (Próximamente)</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-[#0a0a0a] border-[#222]">
          <CardHeader>
            <CardTitle className="text-lg text-white">Actividad del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-zinc-200">
                      Usuario admin se conectó
                    </p>
                    <p className="text-xs text-zinc-500">
                      Hace {i * 10} minutos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
