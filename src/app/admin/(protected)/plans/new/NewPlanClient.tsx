"use client";

import { useState } from "react";
import { createPlan } from "@/app/actions/plans";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";

export default function NewPlanClient({ allFeatures }: { allFeatures: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [paymentTerms, setPaymentTerms] = useState([
    { name: "Advance", percent: 50 },
    { name: "Mid-Stage", percent: 25 },
    { name: "Final Deployment", percent: 25 }
  ]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    offerPrice: "",
    tenureYears: 1,
    validity: "",
    isPopular: false,
  });

  const estimatedBaseCost = allFeatures
    .filter((f) => selectedFeatures.includes(f.id))
    .reduce((sum, f) => {
      const fp = f.price || 0;
      return sum + (f.isOneTime ? fp : fp * (formData.tenureYears || 1));
    }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const totalPercent = paymentTerms.reduce((sum, t) => sum + (t.percent || 0), 0);
    if (totalPercent !== 100) {
      alert("Payment term percentages must sum to exactly 100%. Currently: " + totalPercent + "%");
      setLoading(false);
      return;
    }

    try {
      await createPlan({
        name: formData.name,
        description: formData.description,
        price: 0,
        discountPrice: parseFloat(formData.offerPrice),
        tenureYears: formData.tenureYears,
        paymentTerms: JSON.stringify(paymentTerms),
        validity: formData.validity,
        isPopular: formData.isPopular,
        featureIds: selectedFeatures,
      });
      router.push("/admin/plans");
    } catch (error) {
      console.error(error);
      alert("Failed to create plan");
      setLoading(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) => 
      prev.includes(featureId) ? prev.filter((id) => id !== featureId) : [...prev, featureId]
    );
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/plans" className="p-3 bg-zinc-900/50 backdrop-blur-md border border-white/5 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-white group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        <h1 className="font-outfit text-4xl font-extrabold tracking-tight text-white">Create New Plan</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative shadow-2xl overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>
          
          <h2 className="font-outfit text-2xl font-bold mb-8 text-white relative z-10">Plan Core Details</h2>

          <div className="bg-indigo-500/10 border border-indigo-500/30 p-6 rounded-2xl mb-8 relative z-10 font-outfit shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <p className="font-outfit text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Calculated Base Price (Live Sum over {formData.tenureYears} year(s))</p>
            <p className="font-space text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">₹{estimatedBaseCost.toLocaleString('en-IN')}</p>
          </div>

          <form id="new-plan-form" onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div>
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Plan Name *</label>
                <input
                  required
                  type="text"
                  className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                <textarea
                  className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all h-24 resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Your Final Offer Price (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    className="font-space w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold text-xl text-emerald-400"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Tenure (number of years) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  className="font-space w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-bold text-lg mb-4"
                  value={formData.tenureYears}
                  onChange={(e) => setFormData({ ...formData, tenureYears: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div>
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Validity Text (e.g., 2 Years)</label>
                <input
                  type="text"
                  className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                  value={formData.validity}
                  onChange={(e) => setFormData({ ...formData, validity: e.target.value })}
                />
              </div>

              <div className="pt-8 border-t border-white/5">
                <div className="flex justify-between items-center mb-6">
                  <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500">Payment Structure (%) *</label>
                  <button 
                    type="button" 
                    onClick={() => setPaymentTerms([...paymentTerms, { name: "New Stage", percent: 0 }])}
                    className="font-outfit text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-zinc-300 transition-colors border border-white/5"
                  >
                    + Add Stage
                  </button>
                </div>
                
                <div className="space-y-4">
                  {paymentTerms.map((term, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <input
                        type="text"
                        required
                        className="font-outfit flex-1 bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 font-medium"
                        value={term.name}
                        onChange={(e) => {
                          const newTerms = [...paymentTerms];
                          newTerms[idx].name = e.target.value;
                          setPaymentTerms(newTerms);
                        }}
                      />
                      <div className="relative w-28">
                        <input
                          type="number"
                          required
                          min="0"
                          max="100"
                          className="font-space w-full bg-zinc-950/50 border border-white/5 rounded-xl pl-4 pr-8 py-3 text-white font-bold focus:outline-none focus:border-indigo-500/50"
                          value={term.percent}
                          onChange={(e) => {
                            const newTerms = [...paymentTerms];
                            newTerms[idx].percent = parseFloat(e.target.value) || 0;
                            setPaymentTerms(newTerms);
                          }}
                        />
                        <span className="absolute right-4 top-[10px] text-zinc-500 font-bold">%</span>
                      </div>
                      <div className="w-32 text-right font-space text-[15px] font-bold text-indigo-400">
                        ₹{Math.round((parseFloat(formData.offerPrice || "0") * term.percent) / 100).toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentTerms(paymentTerms.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                  
                  {(() => {
                    const total = paymentTerms.reduce((sum, t) => sum + (t.percent || 0), 0);
                    return (
                      <div className={`font-outfit text-right text-sm font-bold mt-4 uppercase tracking-wider ${total === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                        Total Allocation: {total}% {total !== 100 && "(Must exactly equal 100%)"}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <label className="flex items-center gap-4 p-5 bg-zinc-950/50 rounded-2xl border border-white/5 cursor-pointer uppercase font-outfit font-bold tracking-widest text-sm hover:border-indigo-500/30 transition-colors">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-white/10 bg-zinc-800 accent-indigo-500"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                />
                <div className="text-zinc-200">Mark as Popular Plan</div>
              </label>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex justify-end">
              <button
                type="submit"
                form="new-plan-form"
                disabled={loading}
                className="font-outfit text-sm font-bold uppercase tracking-widest px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 rounded-xl text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
              >
                {loading ? "Saving..." : "Create Plan"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl overflow-hidden self-start sticky top-12">
          <h2 className="font-outfit text-2xl font-bold mb-6 text-white tracking-tight">Included Features</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {allFeatures.map((feature) => {
              const isIncluded = selectedFeatures.includes(feature.id);
              return (
                <button
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  type="button"
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    isIncluded 
                      ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                      : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="pr-2">
                    <div className={`font-outfit font-bold tracking-tight text-lg leading-tight mb-1 ${isIncluded ? "text-white" : "text-zinc-300"}`}>
                      {feature.name}
                    </div>
                    <div className="font-space text-xs font-bold text-indigo-400">
                      ₹{(feature.price || 0).toLocaleString('en-IN')} {feature.isOneTime ? <span className="text-amber-400">(one-time)</span> : '/ year'}
                    </div>
                  </div>
                  {isIncluded && <Check size={20} className="text-indigo-400 shrink-0" />}
                </button>
              );
            })}
            {allFeatures.length === 0 && (
              <p className="font-outfit text-sm font-medium text-zinc-500 text-center py-8 bg-zinc-950/50 rounded-xl border border-white/5">No features defined globally.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
