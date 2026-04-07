import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import { ReactNode } from "react";

// ═══════════════════════════════════════════════════════
// GENERIC: React Element → Screenshot PDF (Plans, Quotes, Comparisons)
// ═══════════════════════════════════════════════════════

export const exportReactElementToPdf = async (element: ReactNode, filename: string) => {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "794px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000";
  
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    await new Promise<void>((resolve) => {
      root.render(<div id="pdf-export-wrapper" style={{ backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, Helvetica, sans-serif' }}>{element}</div>);
      setTimeout(resolve, 800);
    });

    const wrapper = document.getElementById("pdf-export-wrapper");
    if (!wrapper) throw new Error("Wrapper not found after render");

    const canvas = await html2canvas(wrapper, { 
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      ignoreElements: (el) => el.tagName === 'STYLE' || el.tagName === 'LINK',
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ format: "a4", unit: "mm" });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(container);
    }, 100);
  }
};


// ═══════════════════════════════════════════════════════
// INVOICE: Native Vector PDF (crisp text, selectable, tiny file)
// ═══════════════════════════════════════════════════════

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  clientName: string;
  items: { description: string; qty: number; price: number; total: number }[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  bankDetails: {
    payeeName: string;
    accountNumber: string;
    ifsc: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  // Optional: if set, a professional signature block is appended
  adminSignatureUrl?: string | null;
  adminSignatoryName?: string | null;
}

const formatINR = (n: number) => {
  const formatted = n.toLocaleString('en-IN');
  return formatted;
};

const fmtDate = (d: Date) => {
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]}, ${d.getFullYear()}`;
};

// Brand Colors
const C = {
  accent:  [67, 146, 106] as [number, number, number],
  accentDeep: [38, 98, 68] as [number, number, number],
  accentL: [237, 247, 240] as [number, number, number],
  dark:    [26, 46, 53] as [number, number, number],
  mid:     [74, 93, 104] as [number, number, number],
  light:   [138, 154, 163] as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
  border:  [226, 232, 240] as [number, number, number],
};

async function buildInvoicePdf(data: InvoiceData): Promise<jsPDF> {
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  const W = pdf.internal.pageSize.getWidth();   // 210
  const H = pdf.internal.pageSize.getHeight();  // 297
  const M = 20; // margin
  const CW = W - 2 * M; // 170
  // ── Watermark ──
  const wmText = "THE WEB SENSEI";
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(55); // slightly smaller to fit better diagonally
  pdf.setTextColor(242, 250, 246); // Very light green accent
  
  // Calculate text dimensions to center it manually
  const textWidth = pdf.getStringUnitWidth(wmText) * pdf.getFontSize() / pdf.internal.scaleFactor;
  // For a 45 degree angle, we offset by half the width and height
  // In jsPDF, when rotating, it rotates around the starting coordinate (bottom-left of text).
  const angleRad = (45 * Math.PI) / 180;
  
  // To center the text exactly at W/2, H/2:
  const startX = (W / 2) - (Math.cos(angleRad) * (textWidth / 2));
  const startY = (H / 2) + (Math.sin(angleRad) * (textWidth / 2));

  pdf.text(wmText, startX, startY, { angle: 45 });

  // ── Top Bar ──
  pdf.setFillColor(...C.accent);
  pdf.rect(0, 0, W, 4, 'F');

  // ── Header ──
  let y = 20;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(...C.accent);
  pdf.text("THE WEB SENSEI", M, y);

  pdf.setFontSize(8);
  pdf.setTextColor(...C.light);
  pdf.text("SECUNDERABAD 500015, TELANGANA", M, y + 6);

  pdf.setFontSize(26);
  pdf.setTextColor(...C.dark);
  pdf.text("INVOICE", W - M, y, { align: "right" });

  pdf.setFontSize(10);
  pdf.setTextColor(...C.accent);
  pdf.text(`#${data.invoiceNumber}`, W - M, y + 6, { align: "right" });

  // ── Divider ──
  y = 36;
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.4);
  pdf.line(M, y, W - M, y);

  // ── Billed To & Meta ──
  y = 48;
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.light);
  pdf.text("BILLED TO", M, y);

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  const clientNameLines = pdf.splitTextToSize(data.clientName.toUpperCase(), CW / 2);
  pdf.text(clientNameLines, M, y + 7);

  // Right side meta
  const rx = W - M;
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.light);
  pdf.text("DATE", rx - 44, y, { align: "right" });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(fmtDate(data.date), rx, y, { align: "right" });

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.light);
  pdf.text("INVOICE NO", rx - 44, y + 8, { align: "right" });
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.invoiceNumber, rx, y + 8, { align: "right" });

  // ── Items Table ──
  y = 75;
  const cols = { desc: M + 5, qty: M + CW * 0.55, rate: M + CW * 0.75, amt: W - M - 5 };

  // Header row
  pdf.setFillColor(...C.accent);
  pdf.roundedRect(M, y, CW, 12, 2, 2, 'F');

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.white);
  const hy = y + 7.5;
  pdf.text("DESCRIPTION", cols.desc, hy);
  pdf.text("QTY", cols.qty, hy, { align: "center" });
  pdf.text("RATE", cols.rate, hy, { align: "right" });
  pdf.text("AMOUNT", cols.amt, hy, { align: "right" });

  // Data rows
  y += 16;
  data.items.forEach((item) => {
    // text wrapping for description
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const descLines = pdf.splitTextToSize(item.description, CW * 0.5);
    
    // ry is the starting y for this row
    const ry = y + 5;
    
    pdf.setTextColor(...C.dark);
    pdf.text(descLines, cols.desc, ry);

    pdf.setTextColor(...C.mid);
    pdf.text(item.qty.toString(), cols.qty, ry, { align: "center" });
    pdf.text(`${formatINR(item.price)}`, cols.rate, ry, { align: "right" });

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...C.dark);
    pdf.text(`${formatINR(item.total)}`, cols.amt, ry, { align: "right" });

    // increment y based on number of lines
    y += (descLines.length * 5) + 8;
    
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.2);
    pdf.line(M + 3, y, W - M - 3, y);
  });

  // ── Totals ──
  const tY = Math.max(y + 20, 160);
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.4);
  pdf.line(W - M - 80, tY - 6, W - M, tY - 6);

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("SUBTOTAL", W - M - 46, tY, { align: "right" });
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(formatINR(data.subtotal), W - M - 5, tY, { align: "right" });

  let cY = tY;
  if (data.discount > 0) {
    cY += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.mid);
    pdf.text("DISCOUNT", W - M - 46, cY, { align: "right" });
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...C.accent);
    pdf.text(`-${formatINR(data.discount)}`, W - M - 5, cY, { align: "right" });
  }

  cY += 6;
  pdf.setDrawColor(...C.border);
  pdf.line(W - M - 80, cY, W - M, cY);

  cY += 10;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text("GRAND TOTAL", W - M - 46, cY, { align: "right" });
  pdf.setFontSize(18);
  pdf.setTextColor(...C.accent);
  pdf.text(formatINR(data.grandTotal), W - M - 5, cY + 1, { align: "right" });

  // ── Bank Details & Terms ──
  const bY = H - 75;
  const bH = 34;
  const bGap = 6;
  const bW = (CW - bGap) / 2;

  // Bank box
  pdf.setFillColor(...C.accentL);
  pdf.roundedRect(M, bY, bW, bH, 3, 3, 'F');

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.accent);
  pdf.text("PAYMENT DETAILS", M + 6, bY + 8);

  pdf.setFontSize(8.5);
  let bkY = bY + 15;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("Payee:", M + 6, bkY);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.bankDetails.payeeName, M + 24, bkY);

  bkY += 6;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("A/C No:", M + 6, bkY);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.bankDetails.accountNumber, M + 24, bkY);

  bkY += 6;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("IFSC:", M + 6, bkY);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.bankDetails.ifsc, M + 24, bkY);

  // Terms box
  const tX = M + bW + bGap;
  pdf.setFillColor(...C.accentL);
  pdf.roundedRect(tX, bY, bW, bH, 3, 3, 'F');

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.accent);
  pdf.text("NOTE & TERMS", tX + 6, bY + 8);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  const tLines = [
    "Payment is due immediately upon receipt.",
    "",
    "All quoted figures are final and bound by the",
    "initial contract agreement.",
  ];
  let tlY = bY + 15;
  tLines.forEach((l) => { pdf.text(l, tX + 6, tlY); tlY += 4; });

  // ── Computer Generated Disclaimer ──
  const dY = H - 35;
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...C.mid);
  // ── Signature / Disclaimer ──
  if (data.adminSignatureUrl) {
    // Signature block — admin has a saved signature
    const sigY = H - 58;
    const sigBlockW = (CW - 8) / 2;
    const sigImgH = sigBlockW * (9 / 16);

    pdf.setFillColor(...C.accentL);
    pdf.roundedRect(M, sigY, sigBlockW, sigImgH + 18, 2, 2, 'F');

    const adminImg = await loadImageAsBase64(data.adminSignatureUrl);
    if (adminImg) {
      try { pdf.addImage(adminImg, "PNG", M + 4, sigY + 4, sigBlockW - 8, sigImgH - 4); } catch { /* skip */ }
    }

    const sigTextY = sigY + sigImgH + 13;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...C.dark);
    pdf.text(data.adminSignatoryName || "AL AQMAR", M + 4, sigTextY);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(...C.mid);
    pdf.text("Authorised Signatory — The Web Sensei", M + 4, sigTextY + 4);

    // Note on right side
    const noteX = M + sigBlockW + 8;
    pdf.setFillColor(...C.accentL);
    pdf.roundedRect(noteX, sigY, sigBlockW, sigImgH + 18, 2, 2, 'F');
    pdf.setFontSize(6.5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.mid);
    const noteLines = [
      "This is a computer generated invoice.",
      "Electronic signature is legally valid",
      "under the IT Act, 2000.",
      "",
      "Payment is due immediately upon receipt.",
    ];
    let nlY = sigY + 10;
    noteLines.forEach((l) => { pdf.text(l, noteX + 5, nlY); nlY += 4; });
  } else {
    // No signature — just the disclaimer text
    const dY = H - 35;
    pdf.setFontSize(8.5);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(...C.mid);
    pdf.text("This is a computer generated invoice and does not require a signature.", W / 2, dY, { align: "center" });
  }

  // ── Footer ──
  const fY = H - 24;
  pdf.setFillColor(...C.dark);
  pdf.rect(0, fY, W, 30, 'F');

  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.white);
  const fcY = fY + 8;
  pdf.text(data.contact.phone, M, fcY);
  pdf.text(data.contact.email, W / 2, fcY, { align: "center" });
  pdf.text(data.contact.website, W - M, fcY, { align: "right" });

  return pdf;
}

