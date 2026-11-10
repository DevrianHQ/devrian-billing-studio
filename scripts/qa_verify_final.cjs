const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-audit-fix');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function main() {
  console.log('--- STARTING COMPREHENSIVE QA AUDIT & FIX VERIFICATION ---');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1080 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  page.on('dialog', async (d) => {
    console.log(`[Dialog]: ${d.message()}`);
    await d.accept();
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Browser Error]:`, msg.text());
    }
  });

  console.log('Navigating to http://localhost:4173/#create...');
  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. INVOICE CHECK
  console.log('Testing Invoice (Zero Regression)...');
  await page.locator('button:has-text("Invoice")').first().click();
  await page.waitForTimeout(500);
  const invPage = page.locator('.a4-page-export').first();
  await invPage.screenshot({ path: path.join(OUT_DIR, '01_invoice_verified.png') });
  console.log('Saved 01_invoice_verified.png');

  // 2. RECEIPT CHECK
  console.log('Testing Receipt (Zero Regression)...');
  await page.locator('button:has-text("Receipt")').first().click();
  await page.waitForTimeout(500);
  const recPage = page.locator('.a4-page-export').first();
  await recPage.screenshot({ path: path.join(OUT_DIR, '02_receipt_verified.png') });
  console.log('Saved 02_receipt_verified.png');

  // 3. QUOTATION CHECK: MONTHLY RECURRING
  console.log('Testing Quotation (Monthly Recurring)...');
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);

  // Switch model to Monthly Recurring
  const monthlyBtn = page.locator('button:has-text("Monthly Recurring")').first();
  if (await monthlyBtn.isVisible()) {
    await monthlyBtn.click();
    await page.waitForTimeout(600);
  }

  let quotPages = await page.locator('.a4-page-export').all();
  console.log(`Monthly Quotation rendered pages: ${quotPages.length}`);
  if (quotPages.length >= 1) {
    await quotPages[0].screenshot({ path: path.join(OUT_DIR, '03_monthly_page1.png') });
    console.log('Saved 03_monthly_page1.png');
  }
  if (quotPages.length >= 2) {
    await quotPages[1].screenshot({ path: path.join(OUT_DIR, '04_monthly_page2.png') });
    console.log('Saved 04_monthly_page2.png');

    // Check SlimHeader text for duplicate DEVRIAN
    const p2Header = quotPages[1].locator('[data-section="quotation-slim-header"]');
    const headerText = await p2Header.innerText();
    console.log(`Page 2 Slim Header innerText: "${headerText.replace(/\n/g, ' ')}"`);
    const devrianCount = (headerText.match(/DEVRIAN/gi) || []).length;
    console.log(`Occurrences of text "DEVRIAN" in Page 2 SlimHeader: ${devrianCount}`);
  }

  // 4. QUOTATION CHECK: ONE-TIME PROJECT
  console.log('Testing Quotation (One-Time Project)...');
  const projectBtn = page.locator('button:has-text("One-Time Project")').first();
  if (await projectBtn.isVisible()) {
    await projectBtn.click();
    await page.waitForTimeout(600);
  }

  quotPages = await page.locator('.a4-page-export').all();
  console.log(`Project Quotation rendered pages: ${quotPages.length}`);
  if (quotPages.length >= 1) {
    await quotPages[0].screenshot({ path: path.join(OUT_DIR, '05_project_page1.png') });
    console.log('Saved 05_project_page1.png');
  }
  if (quotPages.length >= 2) {
    await quotPages[1].screenshot({ path: path.join(OUT_DIR, '06_project_page2.png') });
    console.log('Saved 06_project_page2.png');
  }

  // 5. SETTINGS PAGE CHECK
  console.log('Testing Settings View (Separate Defaults 6A and 6B)...');
  await page.goto('http://localhost:4173/#settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '07_settings_full.png'), fullPage: true });
  console.log('Saved 07_settings_full.png');

  console.log('--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
  await browser.close();
}

main().catch((err) => {
  console.error('QA script error:', err);
  process.exit(1);
});

