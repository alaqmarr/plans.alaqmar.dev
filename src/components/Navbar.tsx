"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Rocket } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Don't show public navbar on admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/setup")) return null;

  const links = [
    { name: "Home", href: "/" },
    { name: "Custom Plan", href: "/custom-plan" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-zinc-950/70 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Rocket size={20} />
            </div>
            <span className="font-space text-2xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-indigo-400 transition-all">
              Alaqmar
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md shadow-inner shadow-white/5">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`font-outfit text-xs font-bold uppercase tracking-[0.15em] px-4 py-2 rounded-xl transition-all relative group ${
                    pathname === link.href ? "text-white bg-white/10" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <Link 
              href="#contact"
              className="font-outfit px-6 py-2.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 hover:text-white hover:border-indigo-400/50 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:-translate-y-0.5"
            >
              Get in Touch
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-xl pt-24 px-4 hidden max-md:block"
          >
            <div className="flex flex-col gap-6 text-center text-3xl font-outfit font-bold tracking-tight">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${pathname === link.href ? "text-indigo-400" : "text-zinc-400"}`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-8 px-8 py-4 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-300 hover:text-white mx-auto shadow-[0_0_30px_rgba(99,102,241,0.2)] text-lg uppercase tracking-widest"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
