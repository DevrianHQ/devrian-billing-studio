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

/**
 * Renders an A4 page element to an ultra-high-resolution PNG.
 * Primary: html-to-image (uses browser's native C++ rendering engine via SVG foreignObject)
 * Fallback: html2canvas at 3x resolution.
 */
async function renderPageElementToPng(el: HTMLElement): Promise<string> {
  try {
    const dataUrl = await toPng(el, {
      pixelRatio: 3,
      quality: 1.0,
      backgroundColor: '#ffffff',
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
    console.warn('html-to-image encountered issue, falling back to html2canvas:', err);
  }

  // Fallback
  const canvas = await html2canvas(el, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: 1920,
  });
  return canvas.toDataURL('image/png');
}

/**
 * Exports one or more A4 page elements to a multi-page PDF.
 * Ensures 100% exact, pixel-perfect fidelity matching the live preview.
 */
export async function exportElementsToPdf(
  elements: HTMLElement[],
  fileName: string,
  options?: ExportPdfOptions
): Promise<boolean> {
  if (!elements || elements.length === 0) {
    throw new Error('No pages found to export');
  }

  // 1. Ensure all custom web fonts (Poppins, etc.) are 100% loaded before rasterizing
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // 2. Temporarily reset any CSS transforms (e.g. editor zoom scale(0.75)) on ancestor containers
  // so the DOM measures at true 1:1 unscaled A4 dimensions without distortion.
  const transformedAncestors: { element: HTMLElement; originalTransform: string }[] = [];
  elements.forEach((el) => {
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

  // Temporarily remove shadow from pages during capture so it doesn't bleed into the A4 PDF
  const originalShadows = elements.map((el) => el.style.boxShadow);
  elements.forEach((el) => {
    el.style.boxShadow = 'none';
  });

  // Allow DOM to settle after resetting transforms
  await new Promise((resolve) => setTimeout(resolve, 80));

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const totalPages = elements.length;

  try {
    for (let i = 0; i < totalPages; i++) {
      const el = elements[i];
      options?.onProgress?.(
        Math.round((i / totalPages) * 100),
        `Rendering page ${i + 1} of ${totalPages}...`
      );

      // Render with native browser engine for 100% visual parity
      const imgData = await renderPageElementToPng(el);
      if (typeof window !== 'undefined') {
        (window as any).__lastExportedPng = imgData;
      }

      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // Add high-resolution image to PDF page
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'SLOW');
    }

    if (options?.metadata) {
      pdf.setProperties({
        title: options.metadata.title || 'DEVRIAN Document',
        author: options.metadata.author || 'DEVRIAN',
        creator: options.metadata.creator || 'DEVRIAN Billing Studio',
        subject: options.metadata.subject || '',
      });
    }

    options?.onProgress?.(100, 'Saving PDF...');
    pdf.save(fileName);
    return true;
  } finally {
    // 3. Restore all original transforms and box-shadows
    transformedAncestors.forEach(({ element, originalTransform }) => {
      element.style.transform = originalTransform;
    });
    elements.forEach((el, idx) => {
      el.style.boxShadow = originalShadows[idx] || '';
    });
  }
}
