const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });

  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Click Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);

  // Click One-Time Project
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(600);

  // Capture Page 1
  const pages = await page.locator('.a4-page-export').all();
  console.log(`Pages count: ${pages.length}`);

  const p1Path = path.resolve(__dirname, '../qa-screenshots/diagnose/updated_project_cover_p1.png');
  // Use clip or fast screenshot
  const box = await pages[0].boundingBox();
  if (box) {
    await page.screenshot({
      path: p1Path,
      clip: box,
    });
    console.log(`Saved screenshot: ${p1Path}`);
  }

  // Print text of the 2x2 grid to verify
  const gridText = await pages[0].locator('.grid.grid-cols-2').allInnerTexts();
  console.log('Grid Texts:', gridText);

  await browser.close();
  console.log('Done!');
})();
