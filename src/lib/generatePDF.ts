import jsPDF from "jspdf";

interface CartItem {
  item: { name: string; price: number; isOneTime?: boolean };
  quantity: number;
}

// ════════════════════════════════════════
// Vector Symbol Drawing Helpers
// ════════════════════════════════════════

/** Draw ₹ symbol as vector lines + return width used */
function drawRupee(doc: jsPDF, x: number, y: number, size: number, color: [number, number, number]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.14);
  doc.setLineCap("round");
  // Top horizontal
  doc.line(x, y - size * 0.35, x + size * 0.55, y - size * 0.35);
  // Second horizontal
  doc.line(x, y - size * 0.1, x + size * 0.55, y - size * 0.1);
  // Vertical stem curve (simplified as line)
  doc.line(x + size * 0.12, y - size * 0.45, x + size * 0.12, y - size * 0.05);
  // Diagonal leg
  doc.line(x + size * 0.12, y - size * 0.1, x + size * 0.48, y + size * 0.35);
  return size * 0.65;
}

/** Format price with ₹ vector symbol and return the text portion */
function priceText(amount: number, suffix?: string): string {
  return `${amount.toLocaleString("en-IN")}${suffix || ""}`;
}

/** Draw a price with ₹ symbol at given position */
function drawPrice(doc: jsPDF, x: number, y: number, amount: number, fontSize: number, color: [number, number, number], align: "left" | "right" | "center" = "left", suffix?: string) {
  const text = priceText(amount, suffix);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  
  const textWidth = doc.getTextWidth(text);
  const rupeeSize = fontSize * 0.35;
  const gap = fontSize * 0.08;
  const totalWidth = rupeeSize * 0.65 + gap + textWidth;
  
  let startX = x;
  if (align === "right") startX = x - totalWidth;
  else if (align === "center") startX = x - totalWidth / 2;
  
  drawRupee(doc, startX, y, rupeeSize, color);
  doc.text(text, startX + rupeeSize * 0.65 + gap, y);
}

/** Draw checkmark as vector path */
function drawCheck(doc: jsPDF, cx: number, cy: number, size: number, bgColor: [number, number, number]) {
  // Background circle
  doc.setFillColor(...bgColor);
  doc.circle(cx, cy, size, "F");
  // Checkmark strokes
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(size * 0.3);
  doc.setLineCap("round");
  doc.line(cx - size * 0.35, cy + size * 0.05, cx - size * 0.05, cy + size * 0.35);
  doc.line(cx - size * 0.05, cy + size * 0.35, cx + size * 0.4, cy - size * 0.3);
}

/** Draw X mark as vector path */
function drawXMark(doc: jsPDF, cx: number, cy: number, size: number, bgColor: [number, number, number]) {
  doc.setFillColor(...bgColor);
  doc.circle(cx, cy, size, "F");
  doc.setDrawColor(100, 100, 110);
  doc.setLineWidth(size * 0.25);
  doc.setLineCap("round");
  const s = size * 0.3;
  doc.line(cx - s, cy - s, cx + s, cy + s);
  doc.line(cx + s, cy - s, cx - s, cy + s);
}

