"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  item: { id: string; name: string; price: number; isOneTime?: boolean };
  quantity: number;
}

interface CostBreakdownChartProps {
  cart: CartItem[];
  tenure: number;
  totalAmount: number;
}

const COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function CostBreakdownChart({ cart, tenure, totalAmount }: CostBreakdownChartProps) {
  const segments = useMemo(() => {
    // For chart purposes, treat ₹0 items as ₹1 so they still get a visible slice
    const chartTotal = cart.reduce((sum, ci) => {
      const base = Math.max(ci.item.price, 1) * ci.quantity;
      return sum + (ci.item.isOneTime ? base : base * tenure);
    }, 0);
    if (chartTotal === 0) return [];
    let cumulativePercent = 0;
    return cart.map((cartItem, i) => {
      const base = Math.max(cartItem.item.price, 1) * cartItem.quantity;
      const chartValue = cartItem.item.isOneTime ? base : base * tenure;
      const percent = (chartValue / chartTotal) * 100;
      const offset = cumulativePercent;
      cumulativePercent += percent;
      return {
        name: cartItem.item.name + (cartItem.item.isOneTime ? " ⚡" : ""),
        value: cartItem.item.price * cartItem.quantity * (cartItem.item.isOneTime ? 1 : tenure),
        percent,
        offset,
        color: COLORS[i % COLORS.length],
      };
    });
  }, [cart, tenure, totalAmount]);

  if (cart.length === 0) return null;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="mt-6 pt-6 border-t border-white/5">
      <p className="font-outfit text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-5">Cost Breakdown</p>
      
      {/* Chart + Legend — stacked vertically */}
      <div className="flex flex-col items-center gap-5">
        {/* SVG Doughnut */}
        <div className="relative w-[130px] h-[130px] shrink-0">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
            {segments.map((seg, i) => (
              <motion.circle
                key={`${seg.name}-${i}`}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{
                  strokeDasharray: `${(seg.percent / 100) * circumference - 3} ${circumference - (seg.percent / 100) * circumference + 3}`,
                  strokeDashoffset: -(seg.offset / 100) * circumference,
                }}
                transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.1 }}
                style={{ filter: `drop-shadow(0 0 6px ${seg.color}40)` }}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-space text-lg font-extrabold text-white">{cart.length}</span>
            <span className="font-outfit text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Items</span>
          </div>
        </div>

        {/* Legend — full width grid */}
        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
          {segments.map((seg, i) => (
            <motion.div
              key={`legend-${i}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 min-w-0"
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color, boxShadow: `0 0 8px ${seg.color}60` }} />
              <span className="font-outfit text-[10px] text-zinc-400 truncate flex-1">{seg.name}</span>
              <span className="font-space text-[10px] text-zinc-500 shrink-0 font-bold">{Math.round(seg.percent)}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Compact accordion version for homepage pricing cards
export function PlanBreakdownChart({ features, tenureYears }: { features: any[]; tenureYears: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const includedFeatures = features.filter((pf: any) => pf.isIncluded);
  
  if (includedFeatures.length === 0) return null;

  // For chart purposes, treat ₹0 features as ₹1 so they get a visible slice
  const chartTotal = includedFeatures.reduce((sum: number, pf: any) => {
    const fp = Math.max(pf.feature?.price || 0, 1);
    return sum + (pf.feature?.isOneTime ? fp : fp * (tenureYears || 1));
  }, 0);
  if (chartTotal === 0) return null;

  let cumulativePercent = 0;
  const segments = includedFeatures.map((pf: any, i: number) => {
    const fp = Math.max(pf.feature?.price || 0, 1);
    const chartValue = pf.feature?.isOneTime ? fp : fp * (tenureYears || 1);
    const percent = (chartValue / chartTotal) * 100;
    const offset = cumulativePercent;
    cumulativePercent += percent;
    return {
      name: (pf.feature?.name || "Feature") + (pf.feature?.isOneTime ? " ⚡" : ""),
      percent,
      offset,
      color: COLORS[i % COLORS.length],
    };
  });

  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="pt-4 pb-4 mb-2 border-t border-zinc-800/50 relative z-10">
      {/* Accordion trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="w-full flex items-center justify-between py-2 group cursor-pointer"
      >
        <span className="font-outfit text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">Feature Cost Split</span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
        >
          <polyline points="6 9 12 15 18 9" />
        </motion.svg>
      </button>

      {/* Accordion content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-4 pt-3 pb-2">
              {/* Mini Doughnut */}
              <div className="relative w-[72px] h-[72px] shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  {segments.map((seg, i) => (
                    <motion.circle
                      key={i}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="12"
                      initial={{ strokeDasharray: `0 ${circumference}` }}
                      animate={{
                        strokeDasharray: `${(seg.percent / 100) * circumference - 2} ${circumference - (seg.percent / 100) * circumference + 2}`,
                        strokeDashoffset: -(seg.offset / 100) * circumference,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 4px ${seg.color}30)` }}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-space text-xs font-extrabold text-white">{includedFeatures.length}</span>
                </div>
              </div>

              {/* Compact Legend */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                {segments.slice(0, 5).map((seg, i) => (
                  <div key={i} className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="font-outfit text-[9px] text-zinc-500 truncate flex-1">{seg.name}</span>
                    <span className="font-space text-[9px] text-zinc-600 shrink-0 font-bold">{Math.round(seg.percent)}%</span>
                  </div>
                ))}
                {segments.length > 5 && (
                  <span className="font-outfit text-[9px] text-zinc-600 italic">+{segments.length - 5} more</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
