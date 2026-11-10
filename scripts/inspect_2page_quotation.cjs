const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function run() {
  console.log('=== INSPECTING 2-PAGE QUOTATION LAYOUT ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 2,
    acceptDownloads: true,
  });
  const page = await context.newPage();

  page.on('dialog', async (dialog) => {
    console.log(`[Browser Dialog] ${dialog.type()}: ${dialog.message()}`);
    await dialog.accept();
  });

  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Switch to Quotation
  const qBtn = page.locator('button:has-text("Quotation")').first();
  await qBtn.click();
  await page.waitForTimeout(1000);

  // Replace placeholders so it's a real quotation
  const textareas = await page.locator('textarea').all();
  for (const ta of textareas) {
    const val = await ta.inputValue();
    if (val.includes('[e.g. editing')) {
      await ta.fill('High-retention 4K reel editing, audio mastering, custom motion graphics, color grading, 2 revisions per deliverable.');
    } else if (val.includes('[e.g. shooting')) {
      await ta.fill('On-site raw production, voice-over talent licensing, paid media advertising spend.');
    } else if (val.includes('[X]')) {
      await ta.fill('First draft within 3 working days and final delivery within 5 working days after advance and footage are received.');
    }
  }

  // Set client name & project
  const clientInput = page.locator('input[placeholder*="Search or enter client"]').first();
  if (await clientInput.isVisible()) {
    await clientInput.fill('FinTech Media Labs');
  }

  await page.waitForTimeout(800);

  // Count A4 pages rendered
  const a4Pages = await page.locator('.a4-page-export').all();
  console.log(`Number of A4 Pages rendered for Quotation: ${a4Pages.length}`);

  if (a4Pages.length >= 2) {
    console.log('  ✓ SUCCESS: Quotation is rendered across 2 distinct pages as requested!');
  } else {
    console.warn(`  ! Expected 2 pages, but found ${a4Pages.length}`);
  }

  // Screenshot Page 1
  if (a4Pages.length > 0) {
    const p1Path = path.join(OUTPUT_DIR, 'quotation_page_1.png');
    await a4Pages[0].screenshot({ path: p1Path });
    console.log(`Saved: ${p1Path}`);
    const p1Text = await a4Pages[0].innerText();
    console.log('\n--- RAW PAGE 1 TEXT ---');
    console.log(p1Text);
    console.log('\n--- PAGE 1 HIGHLIGHTS ---');
    console.log('Has HeaderBand:', p1Text.includes('DEVRIAN'));
    console.log('Has Eyebrow & Title:', p1Text.includes('QUOTATION'));
    console.log('Has Meta Row:', p1Text.includes('QUOTATION NO.'));
    console.log('Has Prepared For:', p1Text.includes('PREPARED FOR') || p1Text.includes('Prepared For'));
    console.log('Has Scope Table:', p1Text.includes('SCOPE OF WORK'));
    console.log('Has TOTAL bar:', p1Text.includes('TOTAL'));
    console.log('Has Advance (50%):', p1Text.includes('Advance to Start Work'));
    console.log('Has Balance Payable:', p1Text.includes('Balance Payable'));
    console.log('Has GST line:', p1Text.includes('GST: Not applicable'));
    console.log('Has Bridge to Page 2:', p1Text.includes('Detailed on Page 2'));
    console.log('Has Footer Page 1 of 2:', p1Text.includes('Page 1 of 2'));
  }

  // Screenshot Page 2
  if (a4Pages.length > 1) {
    const p2Path = path.join(OUTPUT_DIR, 'quotation_page_2.png');
    await a4Pages[1].screenshot({ path: p2Path });
    console.log(`\nSaved: ${p2Path}`);
    const p2Text = await a4Pages[1].innerText();
    console.log('\n--- PAGE 2 HIGHLIGHTS ---');
    console.log('Has Continued Header:', p2Text.includes('QUOTATION') && p2Text.includes('Page 2 of 2'));
    console.log('Has Inclusions:', p2Text.includes('INCLUDED:'));
    console.log('Has Exclusions:', p2Text.includes('NOT INCLUDED:'));
    console.log('Has Delivery Timeline:', p2Text.includes('DELIVERY TIMELINE'));
    console.log('Has Payment Details:', p2Text.includes('PAYMENT DETAILS'));
    console.log('Has Terms & Conditions:', p2Text.includes('TERMS & CONDITIONS') || p2Text.includes('TERMS & NOTES'));
    console.log('Has Client Acceptance:', p2Text.includes('CLIENT ACCEPTANCE'));
    console.log('Has For DEVRIAN:', p2Text.includes('FOR DEVRIAN'));
    console.log('Has Closing line:', p2Text.includes('Thank you for considering DEVRIAN'));
    console.log('Has Dev Rajpoot signature block:', p2Text.includes('Dev Rajpoot'));
    console.log('Has Footer Page 2 of 2:', p2Text.includes('Page 2 of 2'));
  }

  // Download PDF
  console.log('\nTesting 2-Page Quotation PDF Export...');
  const downloadBtn = page.locator('button:has-text("Download PDF")');
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 15000 }).catch(() => null),
    downloadBtn.click(),
  ]);

  if (download) {
    const pdfPath = path.join(OUTPUT_DIR, 'quotation_2page.pdf');
    await download.saveAs(pdfPath);
    console.log(`  ✓ Successfully downloaded 2-Page Quotation PDF: ${pdfPath}`);
    const pdfSize = fs.statSync(pdfPath).size;
    console.log(`    PDF File Size: ${(pdfSize / 1024).toFixed(1)} KB`);
  }

  await browser.close();
  console.log('\n=== INSPECTION COMPLETE ===');
}

run().catch(console.error);
