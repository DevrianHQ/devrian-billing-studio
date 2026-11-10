const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/diagnose');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4173/#/create...');
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Click Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(800);

  // 1. PROJECT QUOTATION SCREENSHOT
  console.log('Capturing Project Quotation...');
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(800);
  const projPage = page.locator('.a4-page-export').first();
  await projPage.screenshot({ path: path.join(OUT_DIR, 'final_project_preview.png') });
  console.log('Saved final_project_preview.png');

  // 2. MONTHLY RETAINER SCREENSHOTS (PAGE 1 & PAGE 2)
  console.log('Capturing Monthly Retainer...');
  await page.locator('button:has-text("Monthly Recurring")').first().click();
  await page.waitForTimeout(800);

  const monthlyPages = await page.locator('.a4-page-export').all();
  console.log(`Monthly Retainer pages count: ${monthlyPages.length}`);

  if (monthlyPages.length >= 1) {
    await monthlyPages[0].screenshot({ path: path.join(OUT_DIR, 'final_monthly_p1.png') });
    console.log('Saved final_monthly_p1.png');
  }

  if (monthlyPages.length >= 2) {
    await monthlyPages[1].screenshot({ path: path.join(OUT_DIR, 'final_monthly_p2.png') });
    console.log('Saved final_monthly_p2.png');
  }

  await browser.close();
  console.log('All captures complete!');
})();

