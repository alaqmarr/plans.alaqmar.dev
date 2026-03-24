"use client";

import { motion } from "framer-motion";

const techStack = [
  { name: "React", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },
  { name: "TypeScript", icon: "TS" },
  { name: "Node.js", icon: "⬢" },
  { name: "Prisma", icon: "◆" },
  { name: "Tailwind", icon: "🌊" },
  { name: "PostgreSQL", icon: "🐘" },
  { name: "Redis", icon: "◉" },
  { name: "Docker", icon: "🐳" },
  { name: "AWS", icon: "☁️" },
  { name: "Stripe", icon: "💳" },
  { name: "GraphQL", icon: "◈" },
  { name: "Framer Motion", icon: "✦" },
  { name: "Figma", icon: "🎨" },
];

export default function TechMarquee() {
  // Duplicate the array for seamless looping
  const items = [...techStack, ...techStack];

  return (
    <section className="relative py-20 overflow-hidden z-10 border-y border-white/5">
      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <p className="font-outfit text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-3">Powered By</p>
        <h3 className="font-outfit text-2xl md:text-3xl font-bold text-white tracking-tight">Our Technology Arsenal</h3>
      </motion.div>

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>

      {/* Marquee Row 1 */}
      <div className="group mb-6">
        <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused]">
          {items.map((tech, i) => (
            <div
              key={`row1-${i}`}
              className="flex items-center gap-3 px-6 py-4 bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-2xl shrink-0 hover:border-indigo-500/30 hover:bg-indigo-950/30 transition-all duration-300 hover:-translate-y-1 cursor-default group/card min-w-[180px]"
            >
              <span className="text-2xl group-hover/card:scale-125 transition-transform duration-300">{tech.icon}</span>
              <span className="font-outfit font-bold text-zinc-300 text-sm tracking-wide whitespace-nowrap group-hover/card:text-white transition-colors">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Row 2 — reversed */}
      <div className="group">
        <div className="flex gap-4 animate-marquee-reverse group-hover:[animation-play-state:paused]">
          {[...items].reverse().map((tech, i) => (
            <div
              key={`row2-${i}`}
              className="flex items-center gap-3 px-6 py-4 bg-zinc-900/60 backdrop-blur-md border border-white/5 rounded-2xl shrink-0 hover:border-purple-500/30 hover:bg-purple-950/30 transition-all duration-300 hover:-translate-y-1 cursor-default group/card min-w-[180px]"
            >
              <span className="text-2xl group-hover/card:scale-125 transition-transform duration-300">{tech.icon}</span>
              <span className="font-outfit font-bold text-zinc-300 text-sm tracking-wide whitespace-nowrap group-hover/card:text-white transition-colors">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
