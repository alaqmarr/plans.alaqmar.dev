"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScrollText, CheckCircle2, Clock, XCircle, AlertTriangle, Plus, ChevronDown, X } from "lucide-react";
import toast from "react-hot-toast";

const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function AgreementsListClient({
  agreements,
  clientsWithoutAgreement,
}: {
  agreements: any[];
  clientsWithoutAgreement: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedClientId) return toast.error("Please select a client.");
    setCreating(true);
    // Just navigate — the detail page auto-creates the agreement via getOrCreateAgreement
    router.push(`/admin/agreements/${selectedClientId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white tracking-tight">Agreements</h1>
          <p className="font-outfit text-zinc-400 mt-1 text-sm">Service agreements, signatures, and verification.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-outfit text-xs text-zinc-600">{agreements.length} agreement{agreements.length !== 1 ? "s" : ""}</span>
          {clientsWithoutAgreement.length > 0 && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              {showCreate ? <X size={14} /> : <Plus size={14} />}
              {showCreate ? "Cancel" : "Generate Agreement"}
            </button>
          )}
        </div>
      </div>

      {/* Create Panel */}
      {showCreate && (
        <div className="mb-6 bg-zinc-900/60 border border-emerald-500/20 rounded-2xl p-6 animate-in fade-in slide-in-from-top-4">
          <p className="font-outfit text-sm text-zinc-400 mb-4">
            Select a client to auto-generate their service agreement based on their plan and payment structure.
          </p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full appearance-none bg-zinc-950/70 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all pr-10"
              >
                <option value="">Select a client…</option>
                {clientsWithoutAgreement.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
            <button
              onClick={handleCreate}
              disabled={!selectedClientId || creating}
              className="font-outfit text-sm font-bold uppercase tracking-widest px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {creating ? "Opening…" : "Generate →"}
            </button>
          </div>
        </div>
      )}

      {agreements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ScrollText size={40} className="text-zinc-700 mb-4" />
          <p className="font-outfit text-zinc-500 text-sm">No agreements yet.</p>
          <p className="font-outfit text-zinc-600 text-xs mt-1">Click "Generate Agreement" above to create one for a client.</p>
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Client", "Plan", "Admin Signed", "Client Signed", "Verified", "Created", "Action"].map((h, i) => (
                  <th key={h} className={`font-outfit text-[10px] uppercase tracking-widest text-zinc-500 px-5 py-4 ${i < 2 || i === 5 ? "text-left" : "text-center"} ${i === 6 ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agreements.map((ag) => {
                const pendingVerification = ag.clientSignedAt && !ag.adminVerified;
                return (
                  <tr
                    key={ag.id}
                    className={`border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02] ${pendingVerification ? "bg-amber-500/5" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-outfit font-bold text-white text-sm">{ag.client.name}</div>
                      {ag.client.email && <div className="font-outfit text-zinc-500 text-xs mt-0.5">{ag.client.email}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-outfit text-xs text-zinc-400 bg-zinc-800 border border-white/5 px-2 py-1 rounded-lg">
                        {ag.client.plan?.name || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {ag.adminSignedAt ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <CheckCircle2 size={15} className="text-emerald-400" />
                          <span className="font-outfit text-[9px] text-zinc-500">{fmtDate(ag.adminSignedAt)}</span>
                        </div>
                      ) : (
                        <Clock size={15} className="text-zinc-700 mx-auto" />
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {ag.clientSignedAt ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <CheckCircle2 size={15} className="text-blue-400" />
                          <span className="font-outfit text-[9px] text-zinc-500">{ag.clientSignatoryName || "Signed"}</span>
                        </div>
                      ) : (
                        <Clock size={15} className="text-zinc-700 mx-auto" />
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {ag.adminVerified
                        ? <CheckCircle2 size={15} className="text-emerald-400 mx-auto" />
                        : ag.clientSignedAt
                        ? <AlertTriangle size={15} className="text-amber-400 mx-auto" />
                        : <XCircle size={15} className="text-zinc-700 mx-auto" />}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-outfit text-xs text-zinc-500">{fmtDate(ag.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/agreements/${ag.clientId}`}
                        className={`font-outfit text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${
                          pendingVerification
                            ? "text-amber-400 border-amber-500/30 hover:border-amber-400/50 hover:text-amber-300"
                            : "text-indigo-400 border-indigo-500/30 hover:border-indigo-400/50 hover:text-indigo-300"
                        }`}
                      >
                        {pendingVerification ? "⚠ Verify" : "Manage"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
