"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Smartphone, Building2, CreditCard, Copy, Link as LinkIcon, BadgeCheck, Check, Box, MessageSquare, Plus, Send, ChevronDown, ChevronRight, Clock, X, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { createTicket, addTicketMessage } from "@/app/actions/tickets";

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  "in-progress": { label: "In Progress", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  resolved: { label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  closed: { label: "Closed", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
};

export default function PublicTrackerClient({ client, tickets, settings }: { client: any; tickets: any[]; settings: any }) {
  const storageKey = `client_auth_${client.trackingLink}`;
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(storageKey) === "true";
  });
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const input = password.trim();
    const phoneNumbers: string[] = client.phoneNumbers || [];

    // Check if input matches any of the client's phone numbers
    const match = phoneNumbers.some((num: string) => {
      const clean = num.replace(/[\s\-()]/g, "");
      const inputClean = input.replace(/[\s\-()]/g, "");
      return clean === inputClean;
    });

    if (match) {
      sessionStorage.setItem(storageKey, "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid password. Please try again.");
    }
  };

  // ─── Auth Gate ───
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-center w-14 h-14 bg-indigo-500/10 rounded-2xl mx-auto mb-6">
              <Lock size={24} className="text-indigo-400" />
            </div>
            <h2 className="font-outfit text-xl font-extrabold text-white text-center tracking-tight mb-1">
              Client Portal Access
            </h2>
            <p className="font-outfit text-sm text-zinc-400 text-center mb-6">
              Enter your password to access your project portal.
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
                  placeholder="Enter your password..."
                  autoFocus
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-center text-lg tracking-wider"
                />
                <p className="font-outfit text-[11px] text-zinc-500 mt-2 text-center">
                  Your password is your registered phone number including +91
                </p>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                  <p className="font-outfit text-sm text-red-400 font-bold">{authError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl font-outfit font-bold uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/20 transition-all"
              >
                Access Portal
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  let paymentStructure: any[] = [];
  try { paymentStructure = JSON.parse(client.paymentStructure || "[]"); } catch {}

  const currentDueIdx = paymentStructure.findIndex(s => !s.isPaid);
  const totalPaid = paymentStructure.filter(s => s.isPaid).reduce((sum, s) => sum + s.amount, 0);
  const totalAmount = client.offeredPrice;
  const progressPercent = Math.min(100, Math.round((totalPaid / totalAmount) * 100)) || 0;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const isCompleted = currentDueIdx === -1;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header Profile */}
      <div className="text-center space-y-4">
        <h1 className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Welcome, {client.name}
        </h1>
        <p className="font-outfit text-zinc-400 max-w-2xl mx-auto text-lg">
          Track the development progress and payment milestones for your <strong className="text-white">{client.plan?.name}</strong>.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          <div className="text-xs font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-2">Total Paid</div>
          <div className="text-3xl font-outfit font-extrabold text-white mb-4">₹{totalPaid.toLocaleString('en-IN')} <span className="text-base text-zinc-500 font-medium">/ ₹{totalAmount.toLocaleString('en-IN')}</span></div>
          
          <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex items-center">
          <div>
            <div className="text-xs font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-2">Status</div>
            {isCompleted ? (
              <div className="flex items-center gap-3 text-emerald-400">
                <BadgeCheck size={36} />
                <span className="font-outfit text-2xl font-bold">Payments Complete</span>
              </div>
            ) : (
              <div className="font-outfit text-2xl font-bold text-white">
                Next Installment: <span className="text-amber-400">₹{paymentStructure[currentDueIdx]?.amount.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Features Section */}
      {client.plan?.features && client.plan.features.length > 0 && (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative shadow-2xl">
          <h3 className="font-outfit text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
            <Box className="text-indigo-400" /> Plan Included Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {client.plan.features.filter((pf: any) => pf.isIncluded || !client.plan.price).map((pf: any) => (
              <div key={pf.id} className="flex items-start gap-3 bg-zinc-950/30 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="bg-emerald-500/15 p-1.5 rounded-full mt-0.5 shrink-0">
                  <Check size={14} className="text-emerald-400" />
                </div>
                <div>
                  <div className="font-outfit text-sm text-zinc-200 font-bold tracking-wide leading-snug">{pf.feature.name}</div>
                  {pf.customValue && (
                    <div className="text-[10px] text-zinc-500 mt-1 font-outfit font-bold uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded border border-white/5 inline-block">{pf.customValue}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Payment Timeline */}
        <div className="lg:col-span-7 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative shadow-2xl">
          <h3 className="font-outfit text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
            <CreditCard className="text-indigo-400" /> Milestone Tracker
          </h3>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-white/5 before:to-transparent">
            {paymentStructure.map((step, idx) => {
              const isPaid = step.isPaid;
              const isActive = idx === currentDueIdx;

              return (
                <div key={idx} className={`relative flex gap-6 ${isActive ? 'opacity-100' : isPaid ? 'opacity-70' : 'opacity-40'}`}>
                  {/* Dot */}
                  <div className={`flex items-center justify-center w-9 h-9 rounded-full border-4 border-[#121214] shrink-0 z-10 transition-colors
                    ${isPaid ? 'bg-emerald-500 text-white' : isActive ? 'bg-amber-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}>
                    {isPaid ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-outfit font-bold text-white text-lg">{step.name}</h4>
                        <div className={`font-outfit font-bold ${isPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                           ₹{step.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      
                      {isPaid ? (
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Paid</span>
                          
                          <div className="flex items-center gap-2">
                            {step.screenshotUrl && (
                              <a href={step.screenshotUrl} target="_blank" rel="noreferrer" className="text-[11px] font-outfit text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/5">
                                <LinkIcon size={12} /> Payment Proof
                              </a>
                            )}
                            
                            {step.invoiceUrl && (
                              <a href={step.invoiceUrl} target="_blank" rel="noreferrer" className="text-[11px] font-outfit text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-md border border-emerald-500/20">
                                <LinkIcon size={12} /> Official Invoice
                              </a>
                            )}
                          </div>
                        </div>
                      ) : isActive && (
                        <div className="mt-5 pt-5 border-t border-white/5 animate-in fade-in">
                          {step.isRequested !== false ? (
                            <>
                              <p className="text-sm font-outfit text-zinc-400 mb-6 leading-relaxed">Please transfer the due amount using any preferred UPI app or manual bank transfer below to unlock the next milestone.</p>
                              
                              {settings.upiId ? (
                                <a 
                                  href={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.bankAccountName || "THE WEB SENSEI")}&am=${step.amount}&cu=INR`}
                                  className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-outfit font-extrabold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 uppercase tracking-widest text-sm border border-emerald-400/20"
                                >
                                  <Smartphone size={20} className="animate-pulse" /> Pay ₹{step.amount.toLocaleString('en-IN')} via UPI
                                </a>
                              ) : (
                                <div className="text-xs font-outfit text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20 inline-block">UPI payment not configured. Use bank details below.</div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-3 text-zinc-400 font-outfit bg-zinc-900/50 p-4 rounded-xl border border-white/5 w-max">
                              <Circle size={16} className="text-zinc-500" />
                              <span className="font-semibold tracking-wide">Payment not yet required.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank & Details Panel */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 relative shadow-2xl">
            <h3 className="font-outfit text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
              <Building2 className="text-indigo-400" /> Bank Transfer
            </h3>
            
            <div className="space-y-4">
              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">Account Name</div>
                  <div className="font-outfit font-medium text-white">{settings.bankAccountName || "THE WEB SENSEI"}</div>
                </div>
                <button onClick={() => handleCopy(settings.bankAccountName || "THE WEB SENSEI")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>

              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">Account Number</div>
                  <div className="font-outfit font-medium text-white text-lg tracking-wider">{settings.bankAccountNumber || "Not configured"}</div>
                </div>
                <button onClick={() => handleCopy(settings.bankAccountNumber || "")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>

              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">IFSC Code</div>
                  <div className="font-outfit font-medium text-white tracking-widest uppercase">{settings.bankIfsc || "Not configured"}</div>
                </div>
                <button onClick={() => handleCopy(settings.bankIfsc || "")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>
              
              <div className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                <div>
                  <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">UPI ID</div>
                  <div className="font-outfit font-medium text-indigo-400">{settings.upiId || "Not configured"}</div>
                </div>
                <button onClick={() => handleCopy(settings.upiId || "")} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Copy size={14}/></button>
              </div>
            </div>
            
            <p className="text-xs font-outfit text-zinc-500 mt-6 leading-relaxed">
              If you pay manually via Bank IMPS/NEFT, please Whatsapp the screenshot to the team so we can update your tracking portal.
            </p>
          </div>

        </div>
      </div>

      {/* ═══ Support Tickets Section ═══ */}
      <SupportSection client={client} tickets={tickets} />
    </div>
  );
}

// ═══ Separate Support Section Component ═══
function SupportSection({ client, tickets }: { client: any; tickets: any[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setCreating(true);
    try {
      await createTicket({
        clientId: client.id,
        subject: subject.trim(),
        description: description.trim(),
        createdBy: "client",
      });
      toast.success("Ticket submitted! We'll get back to you soon.");
      setSubject("");
      setDescription("");
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Failed to create ticket.");
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    const text = replyTexts[ticketId]?.trim();
    if (!text) return;

    setSendingReply(ticketId);
    try {
      await addTicketMessage({ ticketId, sender: "client", message: text });
      setReplyTexts((prev) => ({ ...prev, [ticketId]: "" }));
      toast.success("Reply sent!");
      router.refresh();
    } catch {
      toast.error("Failed to send reply.");
    } finally {
      setSendingReply(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-outfit text-xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <MessageSquare size={22} className="text-indigo-400" /> Support
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="font-outfit text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
        >
          {showForm ? <><X size={12} /> Cancel</> : <><Plus size={12} /> New Ticket</>}
        </button>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <form onSubmit={handleCreateTicket} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div>
            <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Briefly describe your issue..."
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div>
            <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Tell us more about the issue..."
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-outfit font-bold uppercase tracking-widest text-sm rounded-xl transition-colors disabled:opacity-50"
          >
            {creating ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      )}

      {/* Ticket List */}
      {tickets.length === 0 && !showForm ? (
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-10 text-center">
          <MessageSquare size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="font-outfit text-zinc-500 text-sm">No support tickets yet. Create one if you need help!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = STATUS_BADGE[ticket.status] || STATUS_BADGE.open;
            const isExpanded = expandedTicket === ticket.id;

            return (
              <div key={ticket.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all">
                {/* Ticket Header */}
                <button
                  onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                  className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <h4 className="font-outfit font-bold text-white text-sm truncate">{ticket.subject}</h4>
                    <p className="font-outfit text-xs text-zinc-500 mt-1 flex items-center gap-2">
                      <Clock size={10} /> {new Date(ticket.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      <span>•</span>
                      <MessageSquare size={10} /> {ticket._count?.messages || ticket.messages?.length || 0} messages
                    </p>
                  </div>
                  <div className="shrink-0 text-zinc-500 mt-1">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </button>

                {/* Expanded Conversation */}
                {isExpanded && (
                  <div className="border-t border-white/5">
                    <div className="p-5 space-y-3 max-h-[350px] overflow-y-auto">
                      {ticket.messages?.map((msg: any) => {
                        const isClient = msg.sender === "client";
                        return (
                          <div key={msg.id} className={`flex gap-3 ${isClient ? "flex-row-reverse" : ""}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                              isClient ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                              {isClient ? "Y" : "S"}
                            </div>
                            <div className={`max-w-[75%] ${isClient ? "text-right" : ""}`}>
                              <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm font-outfit ${
                                isClient
                                  ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100"
                                  : "bg-zinc-800/50 border border-white/5 text-zinc-200"
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                              </div>
                              <div className="font-outfit text-[10px] text-zinc-600 mt-1 px-1">
                                {isClient ? "You" : "Support"} • {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Box */}
                    {ticket.status !== "closed" && (
                      <div className="border-t border-white/5 p-4 flex gap-3">
                        <input
                          value={replyTexts[ticket.id] || ""}
                          onChange={(e) => setReplyTexts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Type your reply..."
                          className="flex-1 bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-outfit text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(ticket.id); } }}
                        />
                        <button
                          onClick={() => handleReply(ticket.id)}
                          disabled={sendingReply === ticket.id || !replyTexts[ticket.id]?.trim()}
                          className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-4 py-2.5 font-outfit font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    )}

                    {ticket.status === "closed" && (
                      <div className="border-t border-white/5 p-3 text-center font-outfit text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                        This ticket is closed
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
