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

  // ── Top Bar ──
  pdf.setFillColor(...C.accent);
  pdf.rect(0, 0, W, 3, 'F');

  // ── Header ──
  let y = 16;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(...C.accent);
  pdf.text("THE WEB SENSEI", M, y);

  pdf.setFontSize(7);
  pdf.setTextColor(...C.light);
  pdf.text("SECUNDERABAD 500015, TELANGANA", M, y + 7);

  pdf.setFontSize(24);
  pdf.setTextColor(...C.dark);
  pdf.text("INVOICE", W - M, y, { align: "right" });

  pdf.setFontSize(9);
  pdf.setTextColor(...C.accent);
  pdf.text(`#${data.invoiceNumber}`, W - M, y + 7, { align: "right" });

  // ── Divider ──
  y = 34;
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(M, y, W - M, y);

  // ── Billed To & Meta ──
  y = 42;
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.light);
  pdf.text("BILLED TO", M, y);

  pdf.setFontSize(13);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.clientName.toUpperCase(), M, y + 6);

  // Right side meta
  const rx = W - M;
  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.light);
  pdf.text("DATE", rx - 44, y, { align: "right" });
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(fmtDate(data.date), rx, y, { align: "right" });

  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.light);
  pdf.text("INVOICE NO", rx - 44, y + 6, { align: "right" });
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.invoiceNumber, rx, y + 6, { align: "right" });

  // ── Items Table ──
  y = 60;
  const cols = { desc: M + 5, qty: M + CW * 0.55, rate: M + CW * 0.75, amt: W - M - 5 };

  // Header row
  pdf.setFillColor(...C.accent);
  pdf.roundedRect(M, y, CW, 10, 2, 2, 'F');

  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.white);
  const hy = y + 6.5;
  pdf.text("DESCRIPTION", cols.desc, hy);
  pdf.text("QTY", cols.qty, hy, { align: "center" });
  pdf.text("RATE", cols.rate, hy, { align: "right" });
  pdf.text("AMOUNT", cols.amt, hy, { align: "right" });

  // Data rows
  y += 12;
  data.items.forEach((item) => {
    const ry = y + 6;
    pdf.setFontSize(9);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.dark);
    pdf.text(item.description, cols.desc, ry);

    pdf.setTextColor(...C.mid);
    pdf.text(item.qty.toString(), cols.qty, ry, { align: "center" });
    pdf.text(`${formatINR(item.price)}`, cols.rate, ry, { align: "right" });

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...C.dark);
    pdf.text(`${formatINR(item.total)}`, cols.amt, ry, { align: "right" });

    y += 10;
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.15);
    pdf.line(M + 3, y, W - M - 3, y);
  });

  // ── Totals ──
  const tY = Math.max(y + 35, 155);
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(W - M - 80, tY - 4, W - M, tY - 4);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("SUBTOTAL", W - M - 44, tY, { align: "right" });
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(formatINR(data.subtotal), W - M - 5, tY, { align: "right" });

  let cY = tY;
  if (data.discount > 0) {
    cY += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.mid);
    pdf.text("DISCOUNT", W - M - 44, cY, { align: "right" });
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...C.accent);
    pdf.text(`-${formatINR(data.discount)}`, W - M - 5, cY, { align: "right" });
  }

  cY += 5;
  pdf.setDrawColor(...C.border);
  pdf.line(W - M - 80, cY, W - M, cY);

  cY += 8;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text("GRAND TOTAL", W - M - 44, cY, { align: "right" });
  pdf.setFontSize(16);
  pdf.setTextColor(...C.accent);
  pdf.text(formatINR(data.grandTotal), W - M - 5, cY + 1, { align: "right" });

  // ── Bank Details & Terms ──
  const bY = H - 60;
  const bH = 30;
  const bGap = 5;
  const bW = (CW - bGap) / 2;

  // Bank box
  pdf.setFillColor(...C.accentL);
  pdf.roundedRect(M, bY, bW, bH, 2, 2, 'F');

  pdf.setFontSize(6);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.accent);
  pdf.text("PAYMENT DETAILS", M + 6, bY + 7);

  pdf.setFontSize(7.5);
  let bkY = bY + 13;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("Payee:", M + 6, bkY);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.bankDetails.payeeName, M + 22, bkY);

  bkY += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("A/C No:", M + 6, bkY);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.bankDetails.accountNumber, M + 22, bkY);

  bkY += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  pdf.text("IFSC:", M + 6, bkY);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.dark);
  pdf.text(data.bankDetails.ifsc, M + 22, bkY);

  // Terms box
  const tX = M + bW + bGap;
  pdf.setFillColor(...C.accentL);
  pdf.roundedRect(tX, bY, bW, bH, 2, 2, 'F');

  pdf.setFontSize(6);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.accent);
  pdf.text("NOTE & TERMS", tX + 6, bY + 7);

  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.mid);
  const tLines = [
    "This is a system-generated invoice and does not",
    "require a physical signature.",
    "",
    "Payment is due immediately upon receipt.",
    "",
    "All quoted figures are final and bound by the",
    "initial contract agreement.",
  ];
  let tlY = bY + 13;
  tLines.forEach((l) => { pdf.text(l, tX + 6, tlY); tlY += 3.2; });

  // ── Footer ──
  const fY = H - 22;
  pdf.setFillColor(...C.dark);
  pdf.rect(0, fY, W, 30, 'F');

  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.white);
  const fcY = fY + 7;
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
