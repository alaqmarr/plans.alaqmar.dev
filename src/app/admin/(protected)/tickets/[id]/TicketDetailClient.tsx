"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Send, ChevronDown, User, Shield } from "lucide-react";
import { updateTicketStatus, addTicketMessage } from "@/app/actions/tickets";

const STATUS_OPTIONS = [
  { value: "open", label: "Open", color: "text-blue-400" },
  { value: "in-progress", label: "In Progress", color: "text-amber-400" },
  { value: "resolved", label: "Resolved", color: "text-emerald-400" },
  { value: "closed", label: "Closed", color: "text-zinc-400" },
];

export default function TicketDetailClient({ ticket }: { ticket: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      router.refresh();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      await addTicketMessage({
        ticketId: ticket.id,
        sender: "admin",
        message: replyText.trim(),
      });
      setReplyText("");
      toast.success("Reply sent!");
      router.refresh();
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/tickets"
            className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2 mb-4"
          >
            <ArrowLeft size={14} /> Back to Tickets
          </Link>
          <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">{ticket.subject}</h1>
          <p className="font-outfit text-sm text-zinc-500 mt-1">
            Client: <span className="text-zinc-300 font-bold">{ticket.client?.name}</span> • 
            Created {new Date(ticket.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* Status Selector */}
        <div className="relative shrink-0">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="appearance-none bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-white font-outfit font-bold text-xs uppercase tracking-widest focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Message Thread */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {ticket.messages.map((msg: any) => {
            const isAdmin = msg.sender === "admin";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isAdmin ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                }`}>
                  {isAdmin ? <Shield size={14} /> : <User size={14} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] ${isAdmin ? "text-right" : ""}`}>
                  <div className={`inline-block rounded-2xl px-4 py-3 text-sm font-outfit ${
                    isAdmin
                      ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100"
                      : "bg-zinc-800/50 border border-white/5 text-zinc-200"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <div className="font-outfit text-[10px] text-zinc-600 mt-1 px-1">
                    {isAdmin ? "You" : ticket.client?.name} • {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · {new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        {ticket.status !== "closed" && (
          <form onSubmit={handleReply} className="border-t border-white/5 p-4 flex gap-3">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              className="flex-1 bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-5 py-3 font-outfit font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={14} /> Send
            </button>
          </form>
        )}

        {ticket.status === "closed" && (
          <div className="border-t border-white/5 p-4 text-center font-outfit text-xs text-zinc-500 font-bold uppercase tracking-widest">
            This ticket is closed
          </div>
        )}
      </div>
    </div>
  );
}
