"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/app/actions/clients";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function NewClientClient({ plans }: { plans: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    offeredPrice: "",
  });
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([""]);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const selectedPlan = useMemo(() => plans.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

  const addPhone = () => setPhoneNumbers([...phoneNumbers, ""]);
  const updatePhone = (index: number, val: string) => {
    const newArr = [...phoneNumbers];
    newArr[index] = val;
    setPhoneNumbers(newArr);
  };
  const removePhone = (index: number) => {
    if (phoneNumbers.length === 1) return;
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  const paymentStructure = useMemo(() => {
    const price = parseFloat(formData.offeredPrice) || 0;
    if (!selectedPlan || price <= 0) return [];

    let terms = [];
    try {
      terms = JSON.parse(selectedPlan.paymentTerms || "[]");
    } catch {
      terms = [{ name: "Advance" }];
    }

    if (terms.length === 0) terms = [{ name: "Advance" }];

    const structure = [];
    const originalPlanPrice = selectedPlan.discountPrice || selectedPlan.price || 0;
    const advanceAmount = Math.round(originalPlanPrice * 0.40);

    const advancePercent = price > 0 ? Math.round((advanceAmount / price) * 100) : 40;

    structure.push({
      name: terms[0]?.name || "Advance",
      amount: advanceAmount,
      isPaid: false,
      percent: advancePercent
    });

    if (terms.length > 1) {
      const remainingAmount = Math.max(0, price - advanceAmount);
      const amountPerStep = Math.round(remainingAmount / (terms.length - 1));
      
      // Calculate adjusted percentages based on the offered price
      const percentPerStep = price > 0 ? Math.round((amountPerStep / price) * 100) : 0;

      for (let i = 1; i < terms.length; i++) {
        structure.push({
          name: terms[i]?.name || `Installment ${i}`,
          amount: amountPerStep,
          isPaid: false,
          percent: percentPerStep
        });
      }
    }

    return structure;
  }, [formData.offeredPrice, selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId) return alert("Select a plan first");
    
    // Filter empty phones
    const validPhones = phoneNumbers.filter(p => p.trim() !== "");
    if (validPhones.length === 0) return alert("Provide at least one phone number");

    setLoading(true);
    try {
      await createClient({
        name: formData.name,
        email: formData.email,
        phoneNumbers: validPhones,
        planId: selectedPlanId,
        offeredPrice: parseFloat(formData.offeredPrice),
        paymentStructure: JSON.stringify(paymentStructure)
      });
      router.push("/admin/clients");
    } catch (error) {
      console.error(error);
      alert("Failed to create client");
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative shadow-2xl">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href="/admin/clients"
          className="p-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="font-outfit text-2xl font-extrabold text-white tracking-tight">Client Details</h2>
          <p className="font-outfit text-zinc-400 text-sm">Add a new client and configure their custom payment structure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Client Name</label>
            <input 
              type="text" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-outfit"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Email Address (Optional)</label>
            <input 
              type="email"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-outfit"
              placeholder="e.g. contact@client.com"
            />
          </div>
        </div>

        <div>
          <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Phone Numbers (WhatsApp)</label>
          <div className="space-y-3">
            {phoneNumbers.map((phone, i) => (
              <div key={i} className="flex items-center gap-3">
                <input 
                  type="text" required={i === 0}
                  value={phone} onChange={e => updatePhone(i, e.target.value)}
                  className="flex-1 bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-outfit"
                  placeholder="+91..."
                />
                {phoneNumbers.length > 1 && (
                  <button type="button" onClick={() => removePhone(i)} className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addPhone} className="font-outfit text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 mt-2">
              <Plus size={16} /> Add Another Number
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 mt-8">
          <h3 className="font-outfit text-xl font-bold text-white mb-6 tracking-tight">Plan & Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Assign Plan</label>
              <select 
                required
                value={selectedPlanId} onChange={e => setSelectedPlanId(e.target.value)}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-outfit"
              >
                <option value="">Select a plan</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - ₹{(p.discountPrice || p.price)?.toLocaleString('en-IN')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Agreed Final Deal Price (₹)</label>
              <input 
                type="number" required min="1"
                value={formData.offeredPrice} onChange={e => setFormData({...formData, offeredPrice: e.target.value})}
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-outfit font-bold text-emerald-400"
                placeholder="e.g. 50000"
              />
            </div>
          </div>
        </div>

        {paymentStructure.length > 0 && (
          <div className="bg-zinc-950/50 rounded-2xl p-6 border border-white/5">
            <h4 className="font-outfit text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
              Calculated Payment Structure
              <span className="bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-md text-[10px]">Auto</span>
            </h4>
            <div className="space-y-3">
              {paymentStructure.map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                  <div>
                    <div className="font-outfit font-bold text-white">{step.name}</div>
                    <div className="font-outfit text-xs text-zinc-500 mt-1">{step.percent}% of total</div>
                  </div>
                  <div className="font-outfit font-bold text-emerald-400 text-lg">
                    ₹{step.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-white/5 flex justify-end">
          <button type="submit" disabled={loading} className="font-outfit px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/20 transition-all">
            {loading ? "Creating..." : "Create Client"}
          </button>
        </div>
      </form>
    </div>
  );
}
