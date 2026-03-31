"use client";

import { useState, useMemo } from "react";
import { Send, Copy, CheckCircle2 } from "lucide-react";

export default function MessagesClient({ clients }: { clients: any[] }) {
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedPhone, setSelectedPhone] = useState("");
  const [template, setTemplate] = useState("advance");
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const client = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  // Reset secondary selections when client changes
  useMemo(() => {
    if (client) {
      setSelectedPhone(client.phoneNumbers[0] || "");
      setSelectedMilestoneIdx(null);
    } else {
      setSelectedPhone("");
    }
  }, [client]);

  let paymentStructure: any[] = [];
  if (client) {
    try { paymentStructure = JSON.parse(client.paymentStructure || "[]"); } catch {}
  }

  const trackingLink = client ? `${typeof window !== "undefined" ? window.location.origin : ""}/track/${client.trackingLink}` : "";
  const advanceAmount = paymentStructure.length > 0 ? paymentStructure[0].amount : 0;
  
  const unpaidMilestones = paymentStructure.map((step, idx) => ({ ...step, idx })).filter(step => !step.isPaid);

  const messageText = useMemo(() => {
    if (!client) return "";

    const formatRupee = (amt: number) => `*₹${amt.toLocaleString('en-IN')}*`;

    if (template === "advance") {
      return `Hello *${client.name}*! 👋\n\nThank you for choosing *THE WEB SENSEI* for your _${client.plan?.name || 'Project'}_. We are thrilled to partner with you and bring your vision to life! 🚀\n\n📌 *Project Overview:*\n• Total Agreed Investment: ${formatRupee(client.offeredPrice || 0)}\n• Advance Required: ${formatRupee(advanceAmount)}\n\nTo officially kick off the development phase, please process the advance payment using your personalized, secure tracking portal below:\n\n🔗 ${trackingLink}\n\n💡 _Tip: You can always use this link to track your payment milestones, download receipts, and monitor progress securely anytime._\n\nLooking forward to an amazing journey together! ✨`;
    }
    else if (template === "reminder") {
      const ms = selectedMilestoneIdx !== null ? paymentStructure[selectedMilestoneIdx] : null;
      if (!ms) return `Please select a specific unpaid milestone from the dropdown to generate this reminder.`;

      return `Hello *${client.name}*! 👋\n\nThis is a friendly reminder regarding your _${client.plan?.name || 'Project'}_. \n\nThe payment for the milestone *"${ms.name}"* is currently due.\n\n💰 *Amount Due:* ${formatRupee(ms.amount)}\n\nPlease process the payment securely using your personal tracking portal:\n🔗 ${trackingLink}\n\nLet us know once the transfer is completed so we can attach the official receipt to your portal. Thank you! 🙏`;
    }
    else if (template === "completion") {
      return `Hello *${client.name}*! 🎉\n\nGreat news! Your _${client.plan?.name || 'Project'}_ development is officially *COMPLETE* and has been made live! 🌐✨\n\nThank you for trusting *THE WEB SENSEI* with your digital presence. It has been an absolute pleasure working with you, and we sincerely hope you love the final result!\n\nIf there are any remaining payments, please clear them via your portal:\n🔗 ${trackingLink}\n\nWe would love to collaborate with you again in the future! Let us know if you need any further assistance or maintenance support.\n\nBest Wishes, \n*THE WEB SENSEI* 🚀`;
    }
    
    return "";
  }, [client, template, advanceAmount, trackingLink, selectedMilestoneIdx, paymentStructure]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    if (!client || !selectedPhone) return alert("Select a client and phone number first");
    
    // clean phone number
    const cleanPhone = selectedPhone.replace(/\D/g, ''); 
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Configuration Sidebar */}
      <div className="lg:col-span-5 border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 relative shadow-xl space-y-6">
        <h3 className="font-outfit text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Message Configuration</h3>

        <div>
          <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Select Client</label>
          <select 
            value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}
            className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-outfit"
          >
            <option value="">-- Choose Client --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.plan?.name})</option>
            ))}
          </select>
        </div>

        {client && (
          <div>
            <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Phone Number</label>
            <select 
              value={selectedPhone} onChange={e => setSelectedPhone(e.target.value)}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-outfit"
            >
              {client.phoneNumbers.map((p: string, i: number) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Message Template</label>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => setTemplate("advance")}
              className={`p-4 border rounded-xl text-left transition-all ${template === "advance" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-zinc-950/50 border-white/5 text-zinc-400 hover:border-white/10"}`}
            >
              <div className="font-outfit font-bold text-sm mb-1">Details & Advance</div>
              <div className="text-xs opacity-70">Initial kickoff, shares total price and tracking link.</div>
            </button>
            <button 
              onClick={() => setTemplate("reminder")}
              className={`p-4 border rounded-xl text-left transition-all ${template === "reminder" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-zinc-950/50 border-white/5 text-zinc-400 hover:border-white/10"}`}
            >
              <div className="font-outfit font-bold text-sm mb-1">Milestone Reminder</div>
              <div className="text-xs opacity-70">Reminds client of a specific unpaid milestone.</div>
            </button>
            <button 
              onClick={() => setTemplate("completion")}
              className={`p-4 border rounded-xl text-left transition-all ${template === "completion" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-zinc-950/50 border-white/5 text-zinc-400 hover:border-white/10"}`}
            >
              <div className="font-outfit font-bold text-sm mb-1">Project Complete</div>
              <div className="text-xs opacity-70">Notifies client that the site is live.</div>
            </button>
          </div>
        </div>

        {template === "reminder" && client && (
          <div className="pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
            <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Select Unpaid Milestone</label>
            <select 
              value={selectedMilestoneIdx === null ? "" : selectedMilestoneIdx} 
              onChange={e => setSelectedMilestoneIdx(e.target.value === "" ? null : parseInt(e.target.value))}
              className="w-full bg-zinc-950/50 border border-amber-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-all font-outfit"
            >
              <option value="">-- Choose Milestone --</option>
              {unpaidMilestones.map(ms => (
                <option key={ms.idx} value={ms.idx}>{ms.name} (₹{ms.amount.toLocaleString('en-IN')})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Preview & Send Window */}
      <div className="lg:col-span-7 border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 relative shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-outfit text-sm font-bold uppercase tracking-widest text-zinc-500">Preview</h3>
          <button 
            onClick={copyToClipboard}
            disabled={!client}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all font-outfit text-xs font-bold disabled:opacity-50"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="flex-1 bg-[#0b141a] rounded-xl p-4 md:p-8 min-h-[300px] border border-white/5 whitespace-pre-wrap font-outfit text-zinc-300 leading-relaxed shadow-inner overflow-y-auto">
          {client ? (
            messageText
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 font-medium">
              Select a client to preview the message.
            </div>
          )}
        </div>

        <div className="pt-6 mt-auto flex justify-end">
          <button 
            onClick={openWhatsApp}
            disabled={!client || (template === "reminder" && selectedMilestoneIdx === null)}
            className="font-outfit px-8 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-[#0b141a] rounded-xl font-extrabold uppercase tracking-widest text-sm shadow-lg shadow-[#25D366]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
