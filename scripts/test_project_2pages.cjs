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
  await page.waitForTimeout(2000);

  // Switch to Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(1000);

  // Click One-Time Project
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(1000);

  const pages = await page.locator('.a4-page-export').all();
  console.log(`Project Quotation rendered pages count: ${pages.length}`);

  for (let i = 0; i < pages.length; i++) {
    const pPath = path.join(OUT_DIR, `project_2page_p${i + 1}.png`);
    await pages[i].screenshot({ path: pPath });
    console.log(`Saved: ${pPath}`);
  }

  // Also verify text on Page 1 & Page 2
  const p1Text = await pages[0].innerText();
  console.log('--- Page 1 Text Summary ---');
  console.log(p1Text.replace(/\n+/g, ' | ').slice(0, 300));

  const p2Text = await pages[1].innerText();
  console.log('--- Page 2 Text Summary ---');
  console.log(p2Text.replace(/\n+/g, ' | ').slice(0, 300));

  await browser.close();
  console.log('Complete!');
})();

