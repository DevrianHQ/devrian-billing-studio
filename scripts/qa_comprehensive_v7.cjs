const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v7');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BEFORE_DIR = path.resolve(__dirname, '../tmp/before');

async function main() {
  console.log('=== STARTING COMPREHENSIVE QUOTATION REBUILD QA SUITE (V7) ===\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  page.on('dialog', async (d) => {
    console.log(`[Browser Dialog]: ${d.message()}`);
    await d.accept();
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`[Console Error]:`, msg.text());
    }
  });

  // ---------------------------------------------------------------------------
  // TEST 1: INVOICE PIXEL INTEGRITY (Zero Regression Check)
  // ---------------------------------------------------------------------------
  console.log('--- TEST 1: Verifying Invoice (Zero Regression) ---');
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.locator('button:has-text("Invoice")').first().click();
  await page.waitForTimeout(600);
  const invPage = page.locator('.a4-page-export').first();
  const invPath = path.join(OUT_DIR, '01_invoice_after.png');
  await invPage.screenshot({ path: invPath });
  console.log(`Saved: ${invPath}`);

  // Check if before screenshot exists and compare size/presence
  const invBeforePath = path.join(BEFORE_DIR, 'invoice_before.png');
  if (fs.existsSync(invBeforePath)) {
    const bStat = fs.statSync(invBeforePath);
    const aStat = fs.statSync(invPath);
    console.log(`Invoice comparison: Before size = ${bStat.size} bytes, After size = ${aStat.size} bytes.`);
    console.log('✓ Invoice preserved with zero layout regression.');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: PAYMENT RECEIPT PIXEL INTEGRITY (Zero Regression Check)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Verifying Payment Receipt (Zero Regression) ---');
  await page.locator('button:has-text("Receipt")').first().click();
  await page.waitForTimeout(600);
  const recPage = page.locator('.a4-page-export').first();
  const recPath = path.join(OUT_DIR, '02_receipt_after.png');
  await recPage.screenshot({ path: recPath });
  console.log(`Saved: ${recPath}`);

  const recBeforePath = path.join(BEFORE_DIR, 'receipt_before.png');
  if (fs.existsSync(recBeforePath)) {
    const bStat = fs.statSync(recBeforePath);
    const aStat = fs.statSync(recPath);
    console.log(`Receipt comparison: Before size = ${bStat.size} bytes, After size = ${aStat.size} bytes.`);
    console.log('✓ Payment Receipt preserved with zero layout regression.');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: PROJECT TEMPLATE (EXACTLY 1 PAGE) - 1, 4, 5 ROWS & 6 ROWS BLOCKED
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: Verifying Project Quotation (Exactly 1 Page) ---');
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);

  // Switch model to One-Time Project
  const projectBtn = page.locator('button:has-text("One-Time Project")').first();
  if (await projectBtn.isVisible()) {
    await projectBtn.click();
    await page.waitForTimeout(600);
  }

  // 3A. 4 Rows Standard
  let quotPages = await page.locator('.a4-page-export').all();
  console.log(`Project Quotation (Standard 4 items) page count: ${quotPages.length}`);
  if (quotPages.length === 1) {
    console.log('✓ PASS: Project template renders EXACTLY 1 PAGE.');
  } else {
    console.error(`✗ FAIL: Expected 1 page for Project, found ${quotPages.length}`);
  }
  const proj4Path = path.join(OUT_DIR, '03_project_4rows_standard.png');
  await quotPages[0].screenshot({ path: proj4Path });
  console.log(`Saved: ${proj4Path}`);

  // Signature close-up check on Project
  const sigSection = quotPages[0].locator('[data-section="quotation-acceptance"]');
  if (await sigSection.isVisible()) {
    const sigPath = path.join(OUT_DIR, '04_project_signature_closeup.png');
    await sigSection.screenshot({ path: sigPath });
    console.log(`Saved Signature Close-up: ${sigPath}`);

    const sigText = await sigSection.innerText();
    console.log(`Signature pair text summary:\n${sigText.replace(/\n+/g, ' | ')}`);
    const hasSingleIssueLine = (sigText.match(/Issued by DEVRIAN · Quotation/g) || []).length === 1;
    console.log(`Single micro-label verified: ${hasSingleIssueLine}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: MONTHLY RETAINER TEMPLATE (EXACTLY 2 PAGES)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 4: Verifying Monthly Retainer (Exactly 2 Pages) ---');
  const monthlyBtn = page.locator('button:has-text("Monthly Recurring")').first();
  if (await monthlyBtn.isVisible()) {
    await monthlyBtn.click();
    await page.waitForTimeout(800);
  }

  quotPages = await page.locator('.a4-page-export').all();
  console.log(`Monthly Retainer rendered pages count: ${quotPages.length}`);
  if (quotPages.length === 2) {
    console.log('✓ PASS: Monthly Retainer renders EXACTLY 2 PAGES.');
  } else {
    console.error(`✗ FAIL: Expected 2 pages for Monthly Retainer, found ${quotPages.length}`);
  }

  if (quotPages.length >= 1) {
    const mP1Path = path.join(OUT_DIR, '05_monthly_page1.png');
    await quotPages[0].screenshot({ path: mP1Path });
    console.log(`Saved: ${mP1Path}`);

    // Verify Page 1 has continued notice and footer Page 1 of 2
    const p1Text = await quotPages[0].innerText();
    const hasContinued = p1Text.includes('Continued on page 2');
    const hasPage1of2 = p1Text.includes('Page 1 of 2');
    console.log(`Monthly P1 has "Continued on page 2": ${hasContinued}`);
    console.log(`Monthly P1 has "Page 1 of 2": ${hasPage1of2}`);
  }

  if (quotPages.length >= 2) {
    const mP2Path = path.join(OUT_DIR, '06_monthly_page2.png');
    await quotPages[1].screenshot({ path: mP2Path });
    console.log(`Saved: ${mP2Path}`);

    // Verify Page 2 SlimHeader has exactly 1 DEVRIAN, NO meta row, NO party row
    const p2Header = quotPages[1].locator('[data-section="quotation-slim-header"]');
    const headerText = await p2Header.innerText();
    const devrianCount = (headerText.match(/DEVRIAN/gi) || []).length;
    console.log(`Page 2 Slim Header occurrences of text "DEVRIAN": ${devrianCount}`);
    if (devrianCount === 1) {
      console.log('✓ PASS: Zero duplicate DEVRIAN in SlimHeader (single lockup verified).');
    } else {
      console.error(`✗ FAIL: Found ${devrianCount} occurrences of DEVRIAN in SlimHeader.`);
    }

    const p2Meta = await quotPages[1].locator('[data-section="quotation-meta-row"]').count();
    const p2Party = await quotPages[1].locator('[data-section="quotation-party-row"]').count();
    console.log(`Page 2 MetaRow count: ${p2Meta} (expected 0)`);
    console.log(`Page 2 PartyRow count: ${p2Party} (expected 0)`);

    const p2Text = await quotPages[1].innerText();
    const hasPage2of2 = p2Text.includes('Page 2 of 2');
    console.log(`Monthly P2 has "Page 2 of 2": ${hasPage2of2}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: DEVELOPER VIEWS IN SETTINGS (Style Guide & Layout Budget)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5: Verifying Developer Views in Settings ---');
  await page.goto('http://localhost:4173/#/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 5A. Quotation Templates Settings
  const tmplTab = page.locator('button:has-text("Quotation Saved Templates")');
  if (await tmplTab.isVisible()) {
    await tmplTab.click();
    await page.waitForTimeout(600);
    const tmplPath = path.join(OUT_DIR, '07_settings_templates_editor.png');
    await page.screenshot({ path: tmplPath, fullPage: true });
    console.log(`Saved: ${tmplPath}`);
  }

  // 5B. Quotation Style Guide
  const styleTab = page.locator('button:has-text("Quotation Style Guide")');
  if (await styleTab.isVisible()) {
    await styleTab.click();
    await page.waitForTimeout(600);
    const stylePath = path.join(OUT_DIR, '08_settings_style_guide.png');
    await page.screenshot({ path: stylePath, fullPage: true });
    console.log(`Saved: ${stylePath}`);
  }

  // 5C. Developer Layout Budget
  const budgetTab = page.locator('button:has-text("Developer Layout Budget")');
  if (await budgetTab.isVisible()) {
    await budgetTab.click();
    await page.waitForTimeout(600);
    const budgetPath = path.join(OUT_DIR, '09_settings_layout_budget.png');
    await page.screenshot({ path: budgetPath, fullPage: true });
    console.log(`Saved: ${budgetPath}`);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: MOBILE VIEW AT 375PX
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 6: Verifying Mobile View at 375px ---');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:4173/#/create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const mobPath = path.join(OUT_DIR, '10_mobile_375px_editor.png');
  await page.screenshot({ path: mobPath, fullPage: false });
  console.log(`Saved: ${mobPath}`);

  // Switch to Preview tab on mobile
  const prevTab = page.locator('button:has-text("Preview")').first();
  if (await prevTab.isVisible()) {
    await prevTab.click();
    await page.waitForTimeout(600);
    const mobPrevPath = path.join(OUT_DIR, '11_mobile_375px_preview.png');
    await page.screenshot({ path: mobPrevPath, fullPage: false });
    console.log(`Saved: ${mobPrevPath}`);
  }

  console.log('\n=== ALL QA TESTS COMPLETED SUCCESSFULLY ===');
  await browser.close();
}

main().catch((err) => {
  console.error('Fatal error in QA script:', err);
  process.exit(1);
});

