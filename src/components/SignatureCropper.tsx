"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, Check, ImageUp, Crop, Loader2, Sparkles, AlertTriangle } from "lucide-react";

interface SignatureCropperProps {
  onComplete: (croppedFile: File) => void;
  onCancel: () => void;
  imageFile: File;
}

type ProcessingStage = "crop" | "removing-bg" | "uploading" | "done";

export default function SignatureCropper({ onComplete, onCancel, imageFile }: SignatureCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState<ProcessingStage>("crop");
  const [bgNote, setBgNote] = useState<string | null>(null);

  const ASPECT = 16 / 9;
  const CANVAS_W = 620;
  const CANVAS_H = 380;

  useEffect(() => {
    const url = URL.createObjectURL(imageFile);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      const initW = Math.min(CANVAS_W * 0.9, image.width);
      const initH = initW / ASPECT;
      setCropW(initW);
      setCropX((CANVAS_W - initW) / 2);
      setCropY((CANVAS_H - initH) / 2);
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (CANVAS_W - dw) / 2;
    const dy = (CANVAS_H - dh) / 2;

    // Draw full image
    ctx.drawImage(img, dx, dy, dw, dh);

    // Dark vignette outside crop
    ctx.fillStyle = "rgba(9,9,11,0.72)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Show image inside crop region
    const ch = cropW / ASPECT;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, ch);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();

    // Crop border — glowing green
    ctx.strokeStyle = "#43926a";
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(cropX, cropY, cropW, ch);

    // Rule-of-thirds grid inside crop
    ctx.strokeStyle = "rgba(67,146,106,0.3)";
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(cropX + (cropW / 3) * i, cropY); ctx.lineTo(cropX + (cropW / 3) * i, cropY + ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cropX, cropY + (ch / 3) * i); ctx.lineTo(cropX + cropW, cropY + (ch / 3) * i); ctx.stroke();
    }

    // Corner handles
    const corners = [[cropX, cropY], [cropX + cropW, cropY], [cropX, cropY + ch], [cropX + cropW, cropY + ch]] as [number,number][];
    corners.forEach(([hx, hy]) => {
      ctx.fillStyle = "#43926a";
      ctx.shadowColor = "#43926a";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(hx, hy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }, [img, cropX, cropY, cropW]);

  const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPos(e);
    setIsDragging(true);
    setDragStart({ x: pos.x - cropX, y: pos.y - cropY });
  };

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !img) return;
    const pos = getCanvasPos(e);
    const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (CANVAS_W - dw) / 2;
    const dy = (CANVAS_H - dh) / 2;
    const ch = cropW / ASPECT;
    let nx = pos.x - dragStart.x;
    let ny = pos.y - dragStart.y;
    nx = Math.max(dx, Math.min(nx, dx + dw - cropW));
    ny = Math.max(dy, Math.min(ny, dy + dh - ch));
    setCropX(nx);
    setCropY(ny);
  }, [isDragging, dragStart, cropW, img]);

  const handleCrop = async () => {
    if (!img) return;
    setStage("removing-bg");

    try {
      const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height);
      const dx = (CANVAS_W - img.width * scale) / 2;
      const dy = (CANVAS_H - img.height * scale) / 2;

      const out = document.createElement("canvas");
      out.width = 1920; out.height = 1080;
      const ctx = out.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 1920, 1080);

      const srcX = (cropX - dx) / scale;
      const srcY = (cropY - dy) / scale;
      const srcW = cropW / scale;
      const srcH = srcW / ASPECT;
      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, 1920, 1080);

      const blob: Blob = await new Promise((res) => out.toBlob((b) => res(b!), "image/png", 0.95));
      const file = new File([blob], "cropped.png", { type: "image/png" });

      const rbForm = new FormData();
      rbForm.append("file", file);
      const rbRes = await fetch("/api/remove-bg", { method: "POST", body: rbForm });

      let finalFile: File;
      if (rbRes.ok) {
        const skipped = rbRes.headers.get("X-Skipped");
        if (skipped) setBgNote("Background removal skipped (no API key).");
        const finalBlob = await rbRes.blob();
        finalFile = new File([finalBlob], "signature.png", { type: "image/png" });
      } else {
        finalFile = file;
      }

      setStage("done");
      onComplete(finalFile);
    } catch {
      setStage("crop");
    }
  };

  const isProcessing = stage === "removing-bg" || stage === "uploading";

  const stageInfo: Record<ProcessingStage, { icon: React.ReactNode; label: string; sub: string; color: string }> = {
    crop: { icon: <Crop size={18} />, label: "Adjust & Crop", sub: "Drag to position · Slider to resize", color: "text-emerald-400" },
    "removing-bg": { icon: <Sparkles size={18} className="animate-pulse" />, label: "Removing Background…", sub: "Sending to remove.bg", color: "text-violet-400" },
    uploading: { icon: <Loader2 size={18} className="animate-spin" />, label: "Uploading…", sub: "Saving to cloud storage", color: "text-blue-400" },
    done: { icon: <Check size={18} />, label: "Done!", sub: "Your signature is saved", color: "text-emerald-400" },
  };

  const info = stageInfo[stage];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center ${info.color}`}>
              {info.icon}
            </div>
            <div>
              <p className={`font-outfit font-bold text-sm ${info.color}`}>{info.label}</p>
              <p className="font-outfit text-xs text-zinc-500 mt-0.5">{info.sub}</p>
            </div>
          </div>
          <button onClick={onCancel} disabled={isProcessing} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors rounded-xl hover:bg-white/5 disabled:opacity-30">
            <X size={16} />
          </button>
        </div>

        {/* Canvas */}
        <div className="relative p-4 bg-zinc-950">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={`w-full rounded-2xl border border-white/5 ${isProcessing ? "opacity-30 pointer-events-none" : "cursor-move"}`}
            style={{ background: "#0a0a0a" }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          />
          {isProcessing && (
            <div className="absolute inset-4 flex flex-col items-center justify-center rounded-2xl">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Sparkles size={28} className="text-violet-400 animate-pulse" />
                </div>
              </div>
              <p className="font-outfit text-sm font-bold text-white mt-4">
                {stage === "removing-bg" ? "Removing background with AI…" : "Uploading to cloud…"}
              </p>
              <p className="font-outfit text-xs text-zinc-500 mt-1">This may take a few seconds</p>
            </div>
          )}
        </div>

        {/* Controls */}
        {!isProcessing && (
          <div className="px-5 pb-2 pt-1">
            <div className="flex items-center gap-3">
              <span className="font-outfit text-[10px] uppercase tracking-widest text-zinc-600">Size</span>
              <input
                type="range"
                min={80}
                max={CANVAS_W * 0.95}
                value={cropW}
                onChange={(e) => {
                  const newW = Number(e.target.value);
                  const scale = img ? Math.min(CANVAS_W / img.width, CANVAS_H / img.height) : 1;
                  const dw = img ? img.width * scale : CANVAS_W;
                  const dx = img ? (CANVAS_W - dw) / 2 : 0;
                  setCropW(Math.min(newW, dw - (cropX - dx)));
                }}
                className="flex-1 h-1.5 rounded-full appearance-none bg-zinc-800 accent-emerald-500"
              />
              <span className="font-outfit text-[10px] uppercase tracking-widest text-zinc-600">16:9</span>
            </div>
            {bgNote && (
              <div className="flex items-center gap-2 text-amber-400 text-xs font-outfit mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                <AlertTriangle size={12} /> {bgNote}
              </div>
            )}
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-3 px-5 py-5 border-t border-white/5">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 rounded-2xl font-outfit font-bold text-sm transition-all disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={isProcessing || !img}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white rounded-2xl font-outfit font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {isProcessing ? (
              <><Loader2 size={16} className="animate-spin" /> Processing…</>
            ) : (
              <><Check size={16} /> Use This Crop</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
