const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(800);

  // Check Project
  console.log('=== PROJECT POSITION AUDIT ===');
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(800);
  const projPositions = await page.evaluate(() => {
    const p = document.querySelector('.a4-page-export');
    const pRect = p.getBoundingClientRect();
    const sections = Array.from(p.querySelectorAll('[data-section]'));
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
  console.table(projPositions);

  // Check Monthly
  console.log('\n=== MONTHLY POSITION AUDIT ===');
  await page.locator('button:has-text("Monthly Recurring")').first().click();
  await page.waitForTimeout(800);

  const monthlyPositions = await page.evaluate(() => {
    const pages = Array.from(document.querySelectorAll('.a4-page-export'));
    return pages.map((p, idx) => {
      const pRect = p.getBoundingClientRect();
      const sections = Array.from(p.querySelectorAll('[data-section]'));
      return {
        page: idx + 1,
        sections: sections.map(s => {
          const r = s.getBoundingClientRect();
          return {
            section: s.getAttribute('data-section'),
            top: (r.top - pRect.top).toFixed(1),
            bottom: (r.bottom - pRect.top).toFixed(1),
            height: r.height.toFixed(1),
          };
        })
      };
    });
  });

  console.log('Page 1:');
  console.table(monthlyPositions[0].sections);
  console.log('Page 2:');
  console.table(monthlyPositions[1].sections);

  await browser.close();
})();

