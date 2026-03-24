"use client";

import { useState } from "react";
import { createItem, deleteItem, updateItem, importFeaturesToItems } from "@/app/actions/items";
import { Edit2, Trash2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ItemsClient({ initialItems }: { initialItems: any[] }) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", price: "", isOneTime: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price || "0"),
        isOneTime: formData.isOneTime,
      };
      
      if (editingId) {
        await updateItem(editingId, payload);
      } else {
        await createItem(payload);
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", isOneTime: false });
      router.refresh();
    } catch {
      alert("Error saving custom item");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setFormData({ name: item.name, description: item.description || "", price: item.price.toString(), isOneTime: item.isOneTime || false });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this custom item?")) {
      await deleteItem(id);
      router.refresh();
    }
  };

  const handleImport = async () => {
    if (confirm("This will import all global Features into Custom Items. Existing items with the same name will be skipped. Continue?")) {
      setLoading(true);
      try {
        const res = await importFeaturesToItems();
        alert(res.message);
        router.refresh();
      } catch {
        alert("Failed to import features.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {!isAdding && (
        <div className="flex gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="font-outfit flex items-center gap-2 px-6 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-xl transition-all font-bold uppercase tracking-widest text-sm shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          >
            <Plus size={18} /> Add Item
          </button>
          <button
            onClick={handleImport}
            disabled={loading}
            className="font-outfit flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 border border-white/5 hover:text-white hover:border-white/10 rounded-xl transition-all font-bold uppercase tracking-widest text-sm"
          >
            Import from Features
          </button>
        </div>
      )}

      {isAdding && (
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative shadow-2xl">
          <button 
            onClick={() => { setIsAdding(false); setEditingId(null); setFormData({ name: "", description: "", price: "", isOneTime: false }); }}
            className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="font-outfit text-2xl font-bold mb-6 text-white tracking-tight">{editingId ? "Edit" : "New"} Custom Item</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Price (₹)</label>
                <input 
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  className="font-space w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-bold text-lg"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Description</label>
              <input 
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 mt-2 bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3">
              <input
                type="checkbox"
                id="isOneTime"
                checked={formData.isOneTime}
                onChange={(e) => setFormData({ ...formData, isOneTime: e.target.checked })}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="isOneTime" className="cursor-pointer select-none">
                <span className="font-outfit text-sm font-bold text-zinc-300">One-Time Fee</span>
                <span className="font-outfit text-xs text-zinc-600 ml-2">(not multiplied by tenure years)</span>
              </label>
            </div>
            <button type="submit" disabled={loading} className="font-outfit px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest text-sm mt-4">
              {loading ? "Saving..." : "Save Item"}
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
              <th className="p-6 font-bold">Price</th>
              <th className="p-6 font-bold">Type</th>
              <th className="p-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialItems.map((f) => (
              <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-6 font-outfit font-bold text-white text-lg tracking-tight">{f.name}</td>
                <td className="p-6 font-outfit text-zinc-400">{f.description}</td>
                <td className="p-6 font-space text-indigo-400 font-bold text-lg">₹{f.price.toLocaleString('en-IN')}</td>
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
