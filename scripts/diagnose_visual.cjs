const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/diagnose');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  console.log('--- DIAGNOSING CURRENT VISUAL STATE IN BROWSER ---');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') {
      console.error(`[Console Error]:`, msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error(`[Page Error]:`, err);
  });

  console.log('Navigating to http://localhost:4173/#create...');
  await page.goto('http://localhost:4173/#create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Screenshot current view right away (as user sees it)
  await page.screenshot({ path: path.join(OUT_DIR, '00_initial_load.png'), fullPage: false });
  console.log('Saved 00_initial_load.png');

  // Let's inspect active document type
  const docTypeHeader = await page.locator('header, h1, .text-xl, button.bg-white, button.text-black').allInnerTexts();
  console.log('Visible buttons / headers:', docTypeHeader.slice(0, 15).join(' | '));

  // Check Invoice
  console.log('Checking Invoice...');
  await page.locator('button:has-text("Invoice")').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, '01_invoice_view.png'), fullPage: false });

  // Check Receipt
  console.log('Checking Receipt...');
  await page.locator('button:has-text("Receipt")').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, '02_receipt_view.png'), fullPage: false });

  // Check Quotation - One-Time Project
  console.log('Checking Quotation (Project)...');
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(800);

  const projBtn = page.locator('button:has-text("One-Time Project")').first();
  if (await projBtn.isVisible()) {
    await projBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(OUT_DIR, '03_quotation_project.png'), fullPage: false });

  // Zoom in on Quotation Preview
  const previewA4 = page.locator('.a4-page-export').first();
  if (await previewA4.isVisible()) {
    await previewA4.screenshot({ path: path.join(OUT_DIR, '04_quotation_project_page_closeup.png') });
  }

  // Check Quotation - Monthly
  console.log('Checking Quotation (Monthly)...');
  const monthBtn = page.locator('button:has-text("Monthly Recurring")').first();
  if (await monthBtn.isVisible()) {
    await monthBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(OUT_DIR, '05_quotation_monthly.png'), fullPage: false });

  const monthlyA4s = await page.locator('.a4-page-export').all();
  console.log(`Monthly Quotation A4 count: ${monthlyA4s.length}`);
  if (monthlyA4s.length >= 1) {
    await monthlyA4s[0].screenshot({ path: path.join(OUT_DIR, '06_quotation_monthly_p1.png') });
  }
  if (monthlyA4s.length >= 2) {
    await monthlyA4s[1].screenshot({ path: path.join(OUT_DIR, '07_quotation_monthly_p2.png') });
  }

  // Check Settings View
  console.log('Checking Settings...');
  await page.goto('http://localhost:4173/#settings', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '08_settings_view.png'), fullPage: false });

  console.log('Console logs count:', consoleLogs.length);
  const errors = consoleLogs.filter(l => l.type === 'error');
  if (errors.length > 0) {
    console.log('Errors:', errors);
  } else {
    console.log('No console errors detected.');
  }

  await browser.close();
  console.log('--- DIAGNOSTIC FINISHED ---');
}

main().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});

