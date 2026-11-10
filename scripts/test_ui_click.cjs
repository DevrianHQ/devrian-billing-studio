const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });
  await page.goto('http://localhost:4173/#/create');
  await page.waitForLoadState('networkidle');

  // Click Quotation tab button
  const quotBtn = await page.locator('button', { hasText: 'Quotation' }).first();
  if (quotBtn) {
    console.log('Clicking Quotation button...');
    await quotBtn.click();
    await page.waitForTimeout(1000);
  }

  const pages = await page.$$('.a4-page-export');
  console.log('Found a4-page-export elements:', pages.length);

  const outDir = path.resolve(__dirname, '../qa-screenshots/quotation-v5');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < pages.length; i++) {
    const pPath = path.join(outDir, `live_quotation_page_${i + 1}.png`);
    await pages[i].screenshot({ path: pPath });
    console.log(`Saved ${pPath}`);
  }

  // Also check text
  if (pages.length > 0) {
    const text = await page.evaluate(() => {
      const el = document.querySelector('.a4-page-export');
      return el ? el.innerText : '';
    });
    console.log('Page 1 Text Summary:\n', text.slice(0, 500));
  }

  await browser.close();
})();
