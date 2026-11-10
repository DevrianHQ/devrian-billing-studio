const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1080 } });
  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const quotBtn = page.locator('button:has-text("Quotation")').first();
  await quotBtn.click();
  await page.waitForTimeout(400);
  const layoutBtn = page.locator('button:has-text("Layout:"), button:has-text("Page Layout")').first();
  if (await layoutBtn.isVisible()) {
    await layoutBtn.scrollIntoViewIfNeeded();
    await layoutBtn.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(__dirname, '../qa-screenshots/quotation-v4/page_layout_panel.png') });
  await browser.close();
  console.log('Saved page_layout_panel.png');
})();

