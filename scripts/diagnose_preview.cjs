const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 2600 } });
  await page.goto('http://localhost:4173/#create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Take screenshot of whatever is there initially
  await page.screenshot({ path: 'qa-screenshots/diagnose/init_create.png' });

  // Find document type selector or tabs
  const typeSelect = await page.$('select');
  if (typeSelect) {
    const val = await typeSelect.inputValue();
    console.log('Select val:', val);
  }

  // Look for Quotation
  const allText = await page.evaluate(() => document.body.innerText);
  console.log('Has Quotation:', allText.includes('Quotation'));

  // Click on "Quotation" if in doc type picker
  const quotationTab = await page.$('button:has-text("Quotation"), [data-type="quotation"]');
  if (quotationTab) {
    await quotationTab.click();
    await page.waitForTimeout(500);
  }

  // Click Monthly if available
  const monthlyTab = await page.$('button:has-text("Monthly Retainer")');
  if (monthlyTab) {
    await monthlyTab.click();
    await page.waitForTimeout(500);
  }

  await page.screenshot({ path: 'qa-screenshots/diagnose/after_monthly_click.png', fullPage: true });

  await browser.close();
  console.log('Done!');
})();

