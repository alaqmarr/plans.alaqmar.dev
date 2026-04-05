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
  accentL: [237, 247, 240] as [number, number, number],
  dark:    [26, 46, 53] as [number, number, number],
  mid:     [74, 93, 104] as [number, number, number],
  light:   [138, 154, 163] as [number, number, number],
  white:   [255, 255, 255] as [number, number, number],
  border:  [226, 232, 240] as [number, number, number],
};

function buildInvoicePdf(data: InvoiceData): jsPDF {
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
  pdf.text("This is a computer generated invoice and does not require a signature.", W / 2, dY, { align: "center" });

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
export function downloadInvoicePdf(data: InvoiceData, filename: string) {
  buildInvoicePdf(data).save(filename);
}

/** Get invoice PDF as Blob for upload */
export function generateInvoicePdfBlob(data: InvoiceData): Blob {
  return buildInvoicePdf(data).output('blob');
}
