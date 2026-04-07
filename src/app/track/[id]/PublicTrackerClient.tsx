"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import {
  CheckCircle2, Circle, Smartphone, Building2, CreditCard, Copy,
  Link as LinkIcon, BadgeCheck, Check, Box, MessageSquare, Plus,
  Send, ChevronDown, ChevronRight, Clock, X, Lock, ScrollText,
  FileSignature, ShieldCheck, AlertTriangle, Download, Sparkles,
  Loader2, ImageUp, PenLine
} from "lucide-react";
import toast from "react-hot-toast";
import { createTicket, addTicketMessage } from "@/app/actions/tickets";
import { uploadClientSignature } from "@/app/actions/agreements";
import { downloadAgreementPdf, AgreementPdfData } from "@/lib/pdfGenerator";
import SignatureCropper from "@/components/SignatureCropper";
import { uploadFileToR2 } from "@/lib/uploadHelper";

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  "in-progress": { label: "In Progress", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  resolved: { label: "Resolved", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  closed: { label: "Closed", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
};

type Tab = "overview" | "agreement";

export default function PublicTrackerClient({
  client, tickets, agreement, adminPassword, settings
}: {
  client: any;
  tickets: any[];
  agreement: any | null;
  adminPassword: string;
  settings: any;
}) {
  const storageKey = `client_auth_${client.trackingLink}`;
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(storageKey) === "true";
  });
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const input = password.trim().replace(/[\s\-()+]/g, "");
    const phoneNumbers: string[] = client.phoneNumbers || [];
    if (input === adminPassword.replace(/[\s\-()+]/g, "")) {
      sessionStorage.setItem(storageKey, "true");
      setIsAuthenticated(true);
      return;
    }
    const match = phoneNumbers.some((num: string) => num.replace(/[\s\-()+]/g, "") === input);
    if (match) {
      sessionStorage.setItem(storageKey, "true");
      setIsAuthenticated(true);
    } else {
      setAuthError("Invalid password. Please try again.");
    }
  };

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
                  inputMode="numeric"
                  pattern="[0-9]*"
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
  try { paymentStructure = JSON.parse(client.paymentStructure || "[]"); } catch { }

  const currentDueIdx = paymentStructure.findIndex((s: any) => !s.isPaid);
  const totalPaid = paymentStructure.filter((s: any) => s.isPaid).reduce((sum: number, s: any) => sum + s.amount, 0);
  const totalAmount = client.offeredPrice;
  const progressPercent = Math.min(100, Math.round((totalPaid / totalAmount) * 100)) || 0;
  const isCompleted = currentDueIdx === -1;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const currentDue = currentDueIdx >= 0 ? paymentStructure[currentDueIdx] : null;
  const upiNote = currentDue
    ? `Payment for ${client.name} - ${client.plan?.name} - ${currentDue.name}`
    : `Payment for ${client.name} - ${client.plan?.name}`;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: CreditCard },
    { id: "agreement", label: "Agreement", icon: ScrollText },
  ];

  const alerts = [];

  if (agreement && agreement.adminSignedAt && !agreement.clientSignedAt) {
    alerts.push({
      id: "signature",
      title: "Signature Required",
      message: "Please review the agreement and provide your authorised signature.",
      icon: PenLine,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      badge: "Action Required",
      badgeColor: "bg-amber-500 text-amber-950",
      action: () => setActiveTab("agreement"),
      buttonText: "Sign Now"
    });
  }

  if (currentDueIdx >= 0) {
    const dueStep = paymentStructure[currentDueIdx];
    const upiLink = settings?.upiId ? `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.bankAccountName || "THE WEB SENSEI")}&am=${dueStep.amount}&cu=INR&tn=${encodeURIComponent(upiNote)}` : undefined;
    alerts.push({
      id: "payment",
      title: "Payment Requested",
      message: `Milestone: ${dueStep.name} (₹${dueStep.amount.toLocaleString("en-IN")})`,
      icon: CreditCard,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      badge: "Action Required",
      badgeColor: "bg-blue-500 text-blue-950",
      action: upiLink ? null : () => setActiveTab("overview"),
      href: upiLink,
      buttonText: upiLink ? "Pay via UPI" : "View Details"
    });
  }

  if (agreement && agreement.clientSignedAt && !agreement.adminVerified) {
    alerts.push({
      id: "verification",
      title: "Verifying Signature",
      message: "We're validating your signature. Your PDF copy will be ready shortly.",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      badge: "Processing",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20",
      action: null,
      buttonText: ""
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="font-outfit text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Welcome, {client.name}
        </h1>
        <p className="font-outfit text-zinc-400 max-w-2xl mx-auto text-lg">
          Track the development progress and payment milestones for your <strong className="text-white">{client.plan?.name}</strong>.
        </p>
      </div>

      {/* Stacked Notifications */}
      {alerts.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-3 px-4">
          {alerts.map(alert => {
            const Icon = alert.icon;
            return (
              <div key={alert.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-3xl backdrop-blur-3xl shadow-2xl ${alert.bg} ${alert.border} border gap-4 transition-all duration-500`}>
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`p-3.5 rounded-2xl bg-black/20 shrink-0 ${alert.color} border border-white/5`}>
                    <Icon size={22} className="drop-shadow-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-outfit font-black uppercase tracking-widest ${alert.badgeColor}`}>
                        {alert.badge}
                      </span>
                    </div>
                    <h4 className={`font-outfit text-base font-bold ${alert.color}`}>{alert.title}</h4>
                    <p className="font-outfit text-sm text-zinc-300 mt-0.5 flex-1">{alert.message}</p>
                  </div>
                </div>
                {alert.href ? (
                  <a href={alert.href} className={`w-full sm:w-auto shrink-0 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-outfit text-xs font-black uppercase tracking-widest transition-all border border-emerald-400/20 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2`}>
                    <Smartphone size={14} className="animate-pulse" /> {alert.buttonText}
                  </a>
                ) : alert.action && (
                  <button onClick={alert.action} className={`w-full sm:w-auto shrink-0 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-outfit text-xs font-bold uppercase tracking-widest transition-all border border-white/5 shadow-lg flex items-center justify-center gap-2`}>
                    {alert.buttonText} <ChevronRight size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-2 bg-zinc-900/60 border border-white/5 rounded-2xl p-1.5 w-fit mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-outfit text-sm font-bold uppercase tracking-widest transition-all ${
                isActive
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══ OVERVIEW TAB ═══ */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
              <div className="text-xs font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-2">Total Paid</div>
              <div className="text-3xl font-outfit font-extrabold text-white mb-4">
                ₹{totalPaid.toLocaleString("en-IN")} <span className="text-base text-zinc-500 font-medium">/ ₹{totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex items-center">
              <div>
                <div className="text-xs font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-2">Status</div>
                {isCompleted ? (
                  <div className="flex items-center gap-3 text-emerald-400">
                    <BadgeCheck size={36} />
                    <span className="font-outfit text-2xl font-bold">Complete</span>
                  </div>
                ) : (
                  <div className="font-outfit text-2xl font-bold text-white">
                    Due: <span className="text-amber-400">₹{paymentStructure[currentDueIdx]?.amount.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          {client.plan?.features?.length > 0 && (
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
              <h3 className="font-outfit text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                <Box className="text-indigo-400" /> Plan Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                {client.plan.features.filter((pf: any) => pf.isIncluded).map((pf: any) => (
                  <div key={pf.id} className="flex items-start gap-3 bg-zinc-950/30 p-4 rounded-2xl border border-white/5">
                    <div className="bg-emerald-500/15 p-1.5 rounded-full mt-0.5 shrink-0">
                      <Check size={14} className="text-emerald-400" />
                    </div>
                    <div className="font-outfit text-sm text-zinc-200 font-bold tracking-wide leading-snug">{pf.feature.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Payment Timeline */}
            <div className="lg:col-span-7 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
              <h3 className="font-outfit text-xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
                <CreditCard className="text-indigo-400" /> Milestone Tracker
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-500/50 before:via-white/5 before:to-transparent">
                {paymentStructure.map((step: any, idx: number) => {
                  const isPaid = step.isPaid;
                  const isActive = idx === currentDueIdx;
                  return (
                    <div key={idx} className={`relative flex gap-6 ${isActive ? "opacity-100" : isPaid ? "opacity-70" : "opacity-40"}`}>
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full border-4 border-[#121214] shrink-0 z-10 ${isPaid ? "bg-emerald-500 text-white" : isActive ? "bg-amber-500 text-white animate-pulse" : "bg-zinc-800 text-zinc-500"}`}>
                        {isPaid ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="bg-zinc-950/50 border border-white/5 rounded-2xl p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-outfit font-bold text-white text-lg">{step.name}</h4>
                            <div className={`font-outfit font-bold ${isPaid ? "text-emerald-400" : "text-amber-400"}`}>₹{step.amount.toLocaleString("en-IN")}</div>
                          </div>
                          {isPaid ? (
                            <div className="flex flex-wrap items-center gap-3 mt-4">
                              <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">Paid</span>
                              {step.screenshotUrl && (
                                <a href={step.screenshotUrl} target="_blank" rel="noreferrer" className="text-[11px] font-outfit text-zinc-400 hover:text-white flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md border border-white/5">
                                  <LinkIcon size={12} /> Payment Proof
                                </a>
                              )}
                              {step.invoiceUrl && (
                                <a href={step.invoiceUrl} target="_blank" rel="noreferrer" className="text-[11px] font-outfit text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-md border border-emerald-500/20">
                                  <LinkIcon size={12} /> Invoice
                                </a>
                              )}
                            </div>
                          ) : isActive && step.isRequested !== false && (
                            <div className="mt-5 pt-5 border-t border-white/5 animate-in fade-in">
                              <p className="text-sm font-outfit text-zinc-400 mb-4 leading-relaxed">
                                Transfer the due amount via UPI or bank transfer below. Please add a note: <span className="text-white font-bold">"{upiNote}"</span>
                              </p>
                              {settings.upiId ? (
                                <a
                                  href={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.bankAccountName || "THE WEB SENSEI")}&am=${step.amount}&cu=INR&tn=${encodeURIComponent(upiNote)}`}
                                  className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-outfit font-extrabold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 uppercase tracking-widest text-sm border border-emerald-400/20"
                                >
                                  <Smartphone size={20} className="animate-pulse" /> Pay ₹{step.amount.toLocaleString("en-IN")} via UPI
                                </a>
                              ) : (
                                <div className="text-xs font-outfit text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">UPI not configured. Use bank details →</div>
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

            {/* Bank Panel */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="font-outfit text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                  <Building2 className="text-indigo-400" /> Bank Transfer
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Account Name", val: settings.bankAccountName || "THE WEB SENSEI" },
                    { label: "Account Number", val: settings.bankAccountNumber || "Not configured" },
                    { label: "IFSC Code", val: settings.bankIfsc || "Not configured" },
                    { label: "UPI ID", val: settings.upiId || "Not configured" },
                  ].map((row) => (
                    <div key={row.label} className="bg-zinc-950/50 rounded-xl p-4 border border-white/5 flex justify-between items-center group">
                      <div>
                        <div className="text-[10px] font-outfit uppercase tracking-widest text-zinc-500 font-bold mb-1">{row.label}</div>
                        <div className="font-outfit font-medium text-white">{row.val}</div>
                      </div>
                      <button onClick={() => handleCopy(row.val)} className="p-2 bg-white/5 text-zinc-500 group-hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                        <Copy size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* UPI Note */}
                <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <p className="font-outfit text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-1">Transfer Note / Remark</p>
                  <p className="font-outfit text-sm text-emerald-200 font-medium">{upiNote}</p>
                  <button onClick={() => handleCopy(upiNote)} className="mt-2 flex items-center gap-1.5 font-outfit text-[10px] text-emerald-500 hover:text-emerald-400 uppercase tracking-widest font-bold transition-colors">
                    <Copy size={10} /> Copy Note
                  </button>
                </div>

                <p className="text-xs font-outfit text-zinc-500 mt-4 leading-relaxed">
                  After payment via IMPS/NEFT, WhatsApp the screenshot to our team to update your tracking portal.
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <SupportSection client={client} tickets={tickets} />
        </div>
      )}

      {/* ═══ AGREEMENT TAB ═══ */}
      {activeTab === "agreement" && (
        <AgreementSection agreement={agreement} client={client} settings={settings} />
      )}
    </div>
  );
}

// ═══ Agreement Section ═══
function AgreementSection({ agreement, client, settings }: { agreement: any | null; client: any; settings: any }) {
  const router = useRouter();
  const [rawSigFile, setRawSigFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [sigName, setSigName] = useState(agreement?.clientSignatoryName || "");
  const [sigStage, setSigStage] = useState<"idle" | "cropping" | "removing-bg" | "uploading" | "done">(
    agreement?.clientSignatureUrl ? "done" : "idle"
  );
  const [downloading, setDownloading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setRawSigFile(accepted[0]);
      setShowCropper(true);
      setSigStage("cropping");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: sigStage === "removing-bg" || sigStage === "uploading",
  });

  const handleCropComplete = async (croppedFile: File) => {
    setShowCropper(false);
    setRawSigFile(null);
    if (!sigName.trim()) {
      toast.error("Please enter your authorised signatory name first.");
      setSigStage("idle");
      return;
    }
    setSigStage("uploading");
    try {
      const url = await uploadFileToR2(croppedFile, "signatures", `client-signature-${client.id}-${Date.now()}.png`);

      await uploadClientSignature(agreement.id, url, sigName.trim());
      setSigStage("done");
      toast.success("Signature submitted! Awaiting admin verification.");
      router.refresh();
    } catch {
      setSigStage("idle");
      toast.error("Failed to upload signature.");
    }
  };

  const handleDownload = async () => {
    if (!agreement) return;
    setDownloading(true);
    try {
      const pdfData: AgreementPdfData = {
        agreementText: agreement.agreementText,
        clientName: client.name,
        agreementDate: new Date(agreement.createdAt),
        adminSignatoryName: agreement.adminSignatoryName || settings.adminSignatoryName || "AL AQMAR",
        adminSignatureUrl: agreement.adminSignatureUrl,
        adminSignedAt: agreement.adminSignedAt,
        clientSignatoryName: agreement.clientSignatoryName,
        clientSignatureUrl: agreement.clientSignatureUrl,
        clientSignedAt: agreement.clientSignedAt,
        adminVerified: agreement.adminVerified,
      };
      await downloadAgreementPdf(pdfData, `Agreement_${client.name.replace(/\s+/g, "_")}.pdf`);
    } catch {
      toast.error("Failed to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  if (!agreement) {
    return (
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-12 text-center">
        <ScrollText size={40} className="text-zinc-700 mx-auto mb-4" />
        <p className="font-outfit text-zinc-400 text-lg font-bold">Agreement Not Ready</p>
        <p className="font-outfit text-zinc-600 text-sm mt-2">Your service agreement is being prepared. Please check back shortly.</p>
      </div>
    );
  }

  const adminSigned = !!agreement.adminSignedAt;
  const clientSigned = !!agreement.clientSignedAt;
  const isVerified = agreement.adminVerified;
  const canDownload = adminSigned && clientSigned && isVerified;

  return (
    <>
      {showCropper && rawSigFile && (
        <SignatureCropper
          imageFile={rawSigFile}
          onComplete={handleCropComplete}
          onCancel={() => { setShowCropper(false); setRawSigFile(null); setSigStage("idle"); }}
        />
      )}

      <div className="space-y-6">
        {/* Status Bar */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Our Signature", ok: adminSigned, pending: "Pending" },
            { label: "Your Signature", ok: clientSigned, pending: "Not uploaded" },
            { label: "Verified", ok: isVerified, pending: clientSigned ? "Under review" : "Pending" },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-2 border rounded-xl p-3 ${s.ok ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-900/40 border-white/5"}`}>
              {s.ok ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <Clock size={16} className="text-zinc-600 shrink-0" />}
              <div>
                <p className="font-outfit text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</p>
                <p className={`font-outfit text-xs font-bold ${s.ok ? "text-emerald-400" : "text-zinc-500"}`}>{s.ok ? "Done" : s.pending}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Download button */}
        <div className="flex justify-end">
          <button
            onClick={handleDownload}
            disabled={!canDownload || downloading}
            className={`flex items-center gap-2 font-outfit text-sm font-bold uppercase tracking-widest px-5 py-3 rounded-xl transition-all ${canDownload ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
            title={canDownload ? "" : "Available once both parties have signed and verified"}
          >
            <Download size={16} /> {downloading ? "Generating…" : "Download PDF"}
          </button>
        </div>

        {/* Agreement Text */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <ScrollText size={14} /> Service Agreement
          </h3>
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 pr-2">
            {agreement.agreementText}
          </pre>
        </div>

        {/* Admin Signature */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <FileSignature size={14} /> Our Signature (The Web Sensei)
          </h3>
          {agreement.adminSignatureUrl ? (
            <div className="space-y-3">
              <div className="border border-emerald-500/20 rounded-xl overflow-hidden bg-[#0a0f0c]">
                <img src={agreement.adminSignatureUrl} alt="Admin signature" className="w-full object-contain" style={{ maxHeight: 120 }} />
              </div>
              <div>
                <p className="font-outfit text-white font-bold text-sm">{agreement.adminSignatoryName}</p>
                <p className="font-outfit text-zinc-500 text-xs">Signed {new Date(agreement.adminSignedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <AlertTriangle size={18} className="text-amber-400 shrink-0" />
              <p className="font-outfit text-sm text-amber-400">Our signature is pending. We'll sign first before asking for yours.</p>
            </div>
          )}
        </div>

        {/* Client Signature */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <PenLine size={14} /> Your Signature
          </h3>

          {isVerified && agreement.clientSignatureUrl ? (
            <div className="space-y-3">
              <div className="border border-emerald-500/20 rounded-xl overflow-hidden bg-[#0a0f0c]">
                <img src={agreement.clientSignatureUrl} alt="Your signature" className="w-full object-contain" style={{ maxHeight: 120 }} />
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <p className="font-outfit text-sm text-emerald-400 font-bold">{agreement.clientSignatoryName} — Verified</p>
              </div>
            </div>
          ) : clientSigned && !isVerified ? (
            <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <Clock size={18} className="text-blue-400 shrink-0" />
              <div>
                <p className="font-outfit text-sm text-blue-400 font-bold">Signature Submitted</p>
                <p className="font-outfit text-xs text-zinc-500 mt-0.5">Awaiting admin verification. We'll confirm within 24 hours.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!adminSigned && (
                <div className="flex items-center gap-3 bg-zinc-800/60 border border-white/5 rounded-xl p-3">
                  <AlertTriangle size={14} className="text-zinc-500 shrink-0" />
                  <p className="font-outfit text-xs text-zinc-500">Our signature must be added first before you can upload yours.</p>
                </div>
              )}

              <div>
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Authorised Signatory Name</label>
                <input
                  type="text"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  disabled={!adminSigned}
                  placeholder="Your full name or company representative"
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white font-outfit placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              <div
                {...getRootProps()}
                className={`relative flex flex-col items-center justify-center border-2 rounded-2xl p-8 transition-all min-h-[130px] ${
                  !adminSigned ? "border-zinc-800 opacity-40 cursor-not-allowed pointer-events-none" :
                  sigStage === "uploading" ? "border-zinc-800 cursor-default" :
                  isDragActive ? "border-emerald-500 bg-emerald-500/5 scale-[1.01] cursor-copy" :
                  "border-zinc-800 hover:border-zinc-600 hover:bg-white/2 cursor-pointer"
                }`}
              >
                <input {...getInputProps()} />
                {sigStage === "uploading" ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={24} className="text-blue-400 animate-spin" />
                    <p className="font-outfit text-sm text-white font-bold">Uploading…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDragActive ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-zinc-900 border border-white/5"}`}>
                      <ImageUp size={22} className={isDragActive ? "text-emerald-400" : "text-zinc-500"} />
                    </div>
                    <div>
                      <p className={`font-outfit text-sm font-bold ${isDragActive ? "text-emerald-400" : "text-zinc-300"}`}>
                        {isDragActive ? "Drop your signature!" : "Upload your signature"}
                      </p>
                      <p className="font-outfit text-xs text-zinc-600 mt-1">PNG or JPG · Crop window + background removal included</p>
                    </div>
                    {!isDragActive && <span className="font-outfit text-[10px] uppercase tracking-widest text-zinc-700 border border-zinc-800 px-3 py-1 rounded-full">or click to browse</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══ Support Section ═══
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
      await createTicket({ clientId: client.id, subject: subject.trim(), description: description.trim(), createdBy: "client" });
      toast.success("Ticket submitted! We'll get back to you soon.");
      setSubject(""); setDescription(""); setShowForm(false);
      router.refresh();
    } catch { toast.error("Failed to create ticket."); }
    finally { setCreating(false); }
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
    } catch { toast.error("Failed to send reply."); }
    finally { setSendingReply(null); }
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

      {showForm && (
        <form onSubmit={handleCreateTicket} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div>
            <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Briefly describe your issue..." className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
          </div>
          <div>
            <label className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="Tell us more..." className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-white font-outfit placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none" />
          </div>
          <button type="submit" disabled={creating} className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-outfit font-bold uppercase tracking-widest text-sm rounded-xl transition-colors disabled:opacity-50">
            {creating ? "Submitting…" : "Submit Ticket"}
          </button>
        </form>
      )}

      {tickets.length === 0 && !showForm ? (
        <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-10 text-center">
          <MessageSquare size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="font-outfit text-zinc-500 text-sm">No support tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const status = STATUS_BADGE[ticket.status] || STATUS_BADGE.open;
            const isExpanded = expandedTicket === ticket.id;
            return (
              <div key={ticket.id} className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)} className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${status.bg} ${status.color}`}>{status.label}</span>
                    </div>
                    <h4 className="font-outfit font-bold text-white text-sm truncate">{ticket.subject}</h4>
                    <p className="font-outfit text-xs text-zinc-500 mt-1 flex items-center gap-2">
                      <Clock size={10} /> {new Date(ticket.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      <span>•</span><MessageSquare size={10} /> {ticket.messages?.length || 0}
                    </p>
                  </div>
                  <div className="shrink-0 text-zinc-500 mt-1">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
                </button>
                {isExpanded && (
                  <div className="border-t border-white/5">
                    <div className="p-5 space-y-3 max-h-[350px] overflow-y-auto">
                      {ticket.messages?.map((msg: any) => {
                        const isClient = msg.sender === "client";
                        return (
                          <div key={msg.id} className={`flex gap-3 ${isClient ? "flex-row-reverse" : ""}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${isClient ? "bg-indigo-500/20 text-indigo-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                              {isClient ? "Y" : "S"}
                            </div>
                            <div className={`max-w-[75%] ${isClient ? "text-right" : ""}`}>
                              <div className={`inline-block rounded-2xl px-4 py-2.5 text-sm font-outfit ${isClient ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-100" : "bg-zinc-800/50 border border-white/5 text-zinc-200"}`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                              </div>
                              <div className="font-outfit text-[10px] text-zinc-600 mt-1 px-1">
                                {isClient ? "You" : "Support"} · {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {ticket.status !== "closed" && (
                      <div className="border-t border-white/5 p-4 flex gap-3">
                        <input
                          value={replyTexts[ticket.id] || ""}
                          onChange={(e) => setReplyTexts((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Type your reply..."
                          className="flex-1 bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white font-outfit text-sm placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(ticket.id); } }}
                        />
                        <button onClick={() => handleReply(ticket.id)} disabled={sendingReply === ticket.id || !replyTexts[ticket.id]?.trim()} className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-4 py-2.5 font-outfit font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
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
