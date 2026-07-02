"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const pathname = usePathname();

  // No mostrar el botón en el dashboard
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const phoneNumber = "5493513843463"; // Agrego 549 por si es necesario para Argentina
  const defaultMessage = "Me contacto desde la página web, estoy interesado en hablar con un asesor sobre un producto de su catálogo.";
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  );
}
