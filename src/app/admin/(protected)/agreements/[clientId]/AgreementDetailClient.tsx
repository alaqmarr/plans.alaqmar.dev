"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  CheckCircle2, Clock, XCircle, Download, ArrowLeft,
  FileSignature, ShieldCheck, ShieldX, RefreshCw, AlertTriangle, Calendar, Save, Copy
} from "lucide-react";
import { adminSignAgreement, verifyClientSignature, rejectClientSignature, regenerateAgreementText, updateAgreementDate } from "@/app/actions/agreements";
import { downloadAgreementPdf, AgreementPdfData } from "@/lib/pdfGenerator";
import { useConfirm } from "@/providers/ConfirmProvider";

const fmtDate = (d: Date | string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function AgreementDetailClient({ agreement, settings }: { agreement: any; settings: any }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [loading, setLoading] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Date override
  const effectiveDate = agreement.agreementDate || agreement.createdAt;
  const toInputVal = (d: Date | string) => new Date(d).toISOString().split("T")[0];
  const [dateVal, setDateVal] = useState(toInputVal(effectiveDate));
  const [dateSaving, setDateSaving] = useState(false);

  const client = agreement.client;
  const hasAdminSig = !!settings?.adminSignatureUrl;
  const isSigned = !!agreement.adminSignedAt;
  const clientSigned = !!agreement.clientSignedAt;
  const isVerified = agreement.adminVerified;

  const run = async (key: string, fn: () => Promise<void>) => {
    setLoading(key);
    try { await fn(); router.refresh(); } catch (e: any) { toast.error(e.message || "Error"); } finally { setLoading(null); }
  };

  const handleSign = () => run("sign", async () => {
    if (!hasAdminSig) throw new Error("Please upload your signature in Settings first.");
    if (isSigned) {
      const ok = await confirm({ title: "Re-sign Agreement?", message: "This will overwrite the existing admin signature. Continue?", destructive: false });
      if (!ok) throw new Error("Cancelled");
    }
    await adminSignAgreement(agreement.id);
    toast.success("Agreement signed!");
  });

  const handleVerify = () => run("verify", async () => {
    await verifyClientSignature(agreement.id);
    toast.success("Client signature verified!");
  });

  const handleReject = () => run("reject", async () => {
    const ok = await confirm({ title: "Reject Signature?", message: "This will clear the client's signature and ask them to re-upload. Continue?", destructive: true });
    if (!ok) throw new Error("Cancelled");
    await rejectClientSignature(agreement.id);
    toast.success("Signature rejected. Client will need to re-upload.");
  });

  const handleRegenerate = () => run("regen", async () => {
    const ok = await confirm({ title: "Regenerate Agreement Text?", message: "This will rebuild the agreement text from the current plan data. Any existing signatures will be cleared. Continue?", destructive: true });
    if (!ok) throw new Error("Cancelled");
    await regenerateAgreementText(agreement.id);
    toast.success("Agreement text regenerated.");
  });

  const handleSaveDate = async () => {
    setDateSaving(true);
    try {
      await updateAgreementDate(agreement.id, dateVal);
      toast.success("Agreement date updated.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to update date");
    } finally {
      setDateSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const pdfData: AgreementPdfData = {
        agreementText: agreement.agreementText,
        clientName: client.name,
        agreementDate: new Date(dateVal), // use the (possibly overridden) date
        adminSignatoryName: agreement.adminSignatoryName || settings?.adminSignatoryName || "AL AQMAR",
        adminSignatureUrl: agreement.adminSignatureUrl,
        adminSignedAt: agreement.adminSignedAt,
        clientSignatoryName: agreement.clientSignatoryName,
        clientSignatureUrl: agreement.clientSignatureUrl,
        clientSignedAt: agreement.clientSignedAt,
        adminVerified: agreement.adminVerified,
      };
      await downloadAgreementPdf(pdfData, `Agreement_${client.name.replace(/\s+/g, "_")}.pdf`);
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back + Title */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 font-outfit text-xs text-zinc-500 hover:text-white transition-colors mb-3">
            <ArrowLeft size={14} /> Back to Agreements
          </button>
          <h1 className="font-outfit text-2xl font-extrabold text-white tracking-tight">
            Agreement — {client.name}
          </h1>
          <p className="font-outfit text-zinc-400 text-sm mt-1">
            {client.plan?.name} · Agreement date: <span className="text-white font-bold">{fmtDate(dateVal)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/track/${client.trackingLink}`);
              toast.success("Client portal link copied!");
            }}
            className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all"
            title="Copy Client Tracking Link"
          >
            <Copy size={14} /> Link
          </button>
          <button
            onClick={handleRegenerate}
            disabled={loading === "regen"}
            className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading === "regen" ? "animate-spin" : ""} /> Regenerate
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 font-outfit text-xs font-bold uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <Download size={14} /> {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Admin Signature",
            icon: isSigned ? CheckCircle2 : Clock,
            iconClass: isSigned ? "text-emerald-400" : "text-zinc-500",
            value: isSigned ? `Signed ${fmtDate(agreement.adminSignedAt)}` : "Not signed yet",
            valueClass: isSigned ? "text-emerald-400" : "text-zinc-500",
            bg: isSigned ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-900/40 border-white/5",
          },
          {
            label: "Client Signature",
            icon: clientSigned ? CheckCircle2 : Clock,
            iconClass: clientSigned ? "text-blue-400" : "text-zinc-500",
            value: clientSigned ? `${agreement.clientSignatoryName} · ${fmtDate(agreement.clientSignedAt)}` : "Awaiting client",
            valueClass: clientSigned ? "text-blue-400" : "text-zinc-500",
            bg: clientSigned ? "bg-blue-500/5 border-blue-500/20" : "bg-zinc-900/40 border-white/5",
          },
          {
            label: "Verification",
            icon: isVerified ? CheckCircle2 : clientSigned ? AlertTriangle : XCircle,
            iconClass: isVerified ? "text-emerald-400" : clientSigned ? "text-amber-400" : "text-zinc-600",
            value: isVerified ? "Verified" : clientSigned ? "Pending your review" : "Not yet",
            valueClass: isVerified ? "text-emerald-400" : clientSigned ? "text-amber-400" : "text-zinc-600",
            bg: isVerified ? "bg-emerald-500/5 border-emerald-500/20" : clientSigned ? "bg-amber-500/5 border-amber-500/20" : "bg-zinc-900/40 border-white/5",
          },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 flex items-center gap-3`}>
            <s.icon size={20} className={s.iconClass} />
            <div>
              <p className="font-outfit text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</p>
              <p className={`font-outfit text-xs font-bold mt-0.5 ${s.valueClass}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Agreement Text */}
        <div className="lg:col-span-3 bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
          <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Agreement Text</h3>
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pr-2">
            {agreement.agreementText}
          </pre>
        </div>

        {/* Date + Admin Sign */}
        <div className="lg:col-span-2 space-y-4">

          {/* Agreement Date Override */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Calendar size={13} /> Agreement Date
            </h3>
            <p className="font-outfit text-[11px] text-zinc-600 leading-relaxed">
              This date appears on the agreement document and PDF. Adjust if the signing date differs from when the record was created.
            </p>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateVal}
                onChange={(e) => setDateVal(e.target.value)}
                className="flex-1 bg-zinc-950/60 border border-white/10 rounded-xl px-4 py-2.5 text-white font-outfit text-sm focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 transition-all [color-scheme:dark]"
              />
              <button
                onClick={handleSaveDate}
                disabled={dateSaving || dateVal === toInputVal(effectiveDate)}
                className="flex items-center gap-1.5 font-outfit text-xs font-bold uppercase tracking-widest px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={13} />
                {dateSaving ? "Saving…" : "Save"}
              </button>
            </div>
            {agreement.agreementDate && (
              <p className="font-outfit text-[10px] text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 size={10} /> Date overridden from original
              </p>
            )}
          </div>

          {/* Admin Sign */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500">Your Signature</h3>

            {!hasAdminSig && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="font-outfit text-xs text-amber-400">No admin signature found. Upload it in <a href="/admin/settings" className="underline">Settings</a> first.</p>
              </div>
            )}

            {isSigned && agreement.adminSignatureUrl && (
              <div className="border border-emerald-500/20 rounded-xl overflow-hidden bg-emerald-950/20">
                <img
                  src={agreement.adminSignatureUrl}
                  alt="Admin signature"
                  className="w-full object-contain"
                  style={{ maxHeight: 100, background: "transparent" }}
                />
              </div>
            )}

            <button
              onClick={handleSign}
              disabled={loading === "sign" || !hasAdminSig}
              className="w-full flex items-center justify-center gap-2 font-outfit text-sm font-bold uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 text-white"
            >
              <FileSignature size={16} />
              {loading === "sign" ? "Signing..." : isSigned ? "Re-sign Agreement" : "Sign Agreement"}
            </button>
          </div>

          {/* Client Signature Review */}
          {clientSigned && (
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-500">Client Signature Review</h3>

              <div>
                <p className="font-outfit text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Signatory Name</p>
                <p className="font-outfit text-white font-bold">{agreement.clientSignatoryName}</p>
              </div>

              {agreement.clientSignatureUrl && (
                <div className="border border-blue-500/20 rounded-xl overflow-hidden bg-blue-950/20">
                  <img
                    src={agreement.clientSignatureUrl}
                    alt="Client signature"
                    className="w-full object-contain"
                    style={{ maxHeight: 100 }}
                  />
                </div>
              )}

              <div className="flex gap-2">
                {!isVerified ? (
                  <button
                    onClick={handleVerify}
                    disabled={loading === "verify"}
                    className="flex-1 flex items-center justify-center gap-2 font-outfit text-sm font-bold uppercase tracking-widest py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
                  >
                    <ShieldCheck size={16} />
                    {loading === "verify" ? "Verifying..." : "Verify"}
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 font-outfit text-sm font-bold text-emerald-400 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <CheckCircle2 size={16} /> Verified
                  </div>
                )}
                <button
                  onClick={handleReject}
                  disabled={loading === "reject"}
                  className="flex items-center justify-center gap-2 font-outfit text-xs font-bold uppercase tracking-widest p-3 rounded-xl border border-red-500/20 hover:border-red-400/40 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                  title="Reject & ask client to re-upload"
                >
                  <ShieldX size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
