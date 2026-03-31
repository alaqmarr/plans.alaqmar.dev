"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Filter, ChevronDown, MessageSquare, Clock, AlertCircle, CheckCircle2, X } from "lucide-react";
import { createTicket } from "@/app/actions/tickets";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  "in-progress": { label: "In Progress", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  resolved: { label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  closed: { label: "Closed", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-zinc-400" },
  normal: { label: "Normal", color: "text-blue-400" },
  high: { label: "High", color: "text-amber-400" },
  urgent: { label: "Urgent", color: "text-red-400" },
};

export default function TicketsClient({ tickets, clients }: { tickets: any[]; clients: any[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [newClientId, setNewClientId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("normal");

  const filtered = statusFilter === "all" ? tickets : tickets.filter((t) => t.status === statusFilter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId || !newSubject.trim() || !newDescription.trim()) return;

    setCreating(true);
    try {
      await createTicket({
        clientId: newClientId,
        subject: newSubject.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        createdBy: "admin",
      });
      toast.success("Ticket created!");
      setShowCreateModal(false);
      setNewClientId("");
      setNewSubject("");
      setNewDescription("");
      setNewPriority("normal");
      router.refresh();
    } catch {
      toast.error("Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    "in-progress": tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  return (
    <>
      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {(["all", "open", "in-progress", "resolved", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`font-outfit text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${
              statusFilter === s
                ? "bg-white/10 border-white/20 text-white"
                : "border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
            }`}
          >
            {s === "all" ? "All" : STATUS_CONFIG[s]?.label} ({counts[s]})
          </button>
        ))}

        <button
          onClick={() => setShowCreateModal(true)}
          className="ml-auto font-outfit text-xs font-bold uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> New Ticket
        </button>
      </div>

      {/* Tickets List */}
      {filtered.length === 0 ? (
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center">
          <MessageSquare size={40} className="text-zinc-700 mx-auto mb-4" />
          <p className="font-outfit text-zinc-500 font-bold">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
            const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;
            const timeAgo = getTimeAgo(new Date(ticket.updatedAt));

            return (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="block bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                    <h3 className="font-outfit font-bold text-white text-sm group-hover:text-indigo-400 transition-colors truncate">
                      {ticket.subject}
                    </h3>
                    <p className="font-outfit text-xs text-zinc-500 mt-1 truncate">{ticket.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-outfit text-xs font-bold text-zinc-400">{ticket.client?.name}</div>
                    <div className="font-outfit text-[10px] text-zinc-600 mt-1 flex items-center gap-1 justify-end">
                      <Clock size={10} /> {timeAgo}
                    </div>
                    <div className="font-outfit text-[10px] text-zinc-600 mt-1 flex items-center gap-1 justify-end">
                      <MessageSquare size={10} /> {ticket._count?.messages || 0} replies
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <form
            onSubmit={handleCreate}
            className="relative bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-outfit text-xl font-extrabold text-white">Create Ticket</h2>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Client</label>
              <div className="relative">
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  required
                  className="w-full appearance-none bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
                >
                  <option value="">Select client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Subject</label>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                required
                placeholder="Brief issue summary..."
                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
                rows={4}
                placeholder="Describe the issue in detail..."
                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>

            <div>
              <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Priority</label>
              <div className="flex gap-2">
                {(["low", "normal", "high", "urgent"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPriority(p)}
                    className={`font-outfit text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${
                      newPriority === p
                        ? `${PRIORITY_CONFIG[p].color} bg-white/5 border-white/20`
                        : "text-zinc-600 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-white text-black font-outfit font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Ticket"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
