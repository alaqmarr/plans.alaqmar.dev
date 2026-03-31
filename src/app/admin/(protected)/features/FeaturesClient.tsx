"use client";

import { useState } from "react";
import { createFeature, deleteFeature, updateFeature } from "@/app/actions/features";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useConfirm } from "@/providers/ConfirmProvider";

export default function FeaturesClient({ initialFeatures }: { initialFeatures: any[] }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", isOneTime: false, upgradedById: "" });
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateFeature(editingId, { ...formData, price: parseFloat(formData.price) || 0, isOneTime: formData.isOneTime, upgradedById: formData.upgradedById || null });
      } else {
        await createFeature({ ...formData, price: parseFloat(formData.price) || 0, isOneTime: formData.isOneTime, upgradedById: formData.upgradedById || null });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", isOneTime: false, upgradedById: "" });
      toast.success(editingId ? "Feature updated!" : "Feature created!");
      router.refresh();
    } catch {
      toast.error("Error saving feature");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feature: any) => {
    setFormData({ name: feature.name, description: feature.description || "", price: (feature.price || 0).toString(), isOneTime: feature.isOneTime || false, upgradedById: feature.upgradedById || "" });
    setEditingId(feature.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (await confirm({ title: "Delete Feature", message: "Are you sure you want to delete this feature?", destructive: true })) {
      await deleteFeature(id);
      toast.success("Feature deleted");
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {!isAdding && (
        <button
          onClick={() => setIsAdding(true)}
          className="font-outfit flex items-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-xl transition-all font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        >
          <Plus size={18} /> Add Feature
        </button>
      )}

      {isAdding && (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative shadow-2xl">
          <button 
            onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name: "", description: "", price: "", isOneTime: false, upgradedById: "" }); }}
            className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="font-outfit text-2xl font-bold mb-6 text-white tracking-tight">{editingId ? "Edit" : "New"} Feature</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Name</label>
              <input 
                required
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
              <input 
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Base Price (₹) *</label>
              <input 
                type="number"
                required
                min="0"
                step="0.01"
                className="font-space w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-bold text-lg"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 mt-2 bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3">
              <input
                type="checkbox"
                id="featureIsOneTime"
                checked={formData.isOneTime}
                onChange={(e) => setFormData({ ...formData, isOneTime: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="featureIsOneTime" className="cursor-pointer select-none">
                <span className="font-outfit text-sm font-bold text-zinc-300">One-Time Fee</span>
                <span className="font-outfit text-xs text-zinc-600 ml-2">(not multiplied by tenure years)</span>
              </label>
            </div>
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Upgraded By (optional)</label>
              <select
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                value={formData.upgradedById}
                onChange={(e) => setFormData({ ...formData, upgradedById: e.target.value })}
              >
                <option value="">— None —</option>
                {initialFeatures
                  .filter((f) => f.id !== editingId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
              </select>
              <p className="font-outfit text-[10px] text-zinc-600 mt-1">If this feature is replaced by a better version in other plans, select it here. e.g. "Static Dev" → upgraded by "Dynamic Dev"</p>
            </div>
            <button type="submit" disabled={loading} className="font-outfit px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest text-sm mt-4">
              {loading ? "Saving..." : "Save Feature"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 font-outfit text-xs uppercase tracking-widest text-zinc-500">
              <th className="p-6 font-bold">Name</th>
              <th className="p-6 font-bold">Description</th>
              <th className="p-6 font-bold">Price (₹)</th>
              <th className="p-6 font-bold">Type</th>
              <th className="p-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialFeatures.map((f) => (
              <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-6 font-outfit font-bold text-white text-lg tracking-tight">{f.name}</td>
                <td className="p-6 font-outfit text-zinc-400">{f.description}</td>
                <td className="p-6 font-space text-indigo-400 font-bold text-lg">₹{(f.price || 0).toLocaleString('en-IN')}</td>
                <td className="p-6">
                  {f.isOneTime ? (
                    <span className="font-outfit text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">One-Time</span>
                  ) : (
                    <span className="font-outfit text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full border border-white/5">Recurring</span>
                  )}
                </td>
                <td className="p-6 text-right space-x-3">
                  <button onClick={() => handleEdit(f)} className="p-2.5 bg-zinc-800/50 rounded-lg hover:bg-zinc-700 text-zinc-300 transition-colors border border-white/5"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete(f.id)} className="p-2.5 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
