import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  fileName?: string;
  onProgress?: (progress: number, message: string) => void;
  metadata?: {
    title?: string;
    author?: string;
    creator?: string;
    subject?: string;
  };
}

export interface PdfExportResult {
  success: boolean;
  pdfBase64?: string;
}

/**
 * Dedicated, isolated high-fidelity A4 PDF exporter for DEVRIAN Terms & Policies.
 * Uses native browser C++ rasterizer (html-to-image) with skipFonts: true so cross-origin
 * stylesheet security errors never occur, and dynamically detects the page background color
 * (preserving pure #0A0A0A for Page 1 & 6 and #FFFFFF for Pages 2-5).
 */
async function renderPolicyPageToPng(el: HTMLElement): Promise<string> {
  // Determine page background color from element's inline style or computed style
  const comp = typeof window !== 'undefined' ? window.getComputedStyle(el) : null;
  const pageBg = el.style.backgroundColor || comp?.backgroundColor || '#ffffff';

  // Primary renderer: html-to-image with skipFonts: true for native browser SVG rendering
  try {
    const dataUrl = await toPng(el, {
      pixelRatio: 2.5,
      quality: 1.0,
      skipFonts: true,
      backgroundColor: pageBg,
      cacheBust: true,
      style: {
        transform: 'none',
        boxShadow: 'none',
        margin: '0',
      },
    });

    if (dataUrl && dataUrl.length > 1000) {
      return dataUrl;
    }
  } catch (err) {
    console.warn('[Policies PDF] html-to-image primary renderer issue, using fallback:', err);
  }

  // Resilient fallback: html2canvas with matched background color
  const canvas = await html2canvas(el, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: pageBg === 'rgba(0, 0, 0, 0)' || pageBg === 'transparent' ? null : pageBg,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
  });

  return canvas.toDataURL('image/png');
}

export async function exportPolicyPagesToPdf(
  pages: HTMLElement[],
  filename: string,
  options?: ExportPdfOptions
): Promise<PdfExportResult> {
  if (!pages || pages.length === 0) {
    throw new Error('No pages found to export');
  }

  // 1. Ensure fonts are ready
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // 2. Temporarily reset zoom / transform on ancestors so DOM measures at true 1:1 A4
  const transformedAncestors: { element: HTMLElement; originalTransform: string }[] = [];
  pages.forEach((el) => {
    let parent = el.parentElement;
    while (parent) {
      if (parent.style.transform && parent.style.transform !== 'none') {
        transformedAncestors.push({
          element: parent,
          originalTransform: parent.style.transform,
        });
        parent.style.transform = 'none';
      }
      parent = parent.parentElement;
    }
  });

  // Temporarily reset box-shadows on pages
  const originalShadows = pages.map((el) => el.style.boxShadow);
  pages.forEach((el) => {
    el.style.boxShadow = 'none';
  });

  // Settle DOM
  await new Promise((resolve) => setTimeout(resolve, 80));

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const totalPages = pages.length;

  try {
    for (let i = 0; i < totalPages; i++) {
      const el = pages[i];
      options?.onProgress?.(
        Math.round((i / totalPages) * 100),
        `Rendering page ${i + 1} of ${totalPages}...`
      );

      const imgData = await renderPolicyPageToPng(el);

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'SLOW');
    }

    pdf.setProperties({
      title: options?.metadata?.title || 'DEVRIAN Terms & Conditions and Policies',
      author: options?.metadata?.author || 'DEVRIAN',
      creator: options?.metadata?.creator || 'DEVRIAN Billing Studio',
      subject: options?.metadata?.subject || 'Commercial Terms & Conditions and Policies',
    });

    options?.onProgress?.(100, 'Saving PDF...');
    pdf.save(filename);
    const pdfBase64 = pdf.output('datauristring');
    return { success: true, pdfBase64 };
  } finally {
    // Restore ancestors transforms and shadows
    transformedAncestors.forEach(({ element, originalTransform }) => {
      element.style.transform = originalTransform;
    });
    pages.forEach((el, idx) => {
      el.style.boxShadow = originalShadows[idx];
    });
  }
}
