const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2400 } });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(1000);

  // Click Monthly Recurring
  await page.locator('button:has-text("Monthly Recurring")').first().click();
  await page.waitForTimeout(1000);

  const pages = await page.locator('.a4-page-export').all();
  console.log(`Found ${pages.length} pages after clicking Monthly Recurring`);

  for (let i = 0; i < pages.length; i++) {
    const pPath = path.resolve(__dirname, `../qa-screenshots/diagnose/monthly_recurring_p${i + 1}.png`);
    await pages[i].screenshot({ path: pPath });
    console.log(`Saved: ${pPath}`);
  }

  await browser.close();
})();

