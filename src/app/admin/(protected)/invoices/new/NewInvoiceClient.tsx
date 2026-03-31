"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, ChevronDown, FileText, UploadCloud, Link as LinkIcon } from "lucide-react";

import { useConfirm } from "@/providers/ConfirmProvider";
import { updateClient } from "@/app/actions/clients";
import { createInvoice } from "@/app/actions/invoices";
import { generateReactElementToPdfBlob, exportReactElementToPdf } from "@/lib/pdfGenerator";
import PrintableInvoice from "@/components/pdf/PrintableInvoice";

export default function NewInvoiceClient({ clients, settings }: { clients: any[], settings: any }) {
  const router = useRouter();
  const confirm = useConfirm();

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Client
  const client = useMemo(() => clients.find(c => c.id === selectedClientId), [selectedClientId, clients]);
  
  // Parse Milestones
  const paymentStructure = useMemo(() => {
    if (!client?.paymentStructure) return [];
    try {
      return JSON.parse(client.paymentStructure);
    } catch {
      return [];
    }
  }, [client]);

  // Active Milestone Details
  const milestoneIdx = selectedMilestoneIdx !== "" ? parseInt(selectedMilestoneIdx) : null;
  const activeMilestone = milestoneIdx !== null ? paymentStructure[milestoneIdx] : null;

  // Generate safe dynamic invoice number for frontend preview tracking
  const invoiceNumber = useMemo(() => `TWS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`, [selectedClientId, selectedMilestoneIdx]);

  const existingInvoiceWarning = activeMilestone?.invoiceUrl;

  const handleCreateAndAttach = async () => {
    if (!client || milestoneIdx === null || !activeMilestone) return;

    if (existingInvoiceWarning) {
      const confirmed = await confirm({
        title: "Overwrite Existing Invoice?",
        message: "An official invoice document already exists for this exact milestone. This action will revoke the previous invoice link and replace it globally. Proceed?",
        destructive: true
      });
      if (!confirmed) return;
    }

    setIsGenerating(true);
    const msName = activeMilestone.name;
    const msAmt = activeMilestone.amount;

    // Craft Document
    const element = <PrintableInvoice 
      invoiceNumber={invoiceNumber}
      date={new Date()}
      clientName={client.name}
      items={[{ description: `Website Development | ${msName}`, qty: 1, price: msAmt, total: msAmt }]}
      subtotal={msAmt}
      discount={0}
      grandTotal={msAmt}
      bankDetails={{
        payeeName: process.env.NEXT_PUBLIC_BANK_PAYEE || settings?.bankAccountName || "THE WEB SENSEI",
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || "INDUSIND BANK",
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACC || settings?.bankAccountNumber || "159618443558",
        ifsc: process.env.NEXT_PUBLIC_BANK_IFSC || settings?.bankIfsc || "INDB0000290"
      }}
      contact={{
        phone: "+91 96184 43558",
        email: "info@alaqmar.dev",
        website: "https://alaqmar.dev"
      }}
    />;

    try {
      // 1. Generate local blob
      const blob = await generateReactElementToPdfBlob(element);
      const file = new File([blob], `Invoice_${client.name.replace(/[^a-zA-Z0-9]/g, '_')}_${msName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, { type: "application/pdf" });
      
      // 2. Upload to Server / R2
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("folder", "invoices");
      formData.append("filename", file.name);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("R2 Node Upload Exception");
      
      const { url } = await res.json();

      // 3. Sync Database Record using custom DB sequential override handled inside createInvoice
      // Note: createInvoice implicitly utilizes local sequence counts for permanent DB logs if we omit number,
      // but the physical PDF file embodies the visual number we passed matching `invoiceNumber`.
      const newStructure = [...paymentStructure];
      newStructure[milestoneIdx].invoiceUrl = url;

      // Update Client Json
      await updateClient(client.id, {
        paymentStructure: JSON.stringify(newStructure)
      });

      // Write Invoice Entry
      await createInvoice({
        clientId: client.id,
        milestoneName: msName,
        amount: msAmt,
        fileUrl: url
      });

      toast.success("Golden Invoice uniquely generated, securely transferred, and successfully mapped!");
      router.push("/admin/invoices");

    } catch (e) {
      console.error(e);
      toast.error("An error interrupted the Invoice pipeline!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadOnly = async () => {
    if (!client || milestoneIdx === null || !activeMilestone) return;

    setIsGenerating(true);
    const msName = activeMilestone.name;
    const msAmt = activeMilestone.amount;

    const element = <PrintableInvoice 
      invoiceNumber={invoiceNumber}
      date={new Date()}
      clientName={client.name}
      items={[{ description: `Website Development | ${msName}`, qty: 1, price: msAmt, total: msAmt }]}
      subtotal={msAmt}
      discount={0}
      grandTotal={msAmt}
      bankDetails={{
        payeeName: process.env.NEXT_PUBLIC_BANK_PAYEE || settings?.bankAccountName || "THE WEB SENSEI",
        bankName: process.env.NEXT_PUBLIC_BANK_NAME || "INDUSIND BANK",
        accountNumber: process.env.NEXT_PUBLIC_BANK_ACC || settings?.bankAccountNumber || "159618443558",
        ifsc: process.env.NEXT_PUBLIC_BANK_IFSC || settings?.bankIfsc || "INDB0000290"
      }}
      contact={{
        phone: "+91 96184 43558",
        email: "info@alaqmar.dev",
        website: "https://alaqmar.dev"
      }}
    />;

    try {
      toast.loading("Rendering PDF for local download...", { id: "dl" });
      await exportReactElementToPdf(element, `Invoice_${client.name.replace(/[^a-zA-Z0-9]/g, '_')}_${msName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      toast.success("Downloaded Successfully!", { id: "dl" });
    } catch {
      toast.error("Failed to generate PDF.", { id: "dl" });
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Controls Form */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl space-y-8">
        <div>
          <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">1. Target Client Workspace</label>
          <div className="relative">
            <select
              value={selectedClientId}
              onChange={(e) => { setSelectedClientId(e.target.value); setSelectedMilestoneIdx(""); }}
              className="w-full appearance-none bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit shadow-inner focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="">Select a specific client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} • ₹{c.offeredPrice.toLocaleString()} {c.email ? `• ${c.email}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {client && (
          <div className="animate-in fade-in slide-in-from-top-4">
            <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">2. Corresponding Contract Milestone</label>
            <div className="relative">
              <select
                value={selectedMilestoneIdx}
                onChange={(e) => setSelectedMilestoneIdx(e.target.value)}
                className="w-full appearance-none bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit shadow-inner focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="">Select an active payment phase...</option>
                {paymentStructure.map((m: any, idx: number) => (
                  <option key={idx} value={idx}>
                    {m.name} [₹{m.amount.toLocaleString()}] {m.isPaid ? "✅ (Paid)" : "⏳ (Active)"} {m.invoiceUrl ? "📝 (Document Exists)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
            
            {existingInvoiceWarning && selectedMilestoneIdx !== "" && (
              <div className="mt-4 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-4">
                <FileText className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div className="font-outfit">
                  <h4 className="font-bold text-amber-500 text-sm mb-1">Invoice Exists against Milestone</h4>
                  <p className="text-amber-500/80 text-xs">An invoice was previously issued specifically for this phase. Running generator will override the previous file internally.</p>
                  <a href={existingInvoiceWarning} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-widest mt-2">
                    <LinkIcon size={12} /> View Existing Record
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            disabled={!client || milestoneIdx === null || isGenerating}
            onClick={handleCreateAndAttach}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-outfit font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <UploadCloud size={20} className="animate-bounce" /> Processing Architecture...
              </span>
            ) : (
              <>
                {existingInvoiceWarning ? "Revoke & Regenerate Override" : "Finalize & Map Invoice"}
              </>
            )}
            
            {/* Shimmer Effect */}
            {!isGenerating && <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />}
          </button>

          <button
            disabled={!client || milestoneIdx === null || isGenerating}
            onClick={handleDownloadOnly}
            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 rounded-xl font-outfit font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Export PDF Locally Only
          </button>
        </div>
      </div>

      {/* Visual Live Representation Map */}
      <div className="sticky top-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center">
        <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 self-start w-full border-b border-white/5 pb-4">Live Template Preview Scale</h3>
        
        {activeMilestone && client ? (
          <div className="relative border shadow-outline transform-gpu transition-all" style={{ 
            width: '800px', 
            transform: 'scale(0.55)', 
            transformOrigin: 'top center',
            marginBottom: '-40%'  // Compensation for CSS scale space reservation
          }}>
            <PrintableInvoice 
              invoiceNumber={invoiceNumber}
              date={new Date()}
              clientName={client.name}
              items={[{ description: `Website Development | ${activeMilestone.name}`, qty: 1, price: activeMilestone.amount, total: activeMilestone.amount }]}
              subtotal={activeMilestone.amount}
              discount={0}
              grandTotal={activeMilestone.amount}
              bankDetails={{
                payeeName: process.env.NEXT_PUBLIC_BANK_PAYEE || settings?.bankAccountName || "THE WEB SENSEI",
                bankName: process.env.NEXT_PUBLIC_BANK_NAME || "INDUSIND BANK",
                accountNumber: process.env.NEXT_PUBLIC_BANK_ACC || settings?.bankAccountNumber || "159618443558",
                ifsc: process.env.NEXT_PUBLIC_BANK_IFSC || settings?.bankIfsc || "INDB0000290"
              }}
              contact={{
                phone: "+91 96184 43558",
                email: "info@alaqmar.dev",
                website: "https://alaqmar.dev"
              }}
            />
          </div>
        ) : (
          <div className="w-full flex-1 min-h-[400px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl text-zinc-600 font-outfit font-bold uppercase tracking-widest text-sm">
            Select Milestone to Initialize Scaled Preview
          </div>
        )}
      </div>
    </div>
  );
}