/** Draw up arrow as vector path */
function drawUpArrow(doc: jsPDF, cx: number, cy: number, size: number, bgColor: [number, number, number]) {
  doc.setFillColor(...bgColor);
  doc.circle(cx, cy, size, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(size * 0.28);
  doc.setLineCap("round");
  // Vertical line
  doc.line(cx, cy + size * 0.35, cx, cy - size * 0.25);
  // Arrow head
  doc.line(cx - size * 0.3, cy - size * 0.05, cx, cy - size * 0.38);
  doc.line(cx + size * 0.3, cy - size * 0.05, cx, cy - size * 0.38);
}

// ════════════════════════════════════════
// Custom Plan Quote PDF
// ════════════════════════════════════════

export function generateQuotePDF(
  cart: CartItem[],
  tenure: number,
  totalAmount: number,
  formData?: { name?: string; email?: string; phone?: string }
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, w, h, "F");

  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, w, 3, "F");

  // Brand header
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(15, 15, w - 30, 40, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("Alaqmar", 25, 35);
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170);
  doc.text("Custom Plan Quote", 25, 44);

  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`Date: ${date}`, w - 25, 30, { align: "right" });
  doc.text(`Ref: AQ-${Date.now().toString(36).toUpperCase()}`, w - 25, 37, { align: "right" });
  doc.text(`Tenure: ${tenure} Year${tenure > 1 ? "s" : ""}`, w - 25, 44, { align: "right" });

  let y = 70;

  // Client info
  if (formData?.name) {
    doc.setFillColor(24, 24, 27);
    doc.roundedRect(15, y, w - 30, 28, 4, 4, "F");
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text("PREPARED FOR", 25, y + 9);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(formData.name, 25, y + 19);
    if (formData.email) {
      doc.setFontSize(9);
      doc.setTextColor(161, 161, 170);
      doc.setFont("helvetica", "normal");
      doc.text(formData.email, w - 25, y + 15, { align: "right" });
    }
    if (formData.phone) {
      doc.text(formData.phone, w - 25, y + 22, { align: "right" });
    }
    y += 38;
  }

  // Table header
  doc.setFillColor(39, 39, 42);
  doc.roundedRect(15, y, w - 30, 12, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170);
  doc.text("COMPONENT", 25, y + 8);
  doc.text("QTY", w / 2 + 10, y + 8, { align: "center" });
  doc.text("UNIT PRICE", w - 60, y + 8, { align: "right" });
  doc.text("TOTAL", w - 25, y + 8, { align: "right" });
  y += 16;

  // Item rows
  cart.forEach((cartItem, i) => {
    const rowY = y + i * 14;
    if (i % 2 === 0) {
      doc.setFillColor(18, 18, 20);
      doc.rect(15, rowY - 4, w - 30, 14, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(228, 228, 231);
    const label = cartItem.item.isOneTime ? `${cartItem.item.name} (One-Time)` : cartItem.item.name;
    doc.text(label, 25, rowY + 5);
    doc.setTextColor(161, 161, 170);
    doc.text(`x${cartItem.quantity}`, w / 2 + 10, rowY + 5, { align: "center" });
    drawPrice(doc, w - 60, rowY + 5, cartItem.item.price, 9, [161, 161, 170], "right");
    const lineTotal = cartItem.item.isOneTime
      ? cartItem.item.price * cartItem.quantity
      : cartItem.item.price * cartItem.quantity * tenure;
    drawPrice(doc, w - 25, rowY + 5, lineTotal, 10, [129, 140, 248], "right");
  });

  y += cart.length * 14 + 8;

  doc.setDrawColor(63, 63, 70);
  doc.setLineWidth(0.3);
  doc.line(15, y, w - 15, y);
  y += 10;

  // Per-year
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  doc.text("Per-year cost:", 25, y);
  drawPrice(doc, w - 25, y, Math.round(totalAmount / tenure), 9, [161, 161, 170], "right", " / year");
  y += 12;

  // Total box
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(w / 2 - 10, y, w / 2 - 5, 18, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(199, 210, 254);
  doc.text("ESTIMATED TOTAL", w / 2, y + 8, { align: "left" });
  drawPrice(doc, w - 25, y + 13, totalAmount, 14, [255, 255, 255], "right");

  y += 30;
  doc.setDrawColor(39, 39, 42);
  doc.setLineWidth(0.2);
  doc.line(15, y, w - 15, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(82, 82, 91);
  const disclaimer = [
    "This is an estimated quote and not a binding contract. Final pricing may vary based on project scope.",
    "All prices are in Indian Rupees (INR). Taxes may apply as per applicable laws.",
    "This quote is valid for 30 days from the date of issue.",
    "Alaqmar | alaqmar.dev",
  ];
  disclaimer.forEach((line, i) => {
    doc.text(line, w / 2, y + i * 5, { align: "center" });
  });

  doc.setFillColor(99, 102, 241);
  doc.rect(0, h - 3, w, 3, "F");
  doc.save(`Alaqmar-Quote-${Date.now()}.pdf`);
}

// ════════════════════════════════════════
// Plan Detail PDF
// ════════════════════════════════════════

export function generatePlanPDF(
  plan: {
    name: string;
    description?: string;
    tenureYears: number;
    validity?: string;
    features: { feature: { name: string; price: number; isOneTime?: boolean }; isIncluded: boolean }[];
    paymentTerms: string;
  },
  offerPrice: number,
  basePrice: number
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const tenure = plan.tenureYears || 1;

  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, w, h, "F");
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, w, 3, "F");

  // Brand header
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(15, 15, w - 30, 40, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text("Alaqmar", 25, 35);
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170);
  doc.text(`${plan.name} - Plan Summary`, 25, 44);

  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  doc.text(`Date: ${date}`, w - 25, 30, { align: "right" });
  doc.text(`Ref: AQ-${Date.now().toString(36).toUpperCase()}`, w - 25, 37, { align: "right" });
  doc.text(`Tenure: ${plan.validity || `${tenure} Year${tenure > 1 ? "s" : ""}`}`, w - 25, 44, { align: "right" });

  let y = 68;

  // Pricing Summary
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(15, y, w - 30, 28, 4, 4, "F");
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text("PLAN PRICE", 25, y + 10);
  drawPrice(doc, 25, y + 22, offerPrice, 18, [255, 255, 255], "left");

  if (basePrice > offerPrice) {
    drawPrice(doc, 90, y + 22, basePrice, 11, [113, 113, 122], "left");
    // Strikethrough
    doc.setFontSize(11);
    const strikeTxt = priceText(basePrice);
    const stW = doc.getTextWidth(strikeTxt) + 8;
    doc.setDrawColor(239, 68, 68);
    doc.setLineWidth(0.4);
    doc.line(90, y + 20, 90 + stW, y + 20);
  }

  drawPrice(doc, w - 25, y + 22, Math.round(offerPrice / tenure), 9, [52, 211, 153], "right", " / year");
  y += 38;

  // Included Features Table
  doc.setFillColor(39, 39, 42);
  doc.roundedRect(15, y, w - 30, 12, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170);
  doc.text("INCLUDED FEATURES", 25, y + 8);
  doc.text("UNIT PRICE", w / 2 + 20, y + 8, { align: "center" });
  doc.text("TOTAL", w - 25, y + 8, { align: "right" });
  y += 16;

  const included = plan.features.filter(pf => pf.isIncluded);
  included.forEach((pf, i) => {
    const rowY = y + i * 12;
    if (i % 2 === 0) {
      doc.setFillColor(18, 18, 20);
      doc.rect(15, rowY - 3, w - 30, 12, "F");
    }

    drawCheck(doc, 22, rowY + 3, 2.2, [16, 185, 129]);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(228, 228, 231);
    const label = pf.feature.name + (pf.feature.isOneTime ? " (One-Time)" : "");
    doc.text(label, 28, rowY + 5);

    drawPrice(doc, w / 2 + 20, rowY + 5, pf.feature.price, 9, [161, 161, 170], "center");

    const lineTotal = pf.feature.isOneTime ? pf.feature.price : pf.feature.price * tenure;
    drawPrice(doc, w - 25, rowY + 5, lineTotal, 9, [129, 140, 248], "right");
  });

  y += included.length * 12 + 8;

  doc.setDrawColor(63, 63, 70);
  doc.setLineWidth(0.3);
  doc.line(15, y, w - 15, y);
  y += 12;

  // Payment Schedule
  let terms: { name: string; percent: number }[] = [];
  try { terms = JSON.parse(plan.paymentTerms || "[]"); } catch {}

  if (terms.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("Payment Schedule", 25, y);
    y += 10;

    terms.forEach((term, i) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(161, 161, 170);
      doc.text(`${term.name} (${term.percent}%)`, 25, y + i * 8);
      drawPrice(doc, w - 25, y + i * 8, Math.round((offerPrice * term.percent) / 100), 9, [52, 211, 153], "right");
    });
    y += terms.length * 8 + 8;
  }

  // Total box
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(w / 2 - 10, y, w / 2 - 5, 18, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(199, 210, 254);
  doc.text("TOTAL INVESTMENT", w / 2, y + 8, { align: "left" });
  drawPrice(doc, w - 25, y + 13, offerPrice, 14, [255, 255, 255], "right");

  y += 30;
  doc.setDrawColor(39, 39, 42);
  doc.setLineWidth(0.2);
  doc.line(15, y, w - 15, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(82, 82, 91);
  ["This is a plan summary and not a binding contract. Final pricing may vary.",
   "All prices are in Indian Rupees (INR). Taxes may apply as per applicable laws.",
   "This document is valid for 30 days from the date of issue.",
   "Alaqmar | alaqmar.dev",
  ].forEach((line, i) => {
    doc.text(line, w / 2, y + i * 5, { align: "center" });
  });

  doc.setFillColor(99, 102, 241);
  doc.rect(0, h - 3, w, 3, "F");
  doc.save(`Alaqmar-${plan.name.replace(/\s+/g, "-")}-Plan.pdf`);
}

// ════════════════════════════════════════
// Comparison Table PDF
// ════════════════════════════════════════

export function generateComparisonPDF(
  plans: {
    name: string;
    isPopular?: boolean;
    tenureYears: number;
    price: number;
    discountPrice?: number | null;
    features: { feature: { id: string; name: string; upgradedById?: string | null }; isIncluded: boolean }[];
  }[]
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  doc.setFillColor(9, 9, 11);
  doc.rect(0, 0, w, h, "F");
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, w, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("Plan Comparison", 20, 20);
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122);
  const date = new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  doc.text(`Alaqmar  |  ${date}`, 20, 27);

  // Collect all unique features
  const featureMap = new Map<string, { id: string; name: string; upgradedById?: string | null }>();
  plans.forEach(plan => {
    plan.features.forEach(pf => {
      if (pf.feature && !featureMap.has(pf.feature.id)) {
        featureMap.set(pf.feature.id, pf.feature);
      }
    });
  });
  const allFeatures = Array.from(featureMap.values());

  const startX = 20;
  const featureColW = 55;
  const planColW = Math.min(50, (w - startX - featureColW - 10) / plans.length);
  let y = 36;

  // Header row
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(startX, y, featureColW + planColW * plans.length, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  doc.text("FEATURES", startX + 5, y + 11);

  plans.forEach((plan, i) => {
    const cx = startX + featureColW + i * planColW + planColW / 2;
    if (plan.isPopular) {
      doc.setFontSize(5);
      doc.setTextColor(129, 140, 248);
      doc.text("POPULAR", cx, y + 6, { align: "center" });
    }
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(plan.name, cx, y + 12, { align: "center" });
  });
  y += 22;

  // Feature rows
  allFeatures.forEach((feature, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(18, 18, 20);
      doc.rect(startX, y - 3, featureColW + planColW * plans.length, 10, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(212, 212, 216);
    doc.text(feature.name, startX + 5, y + 4, { maxWidth: featureColW - 10 });

    plans.forEach((plan, pi) => {
      const cx = startX + featureColW + pi * planColW + planColW / 2;
      const isIncluded = plan.features.some(pf => pf.feature?.id === feature.id && pf.isIncluded);
      const hasUpgrade = feature.upgradedById
        ? plan.features.some(pf => pf.feature?.id === feature.upgradedById && pf.isIncluded)
        : false;

      if (isIncluded) {
        drawCheck(doc, cx, y + 3, 2.5, [16, 185, 129]);
      } else if (hasUpgrade) {
        drawUpArrow(doc, cx, y + 3, 2.5, [245, 158, 11]);
      } else {
        drawXMark(doc, cx, y + 3, 2.5, [50, 50, 55]);
      }
    });
    y += 10;
  });

  // Pricing rows
  y += 2;
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(startX, y, startX + featureColW + planColW * plans.length, y);
  y += 6;

  // Tenure
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  doc.text("TENURE", startX + 5, y + 4);
  plans.forEach((plan, i) => {
    const cx = startX + featureColW + i * planColW + planColW / 2;
    doc.setTextColor(212, 212, 216);
    doc.text(`${plan.tenureYears || 1} Yr${(plan.tenureYears || 1) > 1 ? "s" : ""}`, cx, y + 4, { align: "center" });
  });
  y += 10;

  // Total Amount
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  doc.text("TOTAL", startX + 5, y + 4);
  plans.forEach((plan, i) => {
    const cx = startX + featureColW + i * planColW + planColW / 2;
    const price = plan.discountPrice || plan.price || 0;
    drawPrice(doc, cx, y + 4, price, 9, [255, 255, 255], "center");
  });
  y += 10;

  // Per Year
  doc.setFontSize(7);
  doc.setTextColor(113, 113, 122);
  doc.text("PER YEAR", startX + 5, y + 4);
  plans.forEach((plan, i) => {
    const cx = startX + featureColW + i * planColW + planColW / 2;
    const price = plan.discountPrice || plan.price || 0;
    const perYear = Math.round(price / (plan.tenureYears || 1));
    drawPrice(doc, cx, y + 4, perYear, 8, [52, 211, 153], "center", "/yr");
  });

  // Legend
  y += 16;
  drawCheck(doc, startX + 5, y, 2, [16, 185, 129]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(161, 161, 170);
  doc.text("Included", startX + 10, y + 1.5);

  drawUpArrow(doc, startX + 35, y, 2, [245, 158, 11]);
  doc.text("Upgraded", startX + 40, y + 1.5);

  drawXMark(doc, startX + 68, y, 2, [50, 50, 55]);
  doc.text("Not Included", startX + 73, y + 1.5);

  doc.setFontSize(6);
  doc.setTextColor(63, 63, 70);
  doc.text("Alaqmar | alaqmar.dev", w / 2, h - 8, { align: "center" });

  doc.setFillColor(99, 102, 241);
  doc.rect(0, h - 3, w, 3, "F");
  doc.save(`Alaqmar-Plan-Comparison.pdf`);
}
