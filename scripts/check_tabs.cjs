const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(1000);

  // Check what buttons exist for templates
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.replace(/\n/g, ' '),
      className: b.className
    })).filter(b => b.text.includes('Project') || b.text.includes('Monthly') || b.text.includes('Retainer'));
  });
  console.log('Template buttons:', btns);

  // Check document state in the preview
  const previewText = await page.evaluate(() => {
    const preview = document.querySelector('.a4-page-export');
    return preview ? preview.innerText.slice(0, 500) : 'No preview';
  });
  console.log('Preview text snippet:', previewText);

  await browser.close();
})();

