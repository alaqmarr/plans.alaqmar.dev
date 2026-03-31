"use client";

import { useState } from "react";
import { updateClient, deleteClient } from "@/app/actions/clients";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Copy, UploadCloud, X, Link as LinkIcon, Trash2, BellRing, BellOff } from "lucide-react";

export default function ClientDetailClient({ client }: { client: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  let paymentStructure: any[] = [];
  try {
    paymentStructure = JSON.parse(client.paymentStructure || "[]");
  } catch {}

  const trackingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/track/${client.trackingLink}`;

  const copyLink = () => {
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openUploadModal = (idx: number) => {
    setSelectedMilestoneIdx(idx);
    setUploadFile(null);
    setIsModalOpen(true);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || selectedMilestoneIdx === null) return;
    
    setUploading(true);
    try {
      // 1. Upload to R2
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();

      // 2. Update DB JSON structure
      const newStructure = [...paymentStructure];
      newStructure[selectedMilestoneIdx].isPaid = true;
      newStructure[selectedMilestoneIdx].screenshotUrl = url;

      await updateClient(client.id, {
        paymentStructure: JSON.stringify(newStructure)
      });
      
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to confirm payment");
    } finally {
      setUploading(false);
    }
  };

  const markUnpaid = async (idx: number) => {
    if (!confirm("Are you sure you want to mark this as unpaid? This will remove the attached screenshot.")) return;
    
    setLoading(true);
    try {
      const newStructure = [...paymentStructure];
      newStructure[idx].isPaid = false;
      delete newStructure[idx].screenshotUrl; // Remove the URL link
      
      await updateClient(client.id, {
        paymentStructure: JSON.stringify(newStructure)
      });
      router.refresh();
    } catch {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const toggleRequested = async (idx: number) => {
    setLoading(true);
    try {
      const newStructure = [...paymentStructure];
      newStructure[idx].isRequested = !newStructure[idx].isRequested;
      
      await updateClient(client.id, {
        paymentStructure: JSON.stringify(newStructure)
      });
      router.refresh();
    } catch {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) return;
    setLoading(true);
    try {
      await deleteClient(client.id);
      router.push("/admin/clients");
    } catch {
      alert("Failed to delete client");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Overview Block */}
      <div className="lg:col-span-1 border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 relative shadow-xl">
        <h3 className="font-outfit text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Client Info</h3>
        
        <div className="space-y-4">
          <div>
            <div className="text-zinc-500 text-xs font-outfit tracking-wider uppercase mb-1">Email</div>
            <div className="text-white font-medium">{client.email || "N/A"}</div>
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-outfit tracking-wider uppercase mb-1">Phones</div>
            {client.phoneNumbers.map((p: string, i: number) => (
              <div key={i} className="text-white font-medium">{p}</div>
            ))}
          </div>
          <div>
            <div className="text-zinc-500 text-xs font-outfit tracking-wider uppercase mb-2">Tracking Portal</div>
            <div className="flex items-center gap-2">
              <input 
                readOnly value={trackingUrl} 
                className="w-full bg-zinc-950/50 border border-white/5 rounded-lg px-3 py-2 text-zinc-300 text-sm focus:outline-none" 
              />
              <button onClick={copyLink} className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg transition-all" title="Copy tracking link">
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        <button 
          onClick={handleDeleteClient}
          disabled={loading}
          className="mt-8 w-full font-outfit text-[10px] font-bold tracking-widest uppercase py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 size={14} /> Delete Client
        </button>
      </div>

      {/* Payment Structure */}
      <div className="lg:col-span-2 border border-white/5 bg-zinc-900/50 backdrop-blur-xl rounded-2xl p-6 relative shadow-xl">
        <h3 className="font-outfit text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Payment Milestones</h3>
        
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent">
          {paymentStructure.map((step, idx) => {
            const isPaid = step.isPaid;
            
            return (
              <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Timeline dot */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 transition-colors
                  ${isPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {isPaid ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-zinc-950/50 transition-all font-outfit 
                    border-white/5 hover:border-white/10 group-even:text-right">
                  <div className="font-bold text-white text-lg">{step.name}</div>
                  <div className="text-emerald-400 font-bold mb-3 tracking-wide">₹{step.amount.toLocaleString('en-IN')}</div>
                  
                  {isPaid ? (
                    <div className="flex flex-col gap-2 md:items-start group-even:md:items-end">
                      <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-bold uppercase tracking-wider">Paid</span>
                      {step.screenshotUrl && (
                        <a href={step.screenshotUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                          <LinkIcon size={12} /> View Receipt
                        </a>
                      )}
                      <button onClick={() => markUnpaid(idx)} disabled={loading} className="text-[10px] text-zinc-500 hover:text-zinc-300 mt-2 uppercase tracking-wider">
                        Mark Unpaid
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 md:items-start group-even:md:items-end">
                      {step.isRequested ? (
                         <span className="inline-block px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest mt-1 mb-2">Payment Requested</span>
                      ) : (
                         <span className="inline-block px-2 py-1 bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest mt-1 mb-2">Not Yet Requested</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openUploadModal(idx)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
                        >
                          <UploadCloud size={14} /> Mark as Paid
                        </button>
                        <button 
                          onClick={() => toggleRequested(idx)}
                          title="Toggle Payment Request Status"
                          disabled={loading}
                          className={`inline-flex items-center p-1.5 rounded-lg border transition-all ${step.isRequested ? 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700' : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'} `}
                        >
                          {step.isRequested ? <BellOff size={14} /> : <BellRing size={14} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && selectedMilestoneIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-all"
            >
              <X size={16} />
            </button>
            
            <h3 className="font-outfit text-xl font-bold text-white mb-2">Upload Receipt</h3>
            <p className="font-outfit text-zinc-400 text-sm mb-6">Attach a payment screenshot to permanently mark "{paymentStructure[selectedMilestoneIdx]?.name}" as paid.</p>
            
            <form onSubmit={handleUploadSubmit} className="space-y-6">
              <input 
                type="file" 
                accept="image/*" 
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-zinc-300 text-sm font-outfit file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 file:transition-all"
              />
              <button 
                type="submit" 
                disabled={uploading || !uploadFile}
                className="w-full font-outfit py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? "Uploading..." : <><CheckCircle2 size={16} /> Confirm Payment</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
