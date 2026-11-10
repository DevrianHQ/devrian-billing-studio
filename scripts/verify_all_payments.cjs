const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2000 } });

  const outDir = path.resolve(__dirname, '../qa-screenshots/diagnose');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Check Quotation Payment Box
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(600);

  const quotationPages = await page.locator('.a4-page-export').all();
  if (quotationPages.length >= 2) {
    const qPayEl = quotationPages[1].locator('[data-section="quotation-payment-details"]');
    const qBox = await qPayEl.boundingBox();
    if (qBox) {
      await page.screenshot({
        path: path.join(outDir, 'quotation_payment_seamless.png'),
        clip: {
          x: qBox.x - 10,
          y: qBox.y - 10,
          width: qBox.width + 20,
          height: qBox.height + 20,
        },
      });
      console.log('Saved: quotation_payment_seamless.png');
    }
  }

  // 2. Check Invoice Payment Box
  await page.locator('button:has-text("Tax Invoice"), button:has-text("Invoice")').first().click();
  await page.waitForTimeout(800);

  const invoicePage = page.locator('.a4-page-export').first();
  const invBox = await invoicePage.boundingBox();
  if (invBox) {
    await page.screenshot({
      path: path.join(outDir, 'invoice_full.png'),
      clip: invBox,
    });
    console.log('Saved: invoice_full.png');
  }

  // 3. Check Receipt Payment Box
  await page.locator('button:has-text("Payment Receipt"), button:has-text("Receipt")').first().click();
  await page.waitForTimeout(800);

  const receiptPage = page.locator('.a4-page-export').first();
  const recBox = await receiptPage.boundingBox();
  if (recBox) {
    await page.screenshot({
      path: path.join(outDir, 'receipt_full.png'),
      clip: recBox,
    });
    console.log('Saved: receipt_full.png');
  }

  await browser.close();
  console.log('All payment box captures complete!');
})();

