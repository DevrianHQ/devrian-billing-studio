const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../tmp/before');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  console.log('Rendering current invoice and receipt to /tmp/before...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1080 },
    deviceScaleFactor: 2,
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('dialog', async (d) => {
    console.log('[Dialog]:', d.message());
    await d.accept();
  });

  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Invoice
  const invBtn = page.locator('button:has-text("Invoice")').first();
  await invBtn.click();
  await page.waitForTimeout(600);
  const invElem = page.locator('.a4-page-export').first();
  await invElem.screenshot({ path: path.join(OUT_DIR, 'invoice_before.png') });
  console.log('Saved invoice_before.png');

  // Trigger invoice PDF download
  const [invDownload] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
    page.locator('button:has-text("Download PDF")').first().click().catch(() => null),
  ]);
  if (invDownload) {
    const invPdfPath = path.join(OUT_DIR, 'invoice_before.pdf');
    await invDownload.saveAs(invPdfPath);
    console.log('Saved invoice_before.pdf');
  }

  // 2. Receipt
  const recBtn = page.locator('button:has-text("Receipt")').first();
  await recBtn.click();
  await page.waitForTimeout(600);
  const recElem = page.locator('.a4-page-export').first();
  await recElem.screenshot({ path: path.join(OUT_DIR, 'receipt_before.png') });
  console.log('Saved receipt_before.png');

  // Trigger receipt PDF download
  const [recDownload] = await Promise.all([
    page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
    page.locator('button:has-text("Download PDF")').first().click().catch(() => null),
  ]);
  if (recDownload) {
    const recPdfPath = path.join(OUT_DIR, 'receipt_before.pdf');
    await recDownload.saveAs(recPdfPath);
    console.log('Saved receipt_before.pdf');
  }

  await browser.close();
  console.log('Baseline capture complete in /tmp/before');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

