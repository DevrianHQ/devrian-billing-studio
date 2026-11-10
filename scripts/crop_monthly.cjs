const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2400 } });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);
  await page.locator('button:has-text("Monthly Recurring")').first().click();
  await page.waitForTimeout(600);

  // Take high-res screenshots of Page 1 and Page 2
  const pages = await page.locator('.a4-page-export').all();
  await pages[0].screenshot({ path: 'qa-screenshots/diagnose/monthly_p1_preview.png' });
  await pages[1].screenshot({ path: 'qa-screenshots/diagnose/monthly_p2_preview.png' });
  console.log('Saved preview screenshots');

  await browser.close();
})();

