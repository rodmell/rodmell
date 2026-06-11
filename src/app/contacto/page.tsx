import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
      <PublicHeader />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Ponte en <span className="text-yellow-500">Contacto</span></h1>
            <p className="text-zinc-400 text-lg">Nuestro equipo de asesores está listo para ayudarte a encontrar tu próximo vehículo.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Info */}
            <div className="space-y-8">
              <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222] flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-yellow-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Showroom Principal</h3>
                  <p className="text-zinc-400">Av. Libertador 1234, Ciudad de Buenos Aires<br/>Argentina</p>
                </div>
              </div>
              <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222] flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center flex-shrink-0">
                  <Phone className="text-yellow-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Línea Directa</h3>
                  <p className="text-zinc-400">+54 11 4444-5555<br/>Lunes a Viernes de 9 a 19 hs.</p>
                </div>
              </div>
              <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222] flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#111] border border-[#333] flex items-center justify-center flex-shrink-0">
                  <Mail className="text-yellow-500 w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Correo Electrónico</h3>
                  <p className="text-zinc-400">ventas@rodmell.com<br/>info@rodmell.com</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#222]">
              <h3 className="text-2xl font-bold text-white mb-6">Envianos tu consulta</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Nombre Completo</label>
                  <input type="text" className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="Ej: Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Correo Electrónico</label>
                  <input type="email" className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="juan@ejemplo.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Mensaje</label>
                  <textarea rows={4} className="w-full bg-[#111] border border-[#333] rounded-md px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="Estoy interesado en el vehículo..."></textarea>
                </div>
                <button type="button" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-md transition-all mt-4">
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
