"use client";

import { motion } from "framer-motion";
import { Check, X, ArrowLeft, ArrowRight, Calendar, Clock, CreditCard, Sparkles, Download } from "lucide-react";
import Link from "next/link";
import { PlanBreakdownChart } from "@/components/CostBreakdownChart";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { exportReactElementToPdf } from "@/lib/pdfGenerator";
import PrintablePlan from "@/components/pdf/PrintablePlan";

export default function PlanDetailClient({ plan, whatsappNumber, contactEmail }: { plan: any; whatsappNumber: string; contactEmail: string }) {
  const includedFeatures = plan.features.filter((pf: any) => pf.isIncluded);
  const excludedFeatures = plan.features.filter((pf: any) => !pf.isIncluded);
  const tenure = plan.tenureYears || 1;

  // Calculate base price from features
  const basePrice = plan.features
    .filter((pf: any) => pf.isIncluded)
    .reduce((sum: number, pf: any) => {
      const fp = pf.feature?.price || 0;
      return sum + (pf.feature?.isOneTime ? fp : fp * tenure);
    }, 0);

  const offerPrice = plan.discountPrice || plan.price || basePrice;
  const perYear = Math.round(offerPrice / tenure);
  const savings = basePrice > offerPrice ? basePrice - offerPrice : 0;
  const savingsPercent = basePrice > 0 ? Math.round((savings / basePrice) * 100) : 0;

  // Parse payment terms
  let paymentTerms: { name: string; percent: number }[] = [];
  try {
    paymentTerms = JSON.parse(plan.paymentTerms || "[]");
  } catch {}

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in the ${plan.name} plan. Could you share more details?`;
    const formattedNum = whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/8 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Nav */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28">
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-2 font-outfit text-sm text-zinc-500 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Plans
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left: Plan Info (3 cols) */}
          <div className="lg:col-span-3 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {plan.isPopular && (
                <span className="inline-block font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-4">
                  ✦ Most Popular
                </span>
              )}
              <h1 className="font-outfit text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[0.95] mb-4">
                {plan.name}
              </h1>
              {plan.description && (
                <p className="font-outfit text-lg text-zinc-400 max-w-lg leading-relaxed">
                  {plan.description}
                </p>
              )}
            </motion.div>

            {/* Pricing Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-[-30%] right-[-20%] w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-space text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                    ₹{offerPrice.toLocaleString('en-IN')}
                  </span>
                  {savings > 0 && (
                    <span className="font-space text-xl text-zinc-600 line-through decoration-red-500/40">
                      ₹{basePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-zinc-800/50 rounded-xl px-4 py-2.5 border border-white/5">
                    <Calendar size={15} className="text-indigo-400" />
                    <span className="font-outfit text-sm text-zinc-300">{plan.validity || `${tenure} Year${tenure > 1 ? 's' : ''}`}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-800/50 rounded-xl px-4 py-2.5 border border-white/5">
                    <Clock size={15} className="text-emerald-400" />
                    <span className="font-space text-sm font-bold text-emerald-400">₹{perYear.toLocaleString('en-IN')}/yr</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex items-center gap-2 bg-emerald-500/10 rounded-xl px-4 py-2.5 border border-emerald-500/20">
                      <Sparkles size={15} className="text-emerald-400" />
                      <span className="font-outfit text-sm font-bold text-emerald-400">Save {savingsPercent}%</span>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-outfit font-bold text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all group"
                  >
                    <WhatsAppIcon size={18} />
                    Enquire Now
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={async () => {
                      const btn = document.getElementById("dl-plan-btn-1");
                      const orig = btn ? btn.innerHTML : "";
                      if (btn) btn.innerHTML = "Generating...";
                      try {
                        await exportReactElementToPdf(
                          <PrintablePlan plan={plan} />, 
                          `THE_WEB_SENSEI_${plan.name}_Plan.pdf`
                        );
                      } finally {
                        if (btn) btn.innerHTML = orig;
                      }
                    }}
                    id="dl-plan-btn-1"
                    className="flex items-center gap-2 px-6 py-3.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-outfit font-bold text-sm uppercase tracking-widest transition-all"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                  <Link
                    href="/custom-plan"
                    className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-outfit font-bold text-sm uppercase tracking-widest transition-all"
                  >
                    Customize Plan
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Payment Schedule */}
            {paymentTerms.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard size={20} className="text-indigo-400" />
                  <h2 className="font-outfit text-xl font-bold text-white tracking-tight">Payment Schedule</h2>
                </div>
                <div className="space-y-4">
                  {paymentTerms.map((term, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="font-outfit text-sm text-zinc-300">{term.name}</span>
                        <span className="font-outfit text-xs text-zinc-600">({term.percent}%)</span>
                      </div>
                      <span className="font-space text-sm font-bold text-emerald-400">
                        ₹{Math.round((offerPrice * term.percent) / 100).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-6 flex rounded-full overflow-hidden h-2 bg-zinc-800">
                  {paymentTerms.map((term, i) => {
                    const colors = [
                      "bg-indigo-500",
                      "bg-violet-500",
                      "bg-fuchsia-500",
                      "bg-pink-500",
                      "bg-rose-500",
                    ];
                    return (
                      <div
                        key={i}
                        className={`${colors[i % colors.length]} transition-all`}
                        style={{ width: `${term.percent}%` }}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Cost Breakdown Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <PlanBreakdownChart features={plan.features} tenureYears={tenure} />
            </motion.div>
          </div>

          {/* Right: Features List (2 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-2 lg:sticky lg:top-8"
          >
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute bottom-[-30%] left-[-20%] w-[250px] h-[250px] bg-violet-500/8 blur-[100px] rounded-full pointer-events-none"></div>

              <h2 className="font-outfit text-2xl font-bold text-white tracking-tight mb-8 relative z-10">What&apos;s Included</h2>

              {/* Included */}
              <div className="space-y-4 relative z-10 mb-8">
                {includedFeatures.map((pf: any, i: number) => (
                  <motion.div
                    key={pf.feature.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 + 0.3 }}
                    className="flex items-start gap-3 group"
                  >
                    <div className="bg-emerald-500/15 p-1.5 rounded-full mt-0.5 shrink-0">
                      <Check size={13} className="text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-outfit text-sm text-zinc-200 font-medium tracking-wide">{pf.feature.name}</span>
                      {pf.feature.price > 0 && (
                        <div className="font-space text-[11px] text-indigo-400/60 font-bold mt-0.5">
                          ₹{pf.feature.price.toLocaleString('en-IN')} {pf.feature.isOneTime ? '(one-time)' : '/ year'}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Not included */}
              {excludedFeatures.length > 0 && (
                <>
                  <div className="border-t border-white/5 pt-6 mb-4">
                    <p className="font-outfit text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4">Not Included</p>
                  </div>
                  <div className="space-y-3 relative z-10">
                    {excludedFeatures.map((pf: any) => (
                      <div key={pf.feature.id} className="flex items-center gap-3">
                        <div className="bg-zinc-800/50 p-1.5 rounded-full shrink-0">
                          <X size={13} className="text-zinc-700" />
                        </div>
                        <span className="font-outfit text-sm text-zinc-600 line-through decoration-zinc-800">{pf.feature.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Bottom CTAs */}
              <div className="mt-8 pt-6 border-t border-white/5 relative z-10 space-y-3">
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-outfit font-bold text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all group"
                >
                  <WhatsAppIcon size={18} />
                  Enquire Now
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={async () => {
  const btn = document.getElementById("dl-plan-btn-2");
  const orig = btn ? btn.innerHTML : "";
  if (btn) btn.innerHTML = "Generating...";
  try {
    await exportReactElementToPdf(<PrintablePlan plan={plan} />, `THE_WEB_SENSEI_${plan.name}_Plan.pdf`);
  } finally {
    if (btn) btn.innerHTML = orig;
  }
}}
id="dl-plan-btn-2"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white rounded-xl font-outfit font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <Download size={14} />
                  Download PDF Quote
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