/** Download invoice as PDF */
export async function downloadInvoicePdf(data: InvoiceData, filename: string) {
  (await buildInvoicePdf(data)).save(filename);
}

/** Get invoice PDF as Blob for upload */
export async function generateInvoicePdfBlob(data: InvoiceData): Promise<Blob> {
  return (await buildInvoicePdf(data)).output('blob');
}


// ═══════════════════════════════════════════════════════
// AGREEMENT: Multi-page vector PDF with signature blocks
// ═══════════════════════════════════════════════════════

export interface AgreementPdfData {
  agreementText: string;
  clientName: string;
  agreementDate: Date;
  adminSignatoryName: string;
  adminSignatureUrl?: string | null;
  adminSignedAt?: Date | null;
  clientSignatoryName?: string | null;
  clientSignatureUrl?: string | null;
  clientSignedAt?: Date | null;
  adminVerified?: boolean;
}

/** Loads a remote image through proxy to avoid CORS, returns base64 data URL */
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    const { base64 } = await res.json();
    return base64;
  } catch {
    return null;
  }
}

export async function buildAgreementPdfAsync(data: AgreementPdfData): Promise<jsPDF> {
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 18;
  const CW = W - 2 * M;

  const addWatermark = () => {
    const wmText = "THE WEB SENSEI";
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(55);
    pdf.setTextColor(242, 250, 246);
    const textWidth = pdf.getStringUnitWidth(wmText) * pdf.getFontSize() / pdf.internal.scaleFactor;
    const angleRad = (45 * Math.PI) / 180;
    const startX = (W / 2) - (Math.cos(angleRad) * (textWidth / 2));
    const startY = (H / 2) + (Math.sin(angleRad) * (textWidth / 2));
    pdf.text(wmText, startX, startY, { angle: 45 });
  };

  const addHeader = (pageNum: number) => {
    addWatermark();
    pdf.setFillColor(...C.accent);
    pdf.rect(0, 0, W, 4, 'F');
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(...C.accent);
    pdf.text("THE WEB SENSEI", M, 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...C.light);
    pdf.text("SERVICE AGREEMENT", M, 20);
    if (pageNum > 1) {
      pdf.setFontSize(8);
      pdf.text(`Page ${pageNum}`, W - M, 14, { align: "right" });
    }
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.3);
    pdf.line(M, 24, W - M, 24);
  };

  const addFooter = () => {
    const fY = H - 14;
    pdf.setFillColor(...C.dark);
    pdf.rect(0, fY, W, 20, 'F');
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.white);
    pdf.text("+91 96184 43558", M, fY + 7);
    pdf.text("info@alaqmar.dev", W / 2, fY + 7, { align: "center" });
    pdf.text("https://alaqmar.dev", W - M, fY + 7, { align: "right" });
  };

  // Page 1 header: big title
  addWatermark();
  pdf.setFillColor(...C.accent);
  pdf.rect(0, 0, W, 4, 'F');

  let y = 16;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...C.accent);
  pdf.text("THE WEB SENSEI", M, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...C.light);
  pdf.text("SECUNDERABAD 500015, TELANGANA, INDIA", M, y + 6);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...C.dark);
  pdf.text("SERVICE AGREEMENT", W - M, y, { align: "right" });

  pdf.setFontSize(9);
  pdf.setTextColor(...C.accent);
  pdf.text(fmtDate(data.agreementDate), W - M, y + 6, { align: "right" });

  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.4);
  pdf.line(M, y + 12, W - M, y + 12);

  y += 20;

  // Render the agreement text page by page
  const lines = data.agreementText.split("\n");
  const PAGE_CONTENT_H = H - 30; // leave room for footer

  let pageNum = 1;

  const nextPage = () => {
    addFooter();
    pdf.addPage();
    pageNum++;
    addHeader(pageNum);
    y = 32;
  };

  for (const rawLine of lines) {
    if (y > PAGE_CONTENT_H) nextPage();

    // Section dividers
    if (rawLine.startsWith("────")) {
      pdf.setDrawColor(...C.border);
      pdf.setLineWidth(0.2);
      pdf.line(M, y, W - M, y);
      y += 3;
      continue;
    }

    // Section headers (e.g. "1. SCOPE OF WORK")
    const isSectionHeader = /^\d+\.\s+[A-Z\s&]+$/.test(rawLine.trim());
    const isDocTitle = rawLine === "SERVICE AGREEMENT";
    const isEmpty = rawLine.trim() === "";

    if (isEmpty) {
      y += 1.5;
      continue;
    }

    if (isDocTitle) {
      // Skip — already drawn in header
      continue;
    }

    if (isSectionHeader) {
      if (y > PAGE_CONTENT_H - 15) nextPage();
      y += 2;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(...C.accentDeep);
      pdf.text(rawLine.trim(), M, y);
      y += 4.5;
      continue;
    }

    // "SERVICE PROVIDER:" / "CLIENT:" subheadings
    if (/^(SERVICE PROVIDER|CLIENT):$/.test(rawLine.trim())) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...C.accent);
      pdf.text(rawLine.trim(), M, y);
      y += 4;
      continue;
    }

    // Normal text / bullet points
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...C.dark);

    const isIndented = rawLine.startsWith("   ");
    const xOffset = isIndented ? M + 4 : M;
    const maxW = CW - (isIndented ? 4 : 0);
    const wrapped = pdf.splitTextToSize(rawLine.trim(), maxW);

    for (const wl of wrapped) {
      if (y > PAGE_CONTENT_H) nextPage();
      pdf.text(wl, xOffset, y);
      y += 4.2;
    }
  }

  // Signature block — always on a new page if < 105mm left to ensure no overflow
  if (y > PAGE_CONTENT_H - 105) nextPage();

  y += 8;
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.4);
  pdf.line(M, y, W - M, y);
  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(...C.dark);
  pdf.text("SIGNATURES", M, y);
  y += 8;

  // Load signature images
  const [adminImgB64, clientImgB64] = await Promise.all([
    data.adminSignatureUrl ? loadImageAsBase64(data.adminSignatureUrl) : Promise.resolve(null),
    data.clientSignatureUrl ? loadImageAsBase64(data.clientSignatureUrl) : Promise.resolve(null),
  ]);

  const sigBlockW = 75; // Smaller than the original 82mm+ but big enough to look neat
  const sigImgW = sigBlockW - 10;
  const sigImgH = sigImgW * (9 / 16); // 36.5mm
  const boxHeight = sigImgH + 30; // ~66mm total box height

  // Admin signature box
  pdf.setFillColor(...C.accentL);
  pdf.roundedRect(M, y, sigBlockW, boxHeight, 3, 3, 'F');
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.accent);
  pdf.text("SERVICE PROVIDER", M + 5, y + 7);
  pdf.text("THE WEB SENSEI", M + 5, y + 13);

  if (adminImgB64) {
    try {
      pdf.addImage(adminImgB64, "PNG", M + 5, y + 16, sigImgW, sigImgH);
    } catch { /* skip */ }
  } else {
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.3);
    pdf.line(M + 5, y + 16 + sigImgH - 2, M + sigBlockW - 5, y + 16 + sigImgH - 2);
  }

  const textY = y + 16 + sigImgH + 5;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...C.dark);
  pdf.text(data.adminSignatoryName, M + 5, textY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...C.mid);
  pdf.text(data.adminSignedAt ? `Signed: ${fmtDate(data.adminSignedAt)}` : "Not yet signed", M + 5, textY + 5);

  // Client signature box
  const clientX = W - M - sigBlockW;
  pdf.setFillColor(...C.accentL);
  pdf.roundedRect(clientX, y, sigBlockW, boxHeight, 3, 3, 'F');
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.accent);
  pdf.text("CLIENT", clientX + 5, y + 7);
  pdf.text(data.clientName.toUpperCase(), clientX + 5, y + 13);

  if (clientImgB64) {
    try {
      pdf.addImage(clientImgB64, "PNG", clientX + 5, y + 16, sigImgW, sigImgH);
    } catch { /* skip */ }
  } else {
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.3);
    pdf.line(clientX + 5, y + 16 + sigImgH - 2, clientX + sigBlockW - 5, y + 16 + sigImgH - 2);
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...C.dark);
  pdf.text(data.clientSignatoryName || "Authorised Signatory", clientX + 5, textY);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(...C.mid);
  pdf.text(data.clientSignedAt ? `Signed: ${fmtDate(data.clientSignedAt)}` : "Not yet signed", clientX + 5, textY + 5);

  // Verified stamp
  if (data.adminVerified) {
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...C.accent);
    pdf.text("✓ SIGNATURE VERIFIED BY THE WEB SENSEI", W / 2, textY + 12, { align: "center" });
  }

  // Disclaimer
  y = textY + 18;
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...C.mid);
  pdf.text("This is a digitally executed agreement. Electronic signatures are legally binding under the Information Technology Act, 2000.", W / 2, y, { align: "center", maxWidth: CW });

  addFooter();
  return pdf;
}

export async function downloadAgreementPdf(data: AgreementPdfData, filename: string) {
  const pdf = await buildAgreementPdfAsync(data);
  pdf.save(filename);
}

export async function generateAgreementPdfBlob(data: AgreementPdfData): Promise<Blob> {
  const pdf = await buildAgreementPdfAsync(data);
  return pdf.output('blob');
}
