"use client";

import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { usePathname } from "next/navigation";

export default function WhatsAppFloat({ whatsappNumber }: { whatsappNumber?: string }) {
  const pathname = usePathname();

  if (!whatsappNumber) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/setup")) return null;

  const num = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-110 active:scale-95 cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      <WhatsAppIcon size={24} />
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
    </a>
  );
}
