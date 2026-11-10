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

  const p1Sections = await page.locator('.a4-page-export').nth(0).evaluate((el) => {
    return Array.from(el.querySelectorAll('[data-section]')).map(s => ({
      section: s.getAttribute('data-section'),
      textSnippet: s.innerText.slice(0, 100).replace(/\n/g, ' ')
    }));
  });

  const p2Sections = await page.locator('.a4-page-export').nth(1).evaluate((el) => {
    return Array.from(el.querySelectorAll('[data-section]')).map(s => ({
      section: s.getAttribute('data-section'),
      textSnippet: s.innerText.slice(0, 100).replace(/\n/g, ' ')
    }));
  });

  console.log('Page 1 Sections:', JSON.stringify(p1Sections, null, 2));
  console.log('Page 2 Sections:', JSON.stringify(p2Sections, null, 2));

  await browser.close();
})();

