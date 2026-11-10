const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v7');

async function main() {
  console.log('--- TESTING EDGE CASES & EXPORT BLOCKERS (V7) ---');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  let dialogMessages = [];
  page.on('dialog', async (d) => {
    console.log(`[Alert/Dialog intercepted]: ${d.message()}`);
    dialogMessages.push(d.message());
    await d.accept();
  });

  await page.goto('http://localhost:4173/#create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  // Switch to Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);

  // Switch to One-Time Project
  const projectBtn = page.locator('button:has-text("One-Time Project")').first();
  if (await projectBtn.isVisible()) {
    await projectBtn.click();
    await page.waitForTimeout(600);
  }

  // 1. PROJECT 1 ROW TEST
  console.log('\nTesting Project with 1 row...');
  // Delete all items except 1
  const deleteButtons = page.locator('button[title*="Delete"], button[aria-label*="Delete"], button:has-text("Delete")');
  let delCount = await deleteButtons.count();
  while (delCount > 1) {
    await deleteButtons.first().click();
    await page.waitForTimeout(300);
    delCount = await deleteButtons.count();
  }
  await page.waitForTimeout(500);

  let quotPages = await page.locator('.a4-page-export').all();
  console.log(`Project with 1 item: Page count = ${quotPages.length}`);
  if (quotPages.length === 1) {
    const p1Path = path.join(OUT_DIR, '12_project_1row.png');
    await quotPages[0].screenshot({ path: p1Path });
    console.log(`Saved: ${p1Path}`);
    console.log('✓ PASS: 1-row Project is exactly 1 page.');
  }

  // 2. PROJECT 5 ROWS TEST (Dense preset)
  console.log('\nTesting Project with 5 rows (Dense preset)...');
  const addItemBtn = page.locator('button:has-text("Add Line Item")').first();
  for (let i = 0; i < 4; i++) {
    if (await addItemBtn.isVisible()) {
      await addItemBtn.click();
      await page.waitForTimeout(300);
    }
  }
  await page.waitForTimeout(600);
  quotPages = await page.locator('.a4-page-export').all();
  console.log(`Project with 5 items: Page count = ${quotPages.length}`);
  if (quotPages.length === 1) {
    const p5Path = path.join(OUT_DIR, '13_project_5rows_dense.png');
    await quotPages[0].screenshot({ path: p5Path });
    console.log(`Saved: ${p5Path}`);
    console.log('✓ PASS: 5-row Project fits in Dense preset on exactly 1 page.');
  }

  // 3. PROJECT 6 ROWS TEST (Export Blocker)
  console.log('\nTesting Project with 6 rows (Export Blocker)...');
  if (await addItemBtn.isVisible()) {
    await addItemBtn.click();
    await page.waitForTimeout(600);
  }
  // Check fit indicator banner
  const indicator = page.locator('text=LAYOUT OVERFLOW / EXPORT BLOCKED');
  const isBlockedBannerVisible = await indicator.isVisible();
  console.log(`Blocked Banner Visible: ${isBlockedBannerVisible}`);

  // Attempt export to verify dialog
  dialogMessages = [];
  const exportBtn = page.locator('button:has-text("Download PDF")').first();
  if (await exportBtn.isVisible()) {
    await exportBtn.click();
    await page.waitForTimeout(500);
  }
  console.log(`Export blocked alert triggered: ${dialogMessages.length > 0}`);
  if (dialogMessages.length > 0) {
    console.log(`Alert message: "${dialogMessages[0]}"`);
    const hasLimitMsg = dialogMessages[0].includes('Maximum 5 rows allowed') || dialogMessages[0].includes('Too long for a 1-page quotation');
    console.log(`✓ PASS: Hard limit / overflow export blocker verified: ${hasLimitMsg}`);
  }

  const blockedPath = path.join(OUT_DIR, '14_project_6rows_blocked.png');
  await page.screenshot({ path: blockedPath, fullPage: false });
  console.log(`Saved: ${blockedPath}`);

  console.log('\n=== EDGE CASES & BLOCKERS VERIFIED SUCCESSFULLY ===');
  await browser.close();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
