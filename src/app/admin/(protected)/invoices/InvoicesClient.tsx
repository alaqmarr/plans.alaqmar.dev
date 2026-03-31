"use client";

import Link from "next/link";
import { Download, FileText, User } from "lucide-react";

export default function InvoicesClient({ invoices }: { invoices: any[] }) {
  if (!invoices.length) {
    return <div className="p-8 text-center text-zinc-400 font-outfit">No official invoices have been generated yet.</div>;
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white/5 font-outfit text-xs uppercase tracking-widest text-zinc-500 border-b border-white/5">
              <th className="p-6 font-bold">Details</th>
              <th className="p-6 font-bold">Client</th>
              <th className="p-6 font-bold">Milestone</th>
              <th className="p-6 font-bold">Date Issued</th>
              <th className="p-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-105 transition-transform">
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="font-outfit font-bold text-white tracking-wide">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-emerald-400 font-extrabold text-sm tracking-wide mt-1">
                        ₹{invoice.amount.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-6 align-middle">
                  <div className="flex items-center gap-2 font-outfit">
                    <User size={14} className="text-zinc-500" />
                    <Link href={`/admin/clients/${invoice.clientId}`} className="text-zinc-300 hover:text-white font-medium hover:underline transition-all">
                      {invoice.client.name}
                    </Link>
                  </div>
                </td>
                <td className="p-6 font-outfit text-zinc-400 text-sm align-middle">
                  {invoice.milestoneName}
                </td>
                <td className="p-6 font-outfit text-zinc-400 text-sm align-middle">
                  {new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-6 align-middle">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={invoice.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-lg transition-all"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
