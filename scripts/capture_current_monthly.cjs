const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2000 } });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Switch to Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(1000);

  // Click Monthly Retainer
  const monthlyBtn = page.locator('button:has-text("Monthly Retainer")').first();
  if (await monthlyBtn.isVisible()) {
    await monthlyBtn.click();
    await page.waitForTimeout(1000);
  }

  // Find all .a4-page-export
  const pages = await page.locator('.a4-page-export').all();
  console.log(`Found ${pages.length} pages`);

  for (let i = 0; i < pages.length; i++) {
    const pPath = path.resolve(__dirname, `../qa-screenshots/diagnose/current_monthly_p${i + 1}.png`);
    await pages[i].screenshot({ path: pPath });
    console.log(`Saved: ${pPath}`);
  }

  await browser.close();
})();

