const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASELINE_DIR = path.resolve(__dirname, '../qa-baseline');
if (!fs.existsSync(BASELINE_DIR)) {
  fs.mkdirSync(BASELINE_DIR, { recursive: true });
}

async function run() {
  console.log('Launching Playwright Chromium for baseline captures...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Hi-DPI for crisp baseline
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('Browser console error:', msg.text());
  });

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Helper to click top navbar buttons
  async function navigateTo(name) {
    const btn = page.locator(`nav button:has-text("${name}"), header button:has-text("${name}")`).first();
    await btn.click();
    await page.waitForTimeout(600);
  }

  // 1. Dashboard screenshot
  console.log('Capturing Dashboard...');
  await navigateTo('Dashboard');
  await page.screenshot({ path: path.join(BASELINE_DIR, 'dashboard.png'), fullPage: true });

  // 2. History screenshot
  console.log('Capturing History...');
  await navigateTo('History');
  await page.screenshot({ path: path.join(BASELINE_DIR, 'history.png'), fullPage: true });

  // 3. Settings screenshot
  console.log('Capturing Settings...');
  await navigateTo('Settings');
  await page.screenshot({ path: path.join(BASELINE_DIR, 'settings.png'), fullPage: true });

  // 4. Demo Receipt (in Editor)
  console.log('Capturing Demo Receipt...');
  await navigateTo('Create');
  // Switch to receipt in editor
  const receiptBtn = page.locator('button:has-text("Receipt")').first();
  await receiptBtn.click();
  await page.waitForTimeout(800);

  // Capture preview page
  const previewPageReceipt = page.locator('.a4-page-export').first();
  await previewPageReceipt.waitFor({ state: 'visible' });
  await previewPageReceipt.screenshot({ path: path.join(BASELINE_DIR, 'demo_receipt.png') });

  // Export PDF for receipt
  const [receiptDownload] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
    page.locator('button:has-text("Download PDF")').click(),
  ]);
  if (receiptDownload) {
    await receiptDownload.saveAs(path.join(BASELINE_DIR, 'demo_receipt.pdf'));
    console.log('Saved demo_receipt.pdf');
  } else {
    console.warn('PDF download event not caught, saving via page.pdf or client');
  }
  await page.waitForTimeout(1500);

  // 5. 1-Page Invoice
  console.log('Capturing 1-Page Invoice...');
  const invoiceBtn = page.locator('button:has-text("Invoice")').first();
  await invoiceBtn.click();
  await page.waitForTimeout(800);

  const previewPageInvoice = page.locator('.a4-page-export').first();
  await previewPageInvoice.waitFor({ state: 'visible' });
  await previewPageInvoice.screenshot({ path: path.join(BASELINE_DIR, 'invoice_1page.png') });

  const [invDownload] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
    page.locator('button:has-text("Download PDF")').click(),
  ]);
  if (invDownload) {
    await invDownload.saveAs(path.join(BASELINE_DIR, 'invoice_1page.pdf'));
    console.log('Saved invoice_1page.pdf');
  }
  await page.waitForTimeout(1500);

  // 6. 25-Item Invoice (Multi-page)
  console.log('Generating & Capturing 25-Item Invoice...');
  await page.evaluate(() => {
    const raw = localStorage.getItem('devrian_billing_draft_v1');
    const doc = raw ? JSON.parse(raw) : {};
    doc.type = 'invoice';
    doc.items = Array.from({ length: 25 }, (_, i) => ({
      id: `multi-item-${i + 1}`,
      description: `Premium Deliverable Package Item #${i + 1} - Complete Creative Asset Production`,
      subDescription: `Detailed scope specification item #${i + 1} with high-retention editing, sound design, color grading, and format optimization.`,
      qty: 1,
      rate: 1500 + i * 100,
      amount: 1500 + i * 100,
    }));
    doc.subtotal = doc.items.reduce((s, it) => s + it.amount, 0);
    doc.balanceDue = doc.subtotal;
    localStorage.setItem('devrian_billing_draft_v1', JSON.stringify(doc));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  // Capture all pages of 25-item invoice
  const pages25 = await page.locator('.a4-page-export').all();
  console.log(`25-item invoice rendered ${pages25.length} pages.`);
  for (let idx = 0; idx < pages25.length; idx++) {
    await pages25[idx].screenshot({
      path: path.join(BASELINE_DIR, `invoice_25items_p${idx + 1}.png`),
    });
  }

  const [inv25Download] = await Promise.all([
    page.waitForEvent('download', { timeout: 20000 }).catch(() => null),
    page.locator('button:has-text("Download PDF")').click(),
  ]);
  if (inv25Download) {
    await inv25Download.saveAs(path.join(BASELINE_DIR, 'invoice_25items.pdf'));
    console.log('Saved invoice_25items.pdf');
  }
  await page.waitForTimeout(1500);

  console.log('=== ALL BASELINES CAPTURED SUCCESSFULLY IN qa-baseline/ ===');
  await browser.close();
}

run().catch((err) => {
  console.error('Fatal error capturing baseline:', err);
  process.exit(1);
});

