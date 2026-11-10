const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BEFORE_DIR = path.resolve(__dirname, '../tmp/before');
fs.mkdirSync(BEFORE_DIR, { recursive: true });

async function runStep0Audit() {
  console.log('--- STEP 0: AUDIT FIRST ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1800 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('dialog', async (d) => {
    console.log(`  [Dialog] ${d.type()}: ${d.message()}`);
    await d.accept();
  });

  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Render baseline Invoice PDF
  console.log('Rendering baseline Invoice PDF...');
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = draftStr ? JSON.parse(draftStr) : {};
    draft.type = 'invoice';
    draft.documentNumber = 'DEV-2026-0089';
    draft.clientName = 'Apex Global Enterprises';
    draft.clientContactPerson = 'Rohan Mehra';
    draft.clientAddress = 'Tech Park, Whitefield, Bengaluru, KA 560066';
    draft.projectName = 'Enterprise Cloud Architecture';
    draft.items = [
      { id: '1', description: 'Cloud Architecture & Migration', subDescription: 'AWS & Kubernetes setup with high availability', quantity: 1, rate: 85000, amount: 85000 },
      { id: '2', description: 'DevOps CI/CD Automation', subDescription: 'GitHub Actions workflow pipeline with automated testing', quantity: 1, rate: 45000, amount: 45000 },
    ];
    draft.subtotal = 130000;
    draft.gstEnabled = false;
    draft.sectionVisibility = draft.sectionVisibility || {};
    draft.sectionVisibility.showGstLine = true;
    draft.sectionVisibility.showPaymentDetails = true;
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Download PDF
  const [downloadInvoice] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button:has-text("Download PDF")').first().click(),
  ]);
  const invoicePdfPath = path.join(BEFORE_DIR, 'invoice.pdf');
  await downloadInvoice.saveAs(invoicePdfPath);
  console.log(`  Saved baseline invoice: ${invoicePdfPath} (${fs.statSync(invoicePdfPath).size} bytes)`);

  // 2. Render baseline Receipt PDF
  console.log('Rendering baseline Receipt PDF...');
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = draftStr ? JSON.parse(draftStr) : {};
    draft.type = 'receipt';
    draft.documentNumber = 'DEV-REC-2026-0045';
    draft.clientName = 'Nexus Creative Labs';
    draft.clientContactPerson = 'Simran Kaur';
    draft.items = [
      { id: '1', description: '50% Advance - Brand Identity Design', subDescription: 'Logo, typography and brand book', quantity: 1, rate: 40000, amount: 40000 },
    ];
    draft.subtotal = 40000;
    draft.amountReceived = 40000;
    draft.paymentMode = 'UPI';
    draft.receiptTransactionId = 'UPI/20261108/9876543210';
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const [downloadReceipt] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('button:has-text("Download PDF")').first().click(),
  ]);
  const receiptPdfPath = path.join(BEFORE_DIR, 'receipt.pdf');
  await downloadReceipt.saveAs(receiptPdfPath);
  console.log(`  Saved baseline receipt: ${receiptPdfPath} (${fs.statSync(receiptPdfPath).size} bytes)`);

  await browser.close();
  console.log('Step 0 baselines safely recorded in /tmp/before');
}

runStep0Audit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});

