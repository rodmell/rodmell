import Image from "next/image";
import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#222] bg-black/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="Rodmell Logo" width={140} height={45} className="object-contain" priority />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">Inicio</Link>
          <Link href="/catalogo" className="text-zinc-400 hover:text-white transition-colors hover:text-yellow-500">Catálogo</Link>
          <Link href="/nosotros" className="text-zinc-400 hover:text-white transition-colors">Nosotros</Link>
          <Link href="/contacto" className="text-zinc-400 hover:text-white transition-colors">Contacto</Link>
        </nav>
        {/* Mobile menu could go here */}
        <div className="md:hidden">
          {/* Menu icon placeholder */}
          <div className="w-8 h-8 rounded-md bg-[#111] flex items-center justify-center border border-[#333]">
            <span className="text-white">☰</span>
          </div>
        </div>
      </div>
    </header>
  );
}
