"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

export default function SettingsClient({ 
  initialSettings 
}: { 
  initialSettings: { 
    contactEmail: string; 
    whatsappNumber: string;
    upiId: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankIfsc: string;
  } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateSettings(formData);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative shadow-2xl max-w-3xl">
      <h2 className="font-outfit text-3xl font-extrabold text-white mb-2 tracking-tight">Global Configurations</h2>
      <p className="font-outfit text-zinc-400 mb-8 text-sm">
        These settings will explicitly override the default system `.env` configuration for the public website.
      </p>

      {success && (
        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-outfit font-bold tracking-wide">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Contact Email</label>
          <input 
            type="email"
            required
            className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            placeholder="contact@example.com"
          />
        </div>
        
        <div>
          <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">WhatsApp Number (with country code)</label>
          <input 
            type="text"
            required
            className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
            value={formData.whatsappNumber}
            onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
            placeholder="+1234567890"
          />
        </div>

        <div className="pt-8 border-t border-white/5">
          <h3 className="font-outfit text-xl font-bold text-white mb-6 tracking-tight">Payment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">UPI ID</label>
              <input 
                type="text"
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="example@upi"
              />
            </div>
            
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Bank Account Name</label>
              <input 
                type="text"
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                value={formData.bankAccountName}
                onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                placeholder="THE WEB SENSEI"
              />
            </div>

            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Account Number</label>
              <input 
                type="text"
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">IFSC Code</label>
              <input 
                type="text"
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                value={formData.bankIfsc}
                onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value })}
                placeholder="HDFC0001234"
              />
            </div>
          </div>
        </div>


        <div className="pt-6 border-t border-white/5 flex justify-end">
          <button type="submit" disabled={loading} className="font-outfit px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-500/20 transition-all">
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
