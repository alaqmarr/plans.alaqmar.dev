"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, X, ArrowRight, Zap, Shield, Code } from "lucide-react";
import Link from "next/link";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import dynamic from "next/dynamic";
import MagneticButton from "@/components/MagneticButton";
import TechMarquee from "@/components/TechMarquee";
import CodeTerminal from "@/components/CodeTerminal";
import { PlanBreakdownChart } from "@/components/CostBreakdownChart";
import ContactSection from "@/components/ContactSection";
import PlanComparison from "@/components/PlanComparison";

const ParticleHero = dynamic(() => import("@/components/ParticleHero"), { ssr: false });

export default function HomeClient({ plans, whatsappNumber, contactEmail }: { plans: any[], whatsappNumber: string, contactEmail: string }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const meshY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  
  const handleEnquiry = (planName: string) => {
    if (whatsappNumber) {
      const message = `Hi Alaqmar! I'm interested in the ${planName} plan.`;
      const formattedNum = whatsappNumber.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${formattedNum}?text=${encodeURIComponent(message)}`, "_blank");
    } else {
      window.location.href = `mailto:contact@alaqmar.dev?subject=Enquiry about ${planName}`;
    }
  };

  return (
    <div className="relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Ambient Mesh Gradients */}
      <div className="absolute top-[-20%] right-[10%] w-[70vw] max-w-[800px] h-[600px] bg-rose-500/15 rounded-full blur-[160px] mix-blend-screen pointer-events-none translate-x-1/4"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] max-w-[700px] h-[700px] bg-orange-500/15 rounded-full blur-[160px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute top-[20%] left-[20%] w-[80vw] max-w-[1000px] h-[800px] bg-indigo-600/15 rounded-full blur-[180px] mix-blend-screen pointer-events-none -translate-x-1/4"></div>
      
      {/* Subtle Noise / Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center z-10 overflow-hidden">
        {/* Particle field */}
        <ParticleHero />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium text-sm mb-8"
        >
          <Zap size={16} className="text-indigo-400" />
          <span>Elevate your digital presence</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          style={{ y: heroY, opacity: heroOpacity }}
          className="font-space text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 text-balance leading-[1.1] relative z-10"
        >
          Build Faster. <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">Scale Better.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ y: heroY, opacity: heroOpacity }}
          className="font-outfit text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 text-balance leading-relaxed tracking-wide relative z-10"
        >
          Premium full-stack development plans designed for startups and enterprises. We deliver robust, scalable, and beautifully crafted applications.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 relative z-10"
        >
          <MagneticButton>
            <Link 
              href="#pricing"
              className="font-outfit px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] inline-block"
            >
              View Plans
            </Link>
          </MagneticButton>
          <MagneticButton>
            <Link 
              href="/custom-plan"
              className="font-outfit px-8 py-4 bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800 rounded-xl font-bold text-white transition-all inline-block"
            >
              Build Custom App
            </Link>
          </MagneticButton>
        </motion.div>
      </section>

      {/* Tech Stack Marquee */}
      <TechMarquee />

      {/* Code Terminal */}
      <CodeTerminal />

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32 px-4 bg-zinc-950 overflow-hidden z-10 border-t border-white/5">
        {/* Ambient background glows */}
        <div className="absolute top-[-20%] left-[0%] w-[1000px] h-[1000px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[800px] h-[800px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="font-outfit text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
              {"Transparent Pricing".split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="inline-block mr-4"
                >
                  {word}
                </motion.span>
              ))}
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="font-outfit text-zinc-400 max-w-xl mx-auto text-lg"
            >
              Choose the package that perfectly aligns with your project goals.
            </motion.p>
          </motion.div>

          {plans.length === 0 ? (
            <div className="text-center text-zinc-500 py-12">No plans available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {plans.map((plan: any, index: number) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative flex flex-col h-full rounded-3xl p-8 bg-zinc-900/80 backdrop-blur-xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 border border-white/5
                    ${plan.isPopular ? 'ring-1 ring-indigo-500/50 shadow-2xl shadow-indigo-500/20 animated-border' : 'shadow-xl'}`}
                >
                  {/* Subtle Card Ambient Gradients */}
                  <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[80px] pointer-events-none mix-blend-screen transition-opacity duration-700 opacity-60 group-hover:opacity-100 ${plan.isPopular ? 'bg-indigo-600/30' : 'bg-rose-600/20'}`}></div>
                  <div className={`absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[80px] pointer-events-none mix-blend-screen transition-opacity duration-700 opacity-60 group-hover:opacity-100 ${plan.isPopular ? 'bg-purple-600/30' : 'bg-orange-600/20'}`}></div>

                  {plan.isPopular && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 z-10"></div>
                  )}

                  <div className="mb-8 relative z-10">
                    {plan.isPopular && (
                      <span className="font-outfit inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-outfit text-3xl font-bold text-white tracking-tight">{plan.name}</h3>
                    {plan.description && <p className="text-zinc-400 text-sm mt-3 h-10">{plan.description}</p>}
                  </div>

                  {(() => {
                    const basePrice = plan.features
                      .filter((pf: any) => pf.isIncluded)
                      .reduce((sum: number, pf: any) => {
                        const fp = pf.feature?.price || 0;
                        return sum + (pf.feature?.isOneTime ? fp : fp * (plan.tenureYears || 1));
                      }, 0);
                    
                    const offerPrice = plan.discountPrice || plan.price || basePrice;

                    return (
                      <>
                        <div className="pb-6 border-b border-zinc-800/50 mb-6 relative z-10">
                          <div className="mb-3 flex items-baseline gap-2">
                            {basePrice > offerPrice ? (
                              <>
                                <span className="font-space text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">₹{offerPrice.toLocaleString('en-IN')}</span>
                                <span className="font-space text-xl text-zinc-600 line-through decoration-red-500/30">₹{basePrice.toLocaleString('en-IN')}</span>
                              </>
                            ) : (
                              <span className="font-space text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">₹{offerPrice.toLocaleString('en-IN')}</span>
                            )}
                          </div>
  
                          <div className="flex flex-col gap-3">
                            <div className="font-outfit text-indigo-400 font-bold text-lg">
                              ₹{Math.round(offerPrice / (plan.tenureYears || 1)).toLocaleString('en-IN')} <span className="text-zinc-500 text-sm font-medium">/ year</span>
                            </div>
                            {plan.validity && (
                              <div className="font-outfit text-[10px] font-bold tracking-[0.15em] uppercase text-emerald-400 bg-emerald-500/10 self-start px-2.5 py-1.5 rounded border border-emerald-500/20">
                                VALID FOR {plan.validity}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="flex gap-3 mb-8">
                    <button 
                      onClick={() => handleEnquiry(plan.name)}
                      className={`flex-1 py-3.5 rounded-xl font-outfit font-bold text-sm tracking-wide transition-all flex justify-center items-center gap-2
                        ${plan.isPopular 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] border border-emerald-400/30' 
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'}`}
                    >
                      <WhatsAppIcon size={16} /> Enquire
                    </button>
                    <Link
                      href={`/package/${plan.id}`}
                      className={`flex-1 py-3.5 rounded-xl font-outfit font-bold text-sm tracking-wide text-center transition-all flex justify-center items-center gap-2
                        ${plan.isPopular
                          ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                          : 'bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5'}`}
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>

                  <div className="mb-10 space-y-4 relative z-10">
                    {plan.features.map((pf: any, featureIndex: number) => (
                      <motion.div
                        key={pf.feature.id}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: featureIndex * 0.05 + 0.3 }}
                        className="flex gap-4 items-start"
                      >
                        {pf.isIncluded ? (
                          <div className="bg-indigo-500/20 p-1.5 rounded-full mt-0.5">
                            <Check size={14} className="text-indigo-400 shrink-0" />
                          </div>
                        ) : (
                          <div className="bg-zinc-800/50 p-1.5 rounded-full mt-0.5">
                            <X size={14} className="text-zinc-600 shrink-0" />
                          </div>
                        )}
                        <span className={`text-sm tracking-wide ${pf.isIncluded ? 'text-zinc-300 font-medium' : 'text-zinc-600 line-through decoration-zinc-700'}`}>
                          {pf.feature.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Feature Cost Breakdown Chart */}
                  <PlanBreakdownChart features={plan.features} tenureYears={plan.tenureYears} />

                  {/* Payment Schedule at the bottom */}
                  {(() => {
                    let terms = [];
                    try {
                      terms = JSON.parse(plan.paymentTerms || "[]");
                    } catch(e) {}
                    
                    if (terms.length > 0) {
                      const basePrice = plan.features.filter((pf: any) => pf.isIncluded).reduce((sum: number, pf: any) => {
                        const fp = pf.feature?.price || 0;
                        return sum + (pf.feature?.isOneTime ? fp : fp * (plan.tenureYears || 1));
                      }, 0);
                      const offerPrice = plan.discountPrice || plan.price || basePrice;

                      return (
                        <div className="mt-auto pt-6 border-t border-zinc-800/80 bg-zinc-800/20 backdrop-blur-md -mx-8 -mb-8 px-8 pb-8 rounded-b-3xl relative z-10">
                          <p className="font-outfit text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Payment Schedule</p>
                          <div className="space-y-3">
                            {terms.map((t: any, i: number) => (
                              <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-outfit text-zinc-400 tracking-wide">{t.name} <span className="text-zinc-600 ml-1 text-xs">({t.percent}%)</span></span>
                                <span className="font-space font-medium text-emerald-400">₹{Math.round((offerPrice * t.percent) / 100).toLocaleString('en-IN')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Plan Comparison Table */}
      <PlanComparison plans={plans} />

      {/* Contact Section */}
      <ContactSection contactEmail={contactEmail} whatsappNumber={whatsappNumber} />
    </div>
  );
}
