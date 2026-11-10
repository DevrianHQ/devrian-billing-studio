const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v5');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2200 } });
  await page.goto('http://localhost:4173/#/create');
  await page.waitForLoadState('networkidle');

  // Click Quotation
  const quotBtn = await page.locator('button', { hasText: 'Quotation' }).first();
  await quotBtn.click();
  await page.waitForTimeout(600);

  // Switch to Monthly in Form
  console.log('Switching quotation model to Monthly Recurring...');
  const monthlyBtn = await page.locator('button', { hasText: 'Monthly Recurring' }).first();
  await monthlyBtn.click();
  await page.waitForTimeout(1000);

  // Take screenshot of all rendered pages
  const pages = await page.$$('.a4-page-export');
  console.log(`Rendered ${pages.length} page(s) for Monthly Quotation`);

  for (let i = 0; i < pages.length; i++) {
    const shotPath = path.join(OUT_DIR, `monthly_page_${i + 1}.png`);
    await pages[i].screenshot({ path: shotPath });
    console.log(`Saved ${shotPath}`);

    const text = await pages[i].evaluate((el) => el.innerText);
    console.log(`\n--- MONTHLY PAGE ${i + 1} TEXT ---`);
    console.log(text.slice(0, 600));
  }

  await browser.close();
})();
