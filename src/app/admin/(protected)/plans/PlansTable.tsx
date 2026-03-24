"use client";

import Link from "next/link";
import { deletePlan } from "@/app/actions/plans";
import { Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PlansTable({ plans }: { plans: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      await deletePlan(id);
      router.refresh();
    }
  };

  if (!plans.length) {
    return <div className="p-8 text-center text-zinc-400">No plans created yet.</div>;
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 font-outfit text-xs uppercase tracking-widest text-zinc-500 border-b border-white/5">
            <th className="p-6 font-bold">Name</th>
            <th className="p-6 font-bold">Price</th>
            <th className="p-6 font-bold">Validity</th>
            <th className="p-6 font-bold">Features</th>
            <th className="p-6 font-bold text-right">Actions</th>
          </tr>
        </thead>
      <tbody>
        {plans.map((plan) => (
          <tr key={plan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-6">
              <div className="font-outfit font-bold text-white text-lg tracking-tight">{plan.name}</div>
              {plan.isPopular && (
                <span className="font-outfit uppercase tracking-wider font-bold text-[10px] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full mt-2 inline-block shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  Popular
                </span>
              )}
            </td>
            <td className="p-6">
              {(() => {
                const basePrice = plan.features
                  .filter((pf: any) => pf.isIncluded)
                  .reduce((sum: number, pf: any) => sum + (pf.feature?.price || 0), 0) * (plan.tenureYears || 1);
                
                const offerPrice = plan.discountPrice || basePrice;

                return (
                  <div className="flex flex-col gap-1">
                    <div className="font-space text-zinc-500 line-through text-xs font-bold">₹{basePrice.toLocaleString('en-IN')}</div>
                    <div className="font-space text-lg font-bold text-emerald-400">₹{offerPrice.toLocaleString('en-IN')}</div>
                  </div>
                );
              })()}
            </td>
            <td className="p-6 font-outfit text-zinc-400">{plan.validity || "-"}</td>
            <td className="p-6 font-outfit text-zinc-400"><span className="text-white font-bold">{plan.features.length}</span> assigned</td>
            <td className="p-6 text-right space-x-3">
              <Link
                href={`/admin/plans/${plan.id}`}
                className="inline-flex items-center justify-center p-2.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 transition-colors border border-white/5"
                title="Edit Plan"
              >
                <Edit2 size={16} />
              </Link>
              <button
                onClick={() => handleDelete(plan.id)}
                className="inline-flex items-center justify-center p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 transition-colors border border-red-500/20"
                title="Delete Plan"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
