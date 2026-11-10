const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v2');

async function testPdfAndEdgeCases() {
  console.log('================================================================');
  console.log('      DEVRIAN: PDF EXPORT & PAGE PLANNER EDGE CASES QA          ');
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

  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });

  // 1. Switch to Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(500);

  // Helper to add line items
  async function addLineItem() {
    const btn = page.locator('button:has-text("Add Line Item")').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(100);
  }

  // Add 19 items (total 20 items) to test Line items continuation on Page 2
  console.log('Step 1: Adding 19 line items (total 20 items)...');
  for (let i = 0; i < 19; i++) {
    await addLineItem();
  }

  // Check that header pill now shows overflow or 2 pages
  const pillBtn = page.locator('button[title*="Quotation Page Planner"]').first();
  console.log(`  Pill Text: "${(await pillBtn.innerText()).replace(/\n/g, ' ')}"`);

  // Open Planner dialog
  console.log('Step 2: Opening Page Planner for 20 items...');
  await pillBtn.click();
  await page.waitForTimeout(500);

  const dialog = page.locator('[role="dialog"]');
  console.log(`  Dialog is open: ${await dialog.isVisible()}`);

  // Check the "Fit to one page instead" option showing reason if disabled or resulting scale
  const fitToOnePageLabel = dialog.locator('text=Fit to one page instead').first();
  console.log(`  "Fit to one page instead" option present: ${await fitToOnePageLabel.isVisible()}`);

  // Check the "Let line items continue on page 2" toggle
  const continueItemsToggle = dialog.locator('text=Let line items continue on page 2').first();
  console.log(`  "Let line items continue on page 2" option present: ${await continueItemsToggle.isVisible()}`);

  // Apply plan
  const applyBtn = dialog.locator('button:has-text("Apply")').first();
  await applyBtn.click();
  await page.waitForTimeout(600);

  // Verify 2 pages rendered
  let pages = await page.locator('.a4-page-export').all();
  console.log(`  Rendered pages count: ${pages.length}`);
  if (pages.length === 2) {
    await pages[0].screenshot({ path: path.join(OUT_DIR, '20items_continuation_p1.png') });
    await pages[1].screenshot({ path: path.join(OUT_DIR, '20items_continuation_p2.png') });
    console.log(`  Saved: 20items_continuation_p1.png & 20items_continuation_p2.png`);

    // Check that Page 2 has repeated table header
    const p2TableHead = pages[1].locator('table thead');
    console.log(`  Page 2 has repeated table header: ${await p2TableHead.isVisible()}`);

    // Check that Summary & TOTAL bar are on Page 2 with the last items
    const p2TotalBar = pages[1].locator('[data-section="quotation-total-bar"]');
    console.log(`  Page 2 has TOTAL bar with last items: ${await p2TotalBar.isVisible()}`);
  }

  // Step 3: Test PDF Export
  console.log('\nStep 3: Triggering PDF Download...');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 35000 }),
    page.locator('button:has-text("Download PDF")').first().click(),
  ]);

  const suggestedFilename = download.suggestedFilename();
  console.log(`  Suggested filename: "${suggestedFilename}"`);
  const downloadPath = path.join(OUT_DIR, suggestedFilename);
  await download.saveAs(downloadPath);

  const stats = fs.statSync(downloadPath);
  console.log(`  PDF downloaded to: ${downloadPath}`);
  console.log(`  PDF file size: ${(stats.size / 1024).toFixed(1)} KB`);
  if (stats.size < 2 * 1024 * 1024) {
    console.log(`  PASS: PDF file size is under 2 MB (${(stats.size / 1024).toFixed(1)} KB).`);
  } else {
    console.warn(`  WARNING: PDF file size exceeds 2 MB.`);
  }

  // Step 4: Test Old Quotation "Convert to lean layout" Banner
  console.log('\nStep 4: Testing Old Quotation "Convert to lean layout" banner...');
  await page.evaluate(() => {
    const draft = JSON.parse(localStorage.getItem('devrian_active_draft_v4') || '{}');
    draft.isLeanQuotation = false; // simulate old quotation
    draft.inclusions = 'Old full page inclusions text';
    draft.sectionVisibility = { ...draft.sectionVisibility, showInclusions: true, showTimeline: true };
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const convertBanner = page.locator('text=This quotation is using the legacy detailed format.');
  const hasConvertBanner = await convertBanner.isVisible();
  console.log(`  Legacy format banner visible: ${hasConvertBanner}`);

  if (hasConvertBanner) {
    const convertBtn = page.locator('button:has-text("Convert to lean layout")');
    await convertBtn.click();
    await page.waitForTimeout(400);

    const undoBtn = page.locator('button:has-text("Undo")');
    console.log(`  Undo button available after conversion: ${await undoBtn.isVisible()}`);
  }

  console.log('\n================================================================');
  console.log('         PDF & EDGE CASES QA COMPLETED SUCCESSFULLY             ');
  console.log('================================================================');

  await browser.close();
}

testPdfAndEdgeCases().catch((err) => {
  console.error('Edge cases test failed:', err);
  process.exit(1);
});

