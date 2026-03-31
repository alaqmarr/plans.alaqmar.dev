"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Copy, CheckCircle2 } from "lucide-react";

export default function ClientsTable({ clients }: { clients: any[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyLink = (trackingId: string) => {
    const url = `${window.location.origin}/track/${trackingId}`;
    navigator.clipboard.writeText(url);
    setCopied(trackingId);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden relative shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-outfit">
          <thead className="bg-zinc-950/80 border-b border-white/10 uppercase tracking-widest text-[10px] text-zinc-500 font-bold">
            <tr>
              <th className="p-6 uppercase">Client Name</th>
              <th className="p-6 uppercase">Plan</th>
              <th className="p-6 uppercase">Offered Price</th>
              <th className="p-6 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <div className="font-bold text-white text-base tracking-wide flex items-center gap-3">
                    {client.name}
                  </div>
                  <div className="text-zinc-500 text-xs mt-1">
                    {client.phoneNumbers[0]} {client.phoneNumbers.length > 1 && `+${client.phoneNumbers.length - 1} more`}
                  </div>
                </td>
                <td className="p-6">
                  <span className="text-zinc-300 font-medium">{client.plan?.name || "Unknown"}</span>
                </td>
                <td className="p-6">
                  <span className="font-outfit font-bold text-emerald-400">
                    ₹{client.offeredPrice?.toLocaleString('en-IN')}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => copyLink(client.trackingLink)}
                      className="p-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
                      title="Copy Tracking Link"
                    >
                      {copied === client.trackingLink ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="p-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
                      title="Manage Client"
                    >
                      <Edit2 size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-zinc-500 font-medium">
                  No clients found. Add one to start tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
