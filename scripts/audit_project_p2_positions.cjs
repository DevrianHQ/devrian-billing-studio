const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(600);

  const p2Positions = await page.evaluate(() => {
    const pages = document.querySelectorAll('.a4-page-export');
    const p2 = pages[1];
    const pRect = p2.getBoundingClientRect();
    const sections = Array.from(p2.querySelectorAll('[data-section]'));
    return sections.map(s => {
      const r = s.getBoundingClientRect();
      return {
        section: s.getAttribute('data-section'),
        top: (r.top - pRect.top).toFixed(1),
        bottom: (r.bottom - pRect.top).toFixed(1),
        height: r.height.toFixed(1),
      };
    });
  });

  console.log('=== PROJECT PAGE 2 SECTIONS AUDIT ===');
  console.table(p2Positions);

  await browser.close();
})();

