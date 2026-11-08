import { exportElementsToPdf, ExportPdfOptions, PdfExportResult } from '../../../../src/services/pdfExport';

export async function exportPolicyPagesToPdf(
  pages: HTMLElement[],
  filename: string,
  options?: ExportPdfOptions
): Promise<PdfExportResult> {
  return exportElementsToPdf(pages, filename, {
    ...options,
    metadata: {
      title: 'DEVRIAN Terms & Conditions and Policies',
      author: 'DEVRIAN',
      creator: 'DEVRIAN Billing Studio',
      subject: 'Master Commercial Terms, Conditions and Policies',
      ...options?.metadata,
    },
  });
}

