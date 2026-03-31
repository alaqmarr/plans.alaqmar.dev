import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import { ReactNode } from "react";

/**
 * Creates a hidden DOM element, renders a React component into it,
 * captures it with html2canvas, and saves it as a scaled PDF.
 */
export const exportReactElementToPdf = async (element: ReactNode, filename: string) => {
  // Create a temporary container
  const container = document.createElement("div");
  // Position it off-screen, give it A4 proportions (e.g. 794px width for 96DPI)
  // Ensure background is pure white for a light theme
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  container.style.width = "794px";
  container.style.backgroundColor = "#ffffff";
  container.style.color = "#000000"; // Force light theme text color
  
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    // Await the rendering + font loading
    await new Promise<void>((resolve) => {
      root.render(<div id="pdf-export-wrapper" className="bg-white text-black p-8 font-outfit">{element}</div>);
      setTimeout(resolve, 800); // Give time for images/fonts to paint
    });

    const wrapper = document.getElementById("pdf-export-wrapper");
    if (!wrapper) throw new Error("Wrapper not found after render");

    const canvas = await html2canvas(wrapper, { 
      scale: 3, // High DPI for crisp text
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({ format: "a4", unit: "mm" });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    // Optional: basic multi-page support if layout overflows A4 height
    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } finally {
    // Cleanup
    setTimeout(() => {
      root.unmount();
      document.body.removeChild(container);
    }, 100);
  }
};
