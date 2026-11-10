const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  await page.goto('http://localhost:4173/#create');
  await page.waitForTimeout(1000);
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(800);

  const a4 = page.locator('.a4-page-export').first();
  const pageBox = await a4.boundingBox();
  console.log('A4 bounding box:', pageBox);

  const sections = await a4.locator('[data-section]').all();
  for (const s of sections) {
    const secName = await s.getAttribute('data-section');
    const box = await s.boundingBox();
    console.log(secName, '=> relative top:', (box.y - pageBox.y).toFixed(1), 'px, height:', box.height.toFixed(1), 'px, width:', box.width.toFixed(1), 'px');
  }

  // Let's also check if any element overflows the A4 page height (1122.5px at 96dpi or 297mm)
  const a4Height = pageBox.height;
  console.log('A4 Total Height:', a4Height);

  await browser.close();
})();

