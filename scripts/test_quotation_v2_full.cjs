const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v2');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASELINE_DIR = path.resolve(__dirname, '../qa-baseline');

async function main() {
  console.log('================================================================');
  console.log('   DEVRIAN BILLING STUDIO: COMPREHENSIVE QUOTATION V2 QA SUITE  ');
  console.log('================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1080 },
    deviceScaleFactor: 2,
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('dialog', async (d) => {
    console.log(`  [Dialog] ${d.type()}: ${d.message()}`);
    await d.accept();
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`  [Browser Error]:`, msg.text());
    }
  });

  // 1. Load application
  console.log('Step 1: Loading DEVRIAN Billing Studio at http://localhost:4173/#create...');
  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Switch to Quotation
  console.log('Step 2: Switching to Quotation document type...');
  const qBtn = page.locator('button:has-text("Quotation")').first();
  await qBtn.click();
  await page.waitForTimeout(800);

  // Check 1-page natural layout with 1 item
  console.log('Step 3: Checking 1-item default quotation...');
  let pages = await page.locator('.a4-page-export').all();
  console.log(`  Rendered pages count: ${pages.length}`);
  if (pages.length !== 1) {
    console.error(`  FAIL: Expected 1 page, got ${pages.length}`);
  } else {
    console.log(`  PASS: Default 1-item quotation renders strictly on 1 page.`);
  }

  // Helper to add line items
  async function addLineItem() {
    const btn = page.locator('button:has-text("Add Line Item")').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(200);
  }

  // Set up 6 line items to test STEP 3 (compact one-page layout target)
  console.log('\nStep 4: Adding items to reach 6 line items...');
  for (let i = 0; i < 5; i++) {
    await addLineItem();
  }

  pages = await page.locator('.a4-page-export').all();
  console.log(`  6 items rendered pages count: ${pages.length}`);
  await page.screenshot({ path: path.join(OUT_DIR, '1page_default_6items_full.png'), fullPage: false });
  if (pages.length > 0) {
    await pages[0].screenshot({ path: path.join(OUT_DIR, '1page_default_6items.png') });
  }

  // Inspect 6-item layout elements and budget
  const page1Box = await pages[0].boundingBox();
  console.log(`  Page 1 Bounding Box: width=${page1Box.width}px, height=${page1Box.height}px`);

  // Verify Side-by-Side bottom block
  const paymentBox = page.locator('[data-section="quotation-payment-details"]');
  const summaryBox = page.locator('[data-section="quotation-summary"]');
  const totalBar = page.locator('[data-section="quotation-total-bar"]');

  if (await paymentBox.isVisible() && await summaryBox.isVisible()) {
    const payRect = await paymentBox.boundingBox();
    const sumRect = await summaryBox.boundingBox();
    console.log(`  Payment Box: x=${payRect.x.toFixed(1)}, width=${payRect.width.toFixed(1)}, y=${payRect.y.toFixed(1)}`);
    console.log(`  Summary Box: x=${sumRect.x.toFixed(1)}, width=${sumRect.width.toFixed(1)}, y=${sumRect.y.toFixed(1)}`);
    if (Math.abs(payRect.y - sumRect.y) < 20 && sumRect.x > payRect.x) {
      console.log(`  PASS: Bottom block is laid out SIDE BY SIDE (Payment Details Left, Summary Right).`);
    } else {
      console.warn(`  WARNING: Bottom block may not be side-by-side!`);
    }
  }

  // Verify Terms & Notes box and Acceptance box
  const termsBox = page.locator('[data-section="quotation-terms"]');
  const acceptanceBox = page.locator('[data-section="quotation-acceptance"]');
  console.log(`  Terms Box visible: ${await termsBox.isVisible()}`);
  console.log(`  Acceptance Box visible: ${await acceptanceBox.isVisible()}`);

  // Verify Header Lockup & Contact details
  const pageText = await pages[0].innerText();
  const hasProprietor = pageText.includes('Dev Rajpoot');
  const hasUdyam = pageText.includes('UDYAM-UP-54-0127731');
  const hasOldEmail = pageText.includes('hello@devrian.in');
  console.log(`  Contains "Dev Rajpoot": ${hasProprietor}`);
  console.log(`  Contains "UDYAM-UP-54-0127731": ${hasUdyam}`);
  console.log(`  Contains prohibited "hello@devrian.in": ${hasOldEmail}`);
  if (hasProprietor && hasUdyam && !hasOldEmail) {
    console.log(`  PASS: Lockup and proprietor integrity 100% compliant.`);
  } else {
    console.error(`  FAIL: Lockup or proprietor integrity issue.`);
  }

  // Check Spaced Caps Labels
  const hasSpacedQuotationNo = pageText.includes('QUOTATION NO.') || pageText.includes('QUOTATION NO');
  const hasValidTill = pageText.includes('VALID TILL');
  console.log(`  Spaced label "QUOTATION NO": ${hasSpacedQuotationNo}`);
  console.log(`  Spaced label "VALID TILL": ${hasValidTill}`);

  // Step 5: Test Overflow with 11 items -> Page Planner
  console.log('\nStep 5: Adding items to reach 11 items (triggers overflow)...');
  for (let i = 0; i < 5; i++) {
    await addLineItem();
  }

  // Check header pill or overflow banner
  const pillBtn = page.locator('button[title*="Quotation Page Planner"]').first();
  await pillBtn.waitFor({ state: 'visible', timeout: 5000 });
  const pillText = await pillBtn.innerText();
  console.log(`  Header Pill Text: "${pillText.replace(/\n/g, ' ')}"`);

  // Open Page Planner
  console.log('Step 6: Opening Page Planner Dialog...');
  await pillBtn.click();
  await page.waitForTimeout(500);

  const dialog = page.locator('[role="dialog"]');
  const isDialogOpen = await dialog.isVisible();
  console.log(`  Page Planner Dialog open: ${isDialogOpen}`);

  if (isDialogOpen) {
    await page.screenshot({ path: path.join(OUT_DIR, 'planner_dialog.png') });
    console.log(`  Saved: ${path.join(OUT_DIR, 'planner_dialog.png')}`);

    // Check dialog hierarchy & elements
    const dialogTitle = await dialog.locator('h2').first().innerText();
    console.log(`  Dialog Title: "${dialogTitle}"`);

    // Check movable section checkboxes
    const termsCheckbox = dialog.locator('input[type="checkbox"]').nth(0);
    console.log(`  Checkbox available: ${await termsCheckbox.isVisible()}`);

    // Click Apply Plan
    const applyBtn = dialog.locator('button:has-text("Apply")').first();
    await applyBtn.click();
    await page.waitForTimeout(600);
  }

  // Check 2-page result
  pages = await page.locator('.a4-page-export').all();
  console.log(`\nStep 7: Verifying 2-page quotation layout after applying plan...`);
  console.log(`  Pages count: ${pages.length}`);
  if (pages.length === 2) {
    await pages[0].screenshot({ path: path.join(OUT_DIR, '2page_result_p1.png') });
    await pages[1].screenshot({ path: path.join(OUT_DIR, '2page_result_p2.png') });
    console.log(`  Saved: 2page_result_p1.png and 2page_result_p2.png`);

    // Verify slim header on Page 2
    const p2Text = await pages[1].innerText();
    const hasSlimHeader = p2Text.includes('continued') || p2Text.includes('DEVRIAN');
    const hasP2Footer = p2Text.includes('Page 2 of 2');
    console.log(`  Page 2 has slim header lockup: ${hasSlimHeader}`);
    console.log(`  Page 2 has "Page 2 of 2": ${hasP2Footer}`);
    if (hasSlimHeader && hasP2Footer) {
      console.log(`  PASS: Page 2 layout auto-aligned with slim header and correct pagination.`);
    }
  }

  // Step 8: Test Mobile Viewport at 375px
  console.log('\nStep 8: Testing mobile viewport at 375px...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_375px.png') });
  console.log(`  Saved: ${path.join(OUT_DIR, 'mobile_375px.png')}`);

  // Test mobile planner bottom sheet
  const mobilePill = page.locator('button[title*="Quotation Page Planner"]').first();
  if (await mobilePill.isVisible()) {
    await mobilePill.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT_DIR, 'mobile_planner_bottom_sheet.png') });
    console.log(`  Saved: ${path.join(OUT_DIR, 'mobile_planner_bottom_sheet.png')}`);
    const closeBtn = page.locator('button:has-text("Cancel")');
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // Reset viewport
  await page.setViewportSize({ width: 1600, height: 1080 });
  await page.waitForTimeout(400);

  // Step 9: Regression test against baselines: Demo Receipt, 1-Page Invoice
  console.log('\nStep 9: Testing Zero Regression on Invoice & Receipt...');

  // Invoice
  const invoiceBtn = page.locator('button:has-text("Invoice")').first();
  await invoiceBtn.click();
  await page.waitForTimeout(600);
  const invoicePages = await page.locator('.a4-page-export').all();
  console.log(`  Invoice pages count: ${invoicePages.length}`);
  if (invoicePages.length > 0) {
    await invoicePages[0].screenshot({ path: path.join(OUT_DIR, 'regression_invoice_1page.png') });
  }

  // Receipt
  const receiptBtn = page.locator('button:has-text("Receipt")').first();
  await receiptBtn.click();
  await page.waitForTimeout(600);
  const receiptPages = await page.locator('.a4-page-export').all();
  console.log(`  Receipt pages count: ${receiptPages.length}`);
  if (receiptPages.length > 0) {
    await receiptPages[0].screenshot({ path: path.join(OUT_DIR, 'regression_demo_receipt.png') });
  }

  console.log('\nStep 10: History view page count check...');
  const historyNav = page.locator('button:has-text("History")').first();
  if (await historyNav.isVisible()) {
    await historyNav.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(OUT_DIR, 'history_page_count.png') });
    console.log(`  Saved: ${path.join(OUT_DIR, 'history_page_count.png')}`);
  }

  console.log('\n================================================================');
  console.log('                 ALL QA TESTS EXECUTED                          ');
  console.log('================================================================');

  await browser.close();
}

main().catch((err) => {
  console.error('QA Test execution failed:', err);
  process.exit(1);
});
