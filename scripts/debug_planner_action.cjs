const { chromium } = require('playwright');

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });

  // Switch to Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(500);

  // Add 11 items (total 12 items)
  for (let i = 0; i < 11; i++) {
    const btn = page.locator('button:has-text("Add Line Item")').first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForTimeout(100);
  }

  // Check document in localStorage / window state
  const state = await page.evaluate(() => {
    const draft = localStorage.getItem('devrian_active_draft_v4');
    return {
      draft: draft ? JSON.parse(draft) : null,
      pageCount: document.querySelectorAll('.a4-page-export').length,
    };
  });
  console.log('Initial with 8 items: pageCount =', state.pageCount);

  // Open Page Planner
  const pillBtn = page.locator('button[title*="Quotation Page Planner"]').first();
  console.log('Pill visible:', await pillBtn.isVisible(), 'text:', await pillBtn.innerText());
  await pillBtn.click();
  await page.waitForTimeout(500);

  // Check checkboxes inside dialog
  const checkboxes = await page.locator('[role="dialog"] input[type="checkbox"]').all();
  console.log('Total checkboxes in dialog:', checkboxes.length);
  for (let i = 0; i < checkboxes.length; i++) {
    const isChecked = await checkboxes[i].isChecked();
    console.log(`  Checkbox ${i}: isChecked = ${isChecked}`);
  }

  // Click Apply
  const applyBtn = page.locator('[role="dialog"] button:has-text("Apply")').first();
  console.log('Apply button visible:', await applyBtn.isVisible());
  await applyBtn.click();
  await page.waitForTimeout(1000);

  const postState = await page.evaluate(() => {
    const draft = localStorage.getItem('devrian_active_draft_v4');
    return {
      draftMode: draft ? JSON.parse(draft).quotationLayoutMode : null,
      draftPlan: draft ? JSON.parse(draft).quotationPagePlan : null,
      pageCount: document.querySelectorAll('.a4-page-export').length,
    };
  });
  console.log('After Apply:', postState);

  await browser.close();
}

debug().catch(console.error);
