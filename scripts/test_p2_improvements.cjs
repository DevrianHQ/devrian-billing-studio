const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1600 } });

  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Switch to Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);

  // Switch to One-Time Project
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(600);

  const pages = await page.locator('.a4-page-export').all();
  console.log(`Pages count: ${pages.length}`);

  // Screenshot of Page 2
  const p2Path = path.resolve(__dirname, '../qa-screenshots/diagnose/updated_project_p2.png');
  const box2 = await pages[1].boundingBox();
  if (box2) {
    await page.screenshot({ path: p2Path, clip: box2 });
    console.log(`Saved screenshot: ${p2Path}`);
  }

  // Print text from SlimHeader and PaymentDetails
  const headerText = await pages[1].locator('[data-section="quotation-slim-header"]').innerText();
  console.log('Slim Header text:', headerText.replace(/\n+/g, ' '));

  const paymentText = await pages[1].locator('[data-section="quotation-payment-details"]').innerText();
  console.log('Payment Box text:', paymentText.replace(/\n+/g, ' | '));

  await browser.close();
  console.log('Verification Complete!');
})();

