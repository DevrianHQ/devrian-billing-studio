const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASELINE_DIR = path.resolve(__dirname, '../qa-baseline');
if (!fs.existsSync(BASELINE_DIR)) fs.mkdirSync(BASELINE_DIR, { recursive: true });

async function run() {
  console.log('=== CAPTURING CURRENT QUOTATION BASELINES (1, 3, 8 ITEMS) ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Switch to Quotation
  const qBtn = page.locator('button:has-text("Quotation")').first();
  await qBtn.click();
  await page.waitForTimeout(800);

  // Function to capture current pages
  async function capturePages(name) {
    const a4Pages = await page.locator('.a4-page-export').all();
    console.log(`[${name}] Found ${a4Pages.length} pages`);
    for (let i = 0; i < a4Pages.length; i++) {
      const outPath = path.join(BASELINE_DIR, `${name}_p${i + 1}.png`);
      await a4Pages[i].screenshot({ path: outPath });
      console.log(`  Saved: ${outPath}`);
    }
  }

  // 1 item baseline
  await capturePages('quotation_current_1item');

  // Add 2 more items (total 3)
  const addItemBtn = page.locator('button:has-text("Add Item")').first();
  if (await addItemBtn.isVisible()) {
    await addItemBtn.click();
    await page.waitForTimeout(300);
    await addItemBtn.click();
    await page.waitForTimeout(500);
  }
  await capturePages('quotation_current_3items');

  // Add 5 more items (total 8)
  for (let i = 0; i < 5; i++) {
    if (await addItemBtn.isVisible()) {
      await addItemBtn.click();
      await page.waitForTimeout(200);
    }
  }
  await page.waitForTimeout(800);
  await capturePages('quotation_current_8items');

  await browser.close();
  console.log('=== QUOTATION BASELINES CAPTURED ===');
}

run().catch(console.error);

