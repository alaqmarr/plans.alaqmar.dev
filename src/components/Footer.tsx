"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Rocket } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";

export default function Footer({ contactEmail, whatsappNumber }: { contactEmail?: string, whatsappNumber?: string }) {
  const pathname = usePathname();

  // Don't show public footer on admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/setup")) return null;

  return (
    <footer className="relative bg-zinc-950 border-t border-white/5 pt-20 pb-10 text-zinc-400 overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[80vw] max-w-[1000px] h-[200px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 relative z-10">
            <Link href="/" className="flex items-center gap-2 mb-6 text-white group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Rocket size={16} />
              </div>
              <span className="font-space text-2xl font-bold tracking-tight">THE WEB SENSEI</span>
            </Link>
            <p className="font-outfit max-w-md text-zinc-400 mb-8 leading-relaxed">
              Crafting super modern, highly functional, and fully custom web solutions tailored to elevate your business and wow your clients.
            </p>
            <div className="flex gap-4">
              {whatsappNumber && (
                <a 
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-zinc-900/50 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 flex items-center justify-center transition-all border border-zinc-800 hover:border-emerald-500/30 shadow-lg"
                >
                  <WhatsAppIcon size={18} />
                </a>
              )}
              {contactEmail && (
                <a 
                  href={`mailto:${contactEmail}`}
                  className="w-10 h-10 rounded-lg bg-zinc-900/50 hover:bg-blue-500/10 text-zinc-400 hover:text-blue-400 flex items-center justify-center transition-all border border-zinc-800 hover:border-blue-500/30 shadow-lg"
                >
                  <Mail size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="relative z-10">
            <h4 className="font-outfit text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-6">Quick Links</h4>
            <ul className="space-y-4 font-outfit text-sm">
              <li><Link href="/" className="text-zinc-400 hover:text-white transition-colors">Development Plans</Link></li>
              <li><Link href="/custom-plan" className="text-zinc-400 hover:text-white transition-colors">Custom Plan Creator</Link></li>
              <li><Link href="/admin/login" className="text-zinc-500 hover:text-zinc-300 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="relative z-10">
            <h4 className="font-outfit text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-6">Contact</h4>
            <ul className="space-y-4 font-outfit text-sm text-zinc-400">
              {whatsappNumber && <li>{whatsappNumber}</li>}
              {contactEmail && <li>{contactEmail}</li>}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-outfit text-zinc-500 relative z-10">
          <p>© {new Date().getFullYear()} THE WEB SENSEI. All rights reserved.</p>
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-zinc-300 transition-colors">Return & Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
