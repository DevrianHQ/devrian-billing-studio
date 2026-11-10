const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 2000 } });

  await page.goto('http://localhost:4173/#/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Switch to Quotation
  await page.locator('button:has-text("Quotation")').first().click();
  await page.waitForTimeout(600);

  // Switch to One-Time Project
  await page.locator('button:has-text("One-Time Project")').first().click();
  await page.waitForTimeout(600);

  const pages = await page.locator('.a4-page-export').all();
  console.log(`Pages count: ${pages.length}`);

  const outDir = path.resolve(__dirname, '../qa-screenshots/diagnose');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (pages.length >= 2) {
    // 1. Page 2 full screenshot
    const box2 = await pages[1].boundingBox();
    if (box2) {
      await page.screenshot({ path: path.join(outDir, 'verified_project_p2_full.png'), clip: box2 });
      console.log('Saved: verified_project_p2_full.png');
    }

    // 2. SummaryBlock closeup
    const summaryEl = pages[1].locator('[data-section="quotation-summary"]');
    const summaryBox = await summaryEl.boundingBox();
    if (summaryBox) {
      // expand slightly
      await page.screenshot({
        path: path.join(outDir, 'closeup_summary_block.png'),
        clip: {
          x: summaryBox.x - 20,
          y: summaryBox.y - 40,
          width: summaryBox.width + 40,
          height: summaryBox.height + 60,
        },
      });
      console.log('Saved: closeup_summary_block.png');
    }

    // 3. PaymentBox closeup
    const paymentEl = pages[1].locator('[data-section="quotation-payment-details"]');
    const paymentBox = await paymentEl.boundingBox();
    if (paymentBox) {
      await page.screenshot({
        path: path.join(outDir, 'closeup_payment_box.png'),
        clip: {
          x: paymentBox.x - 10,
          y: paymentBox.y - 10,
          width: paymentBox.width + 20,
          height: paymentBox.height + 20,
        },
      });
      console.log('Saved: closeup_payment_box.png');
    }

    // 4. Signature closeup
    const sigEl = pages[1].locator('[data-section="quotation-acceptance"]');
    const sigBox = await sigEl.boundingBox();
    if (sigBox) {
      await page.screenshot({
        path: path.join(outDir, 'closeup_signature_pair.png'),
        clip: {
          x: sigBox.x - 10,
          y: sigBox.y - 10,
          width: sigBox.width + 20,
          height: sigBox.height + 20,
        },
      });
      console.log('Saved: closeup_signature_pair.png');
    }
  }

  await browser.close();
  console.log('Done!');
})();

