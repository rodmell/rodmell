import Image from "next/image";
import { Car, Fuel, Gauge, Settings2, CalendarDays } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import prisma from "@/lib/prisma";

export default async function CatalogoPage() {
  const vehiclesData = await prisma.vehiculo.findMany({
    where: { estado: "DISPONIBLE" },
    orderBy: { createdAt: "desc" }
  });

  // Default images for fallback if no photos were uploaded
  const defaultImages = [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503376760367-1b61b4fa0323?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80"
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-600/15 via-black to-black -z-10" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            Descubrí tu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">Vehículo</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Catálogo exclusivo de unidades premium seleccionadas rigurosamente. Calidad, diseño y potencia a tu alcance.
          </p>
          
          {/* Futuristic Search/Filter Bar */}
          <div className="max-w-4xl mx-auto bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222] rounded-full p-2 flex items-center shadow-[0_0_30px_rgba(234,179,8,0.05)]">
            <div className="flex-1 px-6 border-r border-[#222] hidden md:block">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Marca</p>
              <select className="w-full bg-transparent text-white outline-none font-semibold cursor-pointer appearance-none">
                <option value="" className="bg-[#111] text-white">Todas las marcas</option>
                <option value="audi" className="bg-[#111] text-white">Audi</option>
                <option value="bmw" className="bg-[#111] text-white">BMW</option>
                <option value="mercedes" className="bg-[#111] text-white">Mercedes-Benz</option>
              </select>
            </div>
            <div className="flex-1 px-6 border-r border-[#222] hidden md:block">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Precio Max</p>
              <select className="w-full bg-transparent text-white outline-none font-semibold cursor-pointer appearance-none">
                <option value="" className="bg-[#111] text-white">Sin Límite</option>
                <option value="50000" className="bg-[#111] text-white">Hasta $50,000</option>
                <option value="100000" className="bg-[#111] text-white">Hasta $100,000</option>
              </select>
            </div>
            <div className="px-2 w-full md:w-auto">
              <button className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-full transition-all hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo Grid */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Car className="h-6 w-6 text-yellow-500" />
            Stock Disponible
          </h2>
          <span className="text-zinc-400 text-sm font-medium">{vehiclesData.length} vehículos encontrados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehiclesData.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <p className="text-zinc-500 text-xl font-medium">No hay vehículos disponibles en este momento.</p>
            </div>
          ) : (
            vehiclesData.map((vehiculo, index) => (
              <div key={vehiculo.id} className="group bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#222] hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-yellow-500/10">
                <div className="relative h-64 overflow-hidden bg-[#111]">
                  <div className="absolute top-4 right-4 z-10">
                    {index < 2 && (
                      <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Destacado
                      </span>
                    )}
                  </div>
                  <Image
                    src={(vehiculo.fotos && vehiculo.fotos.length > 0) ? vehiculo.fotos[0] : defaultImages[index % defaultImages.length]}
                    alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                </div>
                
                <div className="p-6 relative">
                  <div className="absolute -top-6 right-6 bg-[#0a0a0a] p-3 rounded-xl border border-[#222] shadow-lg">
                    <Car className="h-6 w-6 text-yellow-500" />
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-yellow-500 transition-colors">
                      {vehiculo.marca} {vehiculo.modelo}
                    </h3>
                    <p className="text-zinc-400 font-medium">{vehiculo.dominio}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-zinc-300">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-yellow-500/70" />
                      <span>{vehiculo.anio}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-yellow-500/70" />
                      <span>{vehiculo.kilometros?.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-yellow-500/70" />
                      <span>Nafta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-yellow-500/70" />
                      <span>Automática</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#222] flex justify-between items-end">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Precio</p>
                      <p className="text-2xl font-bold text-white">${vehiculo.precioVenta.toLocaleString()}</p>
                    </div>
                    <button className="bg-transparent hover:bg-yellow-500 hover:text-black text-yellow-500 border border-yellow-500 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300">
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
