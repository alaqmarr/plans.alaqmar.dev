"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const codeLines = [
  { text: "$ pnpm create next-app@latest client-portal", type: "command" as const },
  { text: "✓ Initialized Next.js 16 with App Router", type: "success" as const },
  { text: "$ prisma db push --schema ./prisma/schema.prisma", type: "command" as const },
  { text: "⠋ Syncing database schema...", type: "info" as const },
  { text: "✓ Database synchronized successfully", type: "success" as const },
  { text: "$ deploying to production...", type: "command" as const },
  { text: "  → Building optimized production bundle", type: "info" as const },
  { text: "  → Compiling 47 routes (SSG + ISR)", type: "info" as const },
  { text: "  → Generating static pages (47/47)", type: "info" as const },
  { text: "  → Uploading artifacts to edge network", type: "info" as const },
  { text: "✓ Deployed to https://client.alaqmar.dev", type: "success" as const },
  { text: "  → SSL certificate provisioned", type: "info" as const },
  { text: "  → CDN cache invalidated", type: "info" as const },
  { text: "✓ All systems operational — 99.99% uptime", type: "success" as const },
  { text: "$ running performance audit...", type: "command" as const },
  { text: "  → Lighthouse Score: 98/100", type: "success" as const },
  { text: "  → First Contentful Paint: 0.4s", type: "info" as const },
  { text: "  → Time to Interactive: 0.8s", type: "info" as const },
  { text: "✓ Performance audit passed", type: "success" as const },
];

export default function CodeTerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    if (visibleLines >= codeLines.length) {
      // Loop: restart after a pause
      const loopTimer = setTimeout(() => setVisibleLines(0), 4000);
      return () => clearTimeout(loopTimer);
    }
    const timer = setTimeout(() => {
      setVisibleLines((prev) => prev + 1);
    }, codeLines[visibleLines]?.type === "command" ? 600 : 250);
    return () => clearTimeout(timer);
  }, [visibleLines, isInView]);

  // Auto-scroll to bottom when new lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const getLineColor = (type: string) => {
    switch (type) {
      case "command": return "text-emerald-400";
      case "success": return "text-green-400";
      case "info": return "text-zinc-400";
      default: return "text-zinc-500";
    }
  };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="relative py-20 px-4 z-10"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="font-outfit text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-3">Behind The Scenes</p>
          <h3 className="font-outfit text-2xl md:text-3xl font-bold text-white tracking-tight">From Code to Production — In Minutes</h3>
        </motion.div>

        {/* macOS-style terminal */}
        <div className="bg-zinc-900/70 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
          {/* Title bar */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 bg-zinc-900/80 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="font-space text-[11px] text-zinc-500 ml-3 tracking-wider">alaqmar@production ~ /deploy</span>
          </div>

          {/* Terminal body */}
          <div ref={scrollRef} className="p-6 font-mono text-sm leading-relaxed h-[360px] overflow-y-auto custom-scrollbar">
            {codeLines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={`${getLineColor(line.type)} ${line.type === "command" ? "font-bold mt-2" : "ml-0"}`}
              >
                {line.text}
              </motion.div>
            ))}
            {/* Blinking cursor */}
            {visibleLines < codeLines.length && (
              <span className="inline-block w-2.5 h-5 bg-emerald-400 animate-pulse ml-0.5 align-middle"></span>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
