"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { updateSettings } from "@/app/actions/settings";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  CheckCircle2, X, Sparkles, Loader2, ImageUp, Trash2, PenLine
} from "lucide-react";
import SignatureCropper from "@/components/SignatureCropper";
import { uploadFileToR2 } from "@/lib/uploadHelper";

interface SettingsData {
  contactEmail: string;
  whatsappNumber: string;
  upiId: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  adminSignatureUrl: string;
  adminSignatoryName: string;
}

type SigStage = "idle" | "cropping" | "removing-bg" | "uploading" | "saved";

export default function SettingsClient({ initialSettings }: { initialSettings: SettingsData }) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialSettings);
  const [loading, setLoading] = useState(false);

  // Signature state
  const [rawSigFile, setRawSigFile] = useState<File | null>(null);
  const [sigStage, setSigStage] = useState<SigStage>(initialSettings.adminSignatureUrl ? "saved" : "idle");
  const [sigPreview, setSigPreview] = useState<string | null>(initialSettings.adminSignatureUrl || null);

  // --- Dropzone ---
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setRawSigFile(accepted[0]);
      setSigStage("cropping");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: sigStage === "removing-bg" || sigStage === "uploading",
  });

  // --- After crop is done ---
  const handleCropComplete = async (croppedFile: File) => {
    setSigStage("removing-bg");
    setRawSigFile(null);

    try {
      // remove.bg — always falls back gracefully on network errors
      const rbForm = new FormData();
      rbForm.append("file", croppedFile);
      const rbRes = await fetch("/api/remove-bg", { method: "POST", body: rbForm });

      setSigStage("uploading");

      let fileToUpload = croppedFile;
      if (rbRes.ok) {
        const finalBlob = await rbRes.blob();
        fileToUpload = new File([finalBlob], "admin-signature.png", { type: "image/png" });
      }

      // Local preview immediately
      const localUrl = URL.createObjectURL(fileToUpload);
      setSigPreview(localUrl);

      // Upload to R2 carefully using direct presigned URLs explicitly
      const url = await uploadFileToR2(fileToUpload, "signatures", `admin-signature-${Date.now()}.png`);

      // Save to DB — retry up to 3 times for transient DB errors
      let saved = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await updateSettings({ ...formData, adminSignatureUrl: url });
          saved = true;
          break;
        } catch {
          if (attempt < 3) await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }

      setFormData((prev) => ({ ...prev, adminSignatureUrl: url }));
      setSigPreview(url);
      setSigStage("saved");

      if (saved) {
        toast.success("Signature saved!");
      } else {
        toast.error("Image uploaded but DB save failed — please click 'Save Name' to retry linking.");
      }
      router.refresh();
    } catch {
      setSigStage("idle");
      setSigPreview(null);
      toast.error("Failed to process signature.");
    }
  };

  const handleRemoveSig = async () => {
    setSigStage("uploading");
    try {
      await updateSettings({ ...formData, adminSignatureUrl: "" });
      setFormData((prev) => ({ ...prev, adminSignatureUrl: "" }));
      setSigPreview(null);
      setSigStage("idle");
      toast.success("Signature removed.");
      router.refresh();
    } catch {
      setSigStage("saved");
      toast.error("Failed to remove signature.");
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings(formData);
      toast.success("Settings saved.");
      router.refresh();
    } catch {
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  // ─── Stage UI config ───
  const stageConfig: Record<SigStage, { badge?: React.ReactNode; dropLabel: string; dropSub: string }> = {
    idle: {
      dropLabel: "Drop your signature here",
      dropSub: "PNG or JPG · Any ratio — crop window will follow · Background removed automatically",
    },
    cropping: { dropLabel: "", dropSub: "" },
    "removing-bg": {
      dropLabel: "Removing background…",
      dropSub: "AI magic in progress. Hang tight.",
    },
    uploading: {
      dropLabel: "Uploading to cloud…",
      dropSub: "Saving securely to R2 storage",
    },
    saved: {
      badge: (
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-outfit text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          <CheckCircle2 size={11} /> Signature Saved
        </span>
      ),
      dropLabel: "Drop to replace",
      dropSub: "16:9 crop · Background removed automatically",
    },
  };

  const conf = stageConfig[sigStage];
  const isProcessing = sigStage === "removing-bg" || sigStage === "uploading";

  return (
    <>
      {sigStage === "cropping" && rawSigFile && (
        <SignatureCropper
          imageFile={rawSigFile}
          onComplete={handleCropComplete}
          onCancel={() => { setSigStage("idle"); setRawSigFile(null); }}
        />
      )}

      <div className="max-w-3xl space-y-6">
        {/* ─── Signature Card ─── */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <PenLine size={18} className="text-emerald-400" />
              </div>
              <h2 className="font-outfit text-xl font-extrabold text-white tracking-tight">Authorised Signatory</h2>
            </div>
            {conf.badge}
          </div>
          <p className="font-outfit text-zinc-500 text-sm mb-6 ml-12">
            Used on all agreements and documents. A 16:9 crop window opens for non-standard images; background is automatically removed.
          </p>

          <div className="space-y-5">
            {/* Signatory name */}
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Signatory Name</label>
              <input
                type="text"
                className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium placeholder:text-zinc-700"
                value={formData.adminSignatoryName}
                onChange={(e) => setFormData({ ...formData, adminSignatoryName: e.target.value })}
                placeholder="AL AQMAR"
              />
            </div>

            {/* Signature dropzone */}
            <div>
              <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Signature Image</label>

              {/* Show saved signature preview */}
              {sigStage === "saved" && sigPreview && (
                <div className="mb-3 relative group rounded-2xl overflow-hidden border border-emerald-500/20 bg-[#0a0f0c]">
                  <img
                    src={sigPreview}
                    alt="Admin signature"
                    className="w-full object-contain"
                    style={{ maxHeight: 130 }}
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label
                      {...getRootProps()}
                      className="cursor-pointer flex items-center gap-2 bg-zinc-800/90 hover:bg-zinc-700 text-white font-outfit text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-white/10 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ImageUp size={14} /> Replace
                      <input {...getInputProps()} />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveSig}
                      className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-outfit text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border border-red-500/30 transition-colors"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Dropzone */}
              {sigStage !== "saved" && (
                <div
                  {...getRootProps()}
                  className={`relative flex flex-col items-center justify-center border-2 rounded-2xl p-8 transition-all cursor-pointer min-h-[140px]
                    ${isDragActive && !isDragReject ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]" : ""}
                    ${isDragReject ? "border-red-500 bg-red-500/5" : ""}
                    ${!isDragActive && !isDragReject && !isProcessing ? "border-zinc-800 hover:border-zinc-600 hover:bg-white/2" : ""}
                    ${isProcessing ? "border-zinc-800 cursor-default" : ""}
                  `}
                >
                  <input {...getInputProps()} />

                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        {sigStage === "removing-bg"
                          ? <Sparkles size={22} className="text-violet-400 animate-pulse" />
                          : <Loader2 size={22} className="text-blue-400 animate-spin" />
                        }
                      </div>
                      <p className="font-outfit text-sm font-bold text-white">{conf.dropLabel}</p>
                      <p className="font-outfit text-xs text-zinc-500">{conf.dropSub}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isDragActive ? "bg-emerald-500/20 border border-emerald-500/40" : "bg-zinc-900 border border-white/5"
                      }`}>
                        <ImageUp size={22} className={isDragActive ? "text-emerald-400" : "text-zinc-500"} />
                      </div>
                      <div>
                        <p className={`font-outfit text-sm font-bold ${isDragActive ? "text-emerald-400" : "text-zinc-300"}`}>
                          {isDragActive ? "Drop it!" : conf.dropLabel}
                        </p>
                        <p className="font-outfit text-xs text-zinc-600 mt-1">{conf.dropSub}</p>
                      </div>
                      {!isDragActive && (
                        <span className="font-outfit text-[10px] uppercase tracking-widest text-zinc-700 border border-zinc-800 px-3 py-1 rounded-full">
                          or click to browse
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Save name button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  try {
                    await updateSettings(formData);
                    toast.success("Name saved.");
                    router.refresh();
                  } catch {
                    toast.error("Error");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="font-outfit text-xs font-bold uppercase tracking-widest px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/5 rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? "Saving…" : "Save Name"}
              </button>
            </div>
          </div>
        </div>

        {/* ─── General Settings Card ─── */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl">
          <h2 className="font-outfit text-xl font-extrabold text-white mb-1 tracking-tight">Global Configurations</h2>
          <p className="font-outfit text-zinc-500 text-sm mb-8">
            These settings override the default system `.env` configuration.
          </p>

          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Contact Email</label>
                <input type="email" required className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-zinc-700" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} placeholder="contact@example.com" />
              </div>
              <div>
                <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">WhatsApp Number</label>
                <input type="text" required className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-zinc-700" value={formData.whatsappNumber} onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })} placeholder="+1234567890" />
              </div>
            </div>

            <div className="border-t border-white/5 pt-5">
              <p className="font-outfit text-xs font-bold uppercase tracking-widest text-zinc-600 mb-5">Payment Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "UPI ID", key: "upiId", placeholder: "example@upi" },
                  { label: "Bank Account Name", key: "bankAccountName", placeholder: "THE WEB SENSEI" },
                  { label: "Account Number", key: "bankAccountNumber", placeholder: "1234567890" },
                  { label: "IFSC Code", key: "bankIfsc", placeholder: "HDFC0001234" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="font-outfit block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">{f.label}</label>
                    <input
                      type="text"
                      className="font-outfit w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/30 transition-all font-medium placeholder:text-zinc-700"
                      value={(formData as any)[f.key]}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={loading} className="font-outfit px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50">
                {loading ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
