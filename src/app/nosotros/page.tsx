import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      <PublicHeader />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Nuestra <span className="text-yellow-500">Historia</span></h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-10 text-left">
            En Rodmell Automotores, nuestra pasión por los vehículos de alta gama nos impulsó a crear un espacio donde la excelencia y la transparencia son la norma. Fundada con la visión de revolucionar el mercado de autos premium, nos dedicamos a curar una selección de unidades que cumplen con los estándares internacionales más exigentes.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222]">
              <h3 className="text-2xl font-bold text-white mb-4">Misión</h3>
              <p className="text-zinc-400">Brindar una experiencia de compra inigualable, asegurando que cada cliente encuentre el vehículo perfecto que se adapte a su estilo de vida, con la máxima seguridad legal y mecánica.</p>
            </div>
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222]">
              <h3 className="text-2xl font-bold text-white mb-4">Visión</h3>
              <p className="text-zinc-400">Ser el concesionario boutique referente en el país para vehículos de lujo, estableciendo el estándar de calidad, atención al detalle y servicio post-venta.</p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
