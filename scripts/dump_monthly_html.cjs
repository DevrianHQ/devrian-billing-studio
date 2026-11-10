const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2400 } });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);
  await page.locator('button:has-text("Monthly Recurring")').first().click();
  await page.waitForTimeout(600);

  const htmlP1 = await page.locator('.a4-page-export').nth(0).innerHTML();
  const htmlP2 = await page.locator('.a4-page-export').nth(1).innerHTML();

  const fs = require('fs');
  fs.writeFileSync('qa-screenshots/diagnose/monthly_p1.html', htmlP1);
  fs.writeFileSync('qa-screenshots/diagnose/monthly_p2.html', htmlP2);
  console.log('HTML saved for both pages');

  await browser.close();
})();

