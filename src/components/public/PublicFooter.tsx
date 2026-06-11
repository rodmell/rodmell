import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#222] bg-black py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <Image src="/logo.png" alt="Rodmell Logo" width={120} height={40} className="object-contain opacity-50 hover:opacity-100 transition-opacity" />
        <p className="text-zinc-600 text-sm">© {new Date().getFullYear()} Rodmell Automotores. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
