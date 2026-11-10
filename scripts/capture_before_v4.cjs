const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../qa-baseline/before_v4');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1080 }, deviceScaleFactor: 2 });
  
  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Capture Invoice baseline
  const invBtn = page.locator('button:has-text("Invoice")').first();
  await invBtn.click();
  await page.waitForTimeout(600);
  const invPage = page.locator('.a4-page-export').first();
  if (await invPage.isVisible()) {
    await invPage.screenshot({ path: path.join(targetDir, 'invoice_baseline.png') });
    console.log('Saved invoice_baseline.png');
  }

  // 2. Capture Receipt baseline
  const recBtn = page.locator('button:has-text("Receipt")').first();
  await recBtn.click();
  await page.waitForTimeout(600);
  const recPage = page.locator('.a4-page-export').first();
  if (await recPage.isVisible()) {
    await recPage.screenshot({ path: path.join(targetDir, 'receipt_baseline.png') });
    console.log('Saved receipt_baseline.png');
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

