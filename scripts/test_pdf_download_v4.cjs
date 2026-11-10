const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v4');

async function testPdfDownload() {
  console.log('Testing PDF export for Quotations...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1080 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('dialog', async (d) => {
    console.log(`  [Dialog] ${d.type()}: ${d.message()}`);
    await d.accept();
  });

  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Set clean monthly quotation without any bracket placeholders
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = draftStr ? JSON.parse(draftStr) : {};
    draft.type = 'quotation';
    draft.quotationType = 'monthly';
    draft.documentNumber = 'DEV-QT-2026-0042';
    draft.clientName = 'Global Apex Ventures';
    draft.clientContactPerson = 'Aman Singhal';
    draft.clientAddress = 'Tower B, DLF Cyber City, Gurugram, HR';
    draft.projectName = 'Social Media Growth';
    draft.items = [
      {
        id: 'm1',
        description: 'Monthly Social Media Growth Retainer',
        subDescription: 'Full video creation, captions and community engagement',
        quantity: 1,
        rate: 50000,
        amount: 50000,
        billing: 'monthly',
      },
    ];
    draft.subtotal = 50000;
    draft.monthlyDeliverables = [
      { id: 'd1', item: 'Short-Form Reels', quantity: '12 / month', order: 1 },
      { id: 'd2', item: 'Carousel Graphics', quantity: '8 / month', order: 2 },
    ];
    draft.freeNotes = '';
    draft.inclusions = '';
    draft.exclusions = '';
    draft.deliveryTimeline = '';
    draft.sectionVisibility = {
      ...draft.sectionVisibility,
      showFreeNotes: false,
      showInclusions: false,
      showTimeline: false,
    };
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Trigger Download
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
  const exportBtn = page.locator('button:has-text("Export PDF"), button:has-text("Download PDF")').first();
  await exportBtn.click();

  const download = await downloadPromise;
  const suggestedFilename = download.suggestedFilename();
  console.log(`  Downloaded filename: ${suggestedFilename}`);

  const savePath = path.join(OUT_DIR, suggestedFilename);
  await download.saveAs(savePath);

  const stats = fs.statSync(savePath);
  console.log(`  File size: ${(stats.size / 1024).toFixed(1)} KB`);

  // Verify with pdf-lib
  const pdfBytes = fs.readFileSync(savePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();
  const firstPage = pdfDoc.getPage(0);
  const { width, height } = firstPage.getSize();

  console.log(`  PDF Pages: ${pageCount}`);
  console.log(`  Page dimensions: width=${width.toFixed(1)}pt, height=${height.toFixed(1)}pt`);
  // Standard A4 in points is 595.28 x 841.89
  const isA4 = Math.abs(width - 595.28) < 5 && Math.abs(height - 841.89) < 5;
  console.log(`  A4 Standard Size check: ${isA4 ? 'PASS' : 'FAIL'}`);

  if (suggestedFilename.startsWith('DEVRIAN_Quotation') && stats.size < 2 * 1024 * 1024 && isA4 && pageCount === 1) {
    console.log('  PASS: PDF Export passed all structural and visual checks!');
  } else {
    console.warn('  WARN: Check PDF validation conditions.');
  }

  await browser.close();
}

testPdfDownload().catch((err) => {
  console.error('PDF download error:', err);
  process.exit(1);
});

