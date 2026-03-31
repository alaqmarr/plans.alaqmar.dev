"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowUp, Download } from "lucide-react";
import { exportReactElementToPdf } from "@/lib/pdfGenerator";
import PrintableComparison from "@/components/pdf/PrintableComparison";

export default function PlanComparison({ plans }: { plans: any[] }) {
  // Get all unique features across all plans
  const allFeatures = useMemo(() => {
    const featureMap = new Map<string, { id: string; name: string; upgradedById?: string | null }>();
    plans.forEach((plan) => {
      plan.features.forEach((pf: any) => {
        if (pf.feature && !featureMap.has(pf.feature.id)) {
          featureMap.set(pf.feature.id, {
            id: pf.feature.id,
            name: pf.feature.name,
            upgradedById: pf.feature.upgradedById || null,
          });
        }
      });
    });
    return Array.from(featureMap.values());
  }, [plans]);

  // Build a set of feature IDs that are the "upgraded version" of another feature
  const upgradeTargetIds = useMemo(() => {
    return new Set(allFeatures.map(f => f.upgradedById).filter(Boolean) as string[]);
  }, [allFeatures]);

  if (plans.length < 2 || allFeatures.length === 0) return null;

  // Helper: check if a plan includes a specific feature
  const planHasFeature = (plan: any, featureId: string) => {
    return plan.features.some((f: any) => f.feature?.id === featureId && f.isIncluded);
  };

  return (
    <section className="relative py-24 px-4 z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="font-outfit text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-3">Compare</p>
          <h2 className="font-outfit text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">Plan Comparison</h2>
          <p className="font-outfit text-zinc-400 text-lg max-w-xl mx-auto">See exactly what's included in each plan at a glance.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/30"
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[600px]">
              {/* Header */}
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-5 px-6 font-outfit text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] w-[35%] bg-zinc-950/30 sticky left-0 z-10 backdrop-blur-md">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className={`py-5 px-4 text-center ${plan.isPopular ? "bg-indigo-500/5" : ""}`}>
                      <div className="flex flex-col items-center gap-1">
                        {plan.isPopular && (
                          <span className="font-outfit text-[8px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            Popular
                          </span>
                        )}
                        <span className="font-outfit text-sm font-bold text-white tracking-tight">{plan.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {allFeatures.map((feature, i) => (
                  <tr key={feature.id} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-zinc-950/20" : ""} hover:bg-white/[0.02] transition-colors`}>
                    <td className="py-4 px-6 font-outfit text-sm text-zinc-300 tracking-wide sticky left-0 z-10 bg-inherit backdrop-blur-md">
                      {feature.name}
                    </td>
                    {plans.map((plan) => {
                      const isIncluded = planHasFeature(plan, feature.id);
                      const hasUpgrade = feature.upgradedById
                        ? planHasFeature(plan, feature.upgradedById)
                        : false;

                      return (
                        <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? "bg-indigo-500/5" : ""}`}>
                          {isIncluded ? (
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <Check size={14} className="text-emerald-400" />
                            </div>
                          ) : hasUpgrade ? (
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20" title={`Upgraded to ${allFeatures.find(f => f.id === feature.upgradedById)?.name || 'higher tier'}`}>
                              <ArrowUp size={14} className="text-amber-400" />
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-800/30">
                              <X size={14} className="text-zinc-700" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Pricing rows */}
                <tr className="border-t-2 border-indigo-500/20 bg-zinc-950/40">
                  <td className="py-4 px-6 font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 sticky left-0 z-10 bg-zinc-950/40 backdrop-blur-md">
                    Tenure
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? "bg-indigo-500/5" : ""}`}>
                      <span className="font-outfit text-sm font-bold text-zinc-300">{plan.tenureYears || 1} Year{(plan.tenureYears || 1) > 1 ? 's' : ''}</span>
                    </td>
                  ))}
                </tr>
                <tr className="bg-zinc-950/40">
                  <td className="py-4 px-6 font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 sticky left-0 z-10 bg-zinc-950/40 backdrop-blur-md">
                    Total Amount
                  </td>
                  {plans.map((plan) => {
                    const offerPrice = plan.discountPrice || plan.price || 0;
                    return (
                      <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? "bg-indigo-500/5" : ""}`}>
                        <span className="font-space text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">₹{offerPrice.toLocaleString('en-IN')}</span>
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-zinc-950/40 border-b border-white/5">
                  <td className="py-4 px-6 font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 sticky left-0 z-10 bg-zinc-950/40 backdrop-blur-md">
                    Per Year
                  </td>
                  {plans.map((plan) => {
                    const offerPrice = plan.discountPrice || plan.price || 0;
                    const tenure = plan.tenureYears || 1;
                    const perYear = Math.round(offerPrice / tenure);
                    return (
                      <td key={plan.id} className={`py-4 px-4 text-center ${plan.isPopular ? "bg-indigo-500/5" : ""}`}>
                        <span className="font-space text-sm font-bold text-emerald-400">₹{perYear.toLocaleString('en-IN')}/yr</span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Legend + Export */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-zinc-950/20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"><Check size={10} className="text-emerald-400" /></div>
                <span className="font-outfit text-[10px] text-zinc-500 uppercase tracking-wider">Included</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><ArrowUp size={10} className="text-amber-400" /></div>
                <span className="font-outfit text-[10px] text-zinc-500 uppercase tracking-wider">Upgraded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-zinc-800/30 flex items-center justify-center"><X size={10} className="text-zinc-700" /></div>
                <span className="font-outfit text-[10px] text-zinc-500 uppercase tracking-wider">Not Included</span>
              </div>
            </div>
            <button
              onClick={async () => {
                const btn = document.getElementById("dl-comp-btn");
                const orig = btn ? btn.innerHTML : "";
                if (btn) btn.innerHTML = "Exporting...";
                try {
                  await exportReactElementToPdf(
                    <PrintableComparison plans={plans} allFeatures={allFeatures} />, 
                    `THE_WEB_SENSEI_Comparison.pdf`
                  );
                } finally {
                  if (btn) btn.innerHTML = orig;
                }
              }}
              id="dl-comp-btn"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-lg font-outfit font-bold text-[10px] uppercase tracking-widest transition-all"
            >
              <Download size={12} />
              Export PDF
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
