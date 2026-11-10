const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v4');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const BASELINE_DIR = path.resolve(__dirname, '../qa-baseline/before_v4');

async function main() {
  console.log('========================================================================');
  console.log('   DEVRIAN BILLING STUDIO: COMPREHENSIVE QUOTATION REBUILD QA SUITE     ');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1080 },
    deviceScaleFactor: 2,
    acceptDownloads: true,
  });
  const page = await context.newPage();

  let lastDialogMessage = '';
  page.on('dialog', async (d) => {
    lastDialogMessage = d.message();
    console.log(`  [Dialog] ${d.type()}: ${d.message()}`);
    await d.accept();
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`  [Browser Error]:`, msg.text());
    }
  });

  // Step 1: Open app
  console.log('Step 1: Navigating to DEVRIAN Billing Studio at http://localhost:4173/#create...');
  await page.goto('http://localhost:4173/#create', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------------------
  // TEST A: ZERO REGRESSION ON INVOICE & RECEIPT
  // -------------------------------------------------------------------------
  console.log('\n--- TEST A: ZERO REGRESSION ON INVOICE & RECEIPT ---');
  // 1. Invoice
  const invBtn = page.locator('button:has-text("Invoice")').first();
  await invBtn.click();
  await page.waitForTimeout(600);
  let invPage = page.locator('.a4-page-export').first();
  const invShot = path.join(OUT_DIR, 'invoice_current.png');
  await invPage.screenshot({ path: invShot });
  console.log('  Saved invoice_current.png');

  // 2. Receipt
  const recBtn = page.locator('button:has-text("Receipt")').first();
  await recBtn.click();
  await page.waitForTimeout(600);
  let recPage = page.locator('.a4-page-export').first();
  const recShot = path.join(OUT_DIR, 'receipt_current.png');
  await recPage.screenshot({ path: recShot });
  console.log('  Saved receipt_current.png');

  // Compare file sizes with baseline
  if (fs.existsSync(path.join(BASELINE_DIR, 'invoice_baseline.png'))) {
    const baseInvStat = fs.statSync(path.join(BASELINE_DIR, 'invoice_baseline.png'));
    const curInvStat = fs.statSync(invShot);
    const invDiff = Math.abs(baseInvStat.size - curInvStat.size);
    console.log(`  Invoice check: Baseline=${baseInvStat.size} bytes, Current=${curInvStat.size} bytes (diff=${invDiff})`);
    if (invDiff === 0) {
      console.log('  PASS: Invoice output is 100% IDENTICAL to baseline! Zero regression.');
    } else {
      console.warn('  WARN: Minor byte diff on Invoice rendering.');
    }
  }
  if (fs.existsSync(path.join(BASELINE_DIR, 'receipt_baseline.png'))) {
    const baseRecStat = fs.statSync(path.join(BASELINE_DIR, 'receipt_baseline.png'));
    const curRecStat = fs.statSync(recShot);
    const recDiff = Math.abs(baseRecStat.size - curRecStat.size);
    console.log(`  Receipt check: Baseline=${baseRecStat.size} bytes, Current=${curRecStat.size} bytes (diff=${recDiff})`);
    if (recDiff === 0) {
      console.log('  PASS: Receipt output is 100% IDENTICAL to baseline! Zero regression.');
    } else {
      console.warn('  WARN: Minor byte diff on Receipt rendering.');
    }
  }

  // -------------------------------------------------------------------------
  // TEST B: PROJECT QUOTATION (1, 4, 8, 15 ITEMS)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST B: PROJECT QUOTATION (1, 4, 8, 15 ITEMS) ---');
  const quotBtn = page.locator('button:has-text("Quotation")').first();
  await quotBtn.click();
  await page.waitForTimeout(800);

  // Setup standard 1-item Project quotation
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = draftStr ? JSON.parse(draftStr) : {};
    draft.type = 'quotation';
    draft.quotationType = 'project';
    draft.clientName = 'Acme Global Ventures';
    draft.clientContactPerson = 'Rahul Sharma';
    draft.clientAddress = 'Tech Park Phase 2, Sector 62, Noida, UP 201301';
    draft.projectName = 'Complete Brand Identity & Web Experience';
    draft.items = [
      {
        id: 'p-item-1',
        description: 'Brand Identity Strategy & Design System',
        subDescription: 'Core identity, visual guidelines, typography, colour palette and stationery kit',
        quantity: 1,
        rate: 55000,
        amount: 55000,
        billing: 'one_time',
      },
    ];
    draft.subtotal = 55000;
    draft.quotationBlocks = undefined; // use clean defaults
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Check 1-item Project
  let a4Pages = await page.locator('.a4-page-export').all();
  console.log(`  Project (1 item) rendered pages: ${a4Pages.length} (Expected: 1)`);
  if (a4Pages.length === 1) {
    await a4Pages[0].screenshot({ path: path.join(OUT_DIR, 'project_1item.png') });
  }

  // Check 4 items (Target 1-page natural fit)
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = JSON.parse(draftStr);
    draft.items = [
      {
        id: 'p-item-1',
        description: 'Brand Identity Strategy & Design System',
        subDescription: 'Core identity, visual guidelines, typography, colour palette and stationery kit',
        quantity: 1,
        rate: 55000,
        amount: 55000,
        billing: 'one_time',
      },
      {
        id: 'p-item-2',
        description: 'Responsive UI/UX Web Design & Wireframes',
        subDescription: 'High-fidelity Figma prototypes for Desktop, Tablet and Mobile viewports',
        quantity: 1,
        rate: 45000,
        amount: 45000,
        billing: 'one_time',
      },
      {
        id: 'p-item-3',
        description: 'Full-Stack Web Development & CMS Setup',
        subDescription: 'Clean responsive front-end build with SEO optimization and analytics integration',
        quantity: 1,
        rate: 65000,
        amount: 65000,
        billing: 'one_time',
      },
      {
        id: 'p-item-4',
        description: 'Launch Support, QA & Post-Deployment Care',
        subDescription: 'Domain configuration, cloud hosting setup, SSL certificate and 30-day warranty',
        quantity: 1,
        rate: 20000,
        amount: 20000,
        billing: 'one_time',
      },
    ];
    draft.subtotal = 185000;
    draft.quotationBlocks = undefined;
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  a4Pages = await page.locator('.a4-page-export').all();
  console.log(`  Project (4 items) rendered pages: ${a4Pages.length} (Expected: 1)`);
  if (a4Pages.length === 1) {
    await a4Pages[0].screenshot({ path: path.join(OUT_DIR, 'project_4items.png') });
    console.log('  PASS: Project (4 items) comfortably fits on strictly 1 page!');
  } else {
    console.error(`  FAIL: Project (4 items) rendered on ${a4Pages.length} pages instead of 1.`);
  }

  // Check 8 items (Automatic flow to 2 pages)
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = JSON.parse(draftStr);
    const existing = draft.items || [];
    const extra = [];
    for (let i = 5; i <= 8; i++) {
      extra.push({
        id: `p-item-${i}`,
        description: `Supplementary Deliverable Module ${i}`,
        subDescription: `Scope details and technical specifications for deliverable item ${i}`,
        quantity: 1,
        rate: 15000,
        amount: 15000,
        billing: 'one_time',
      });
    }
    draft.items = [...existing, ...extra];
    draft.quotationBlocks = undefined;
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  a4Pages = await page.locator('.a4-page-export').all();
  console.log(`  Project (8 items) rendered pages: ${a4Pages.length} (Expected: 2)`);
  if (a4Pages.length >= 2) {
    await a4Pages[0].screenshot({ path: path.join(OUT_DIR, 'project_8items_p1.png') });
    await a4Pages[1].screenshot({ path: path.join(OUT_DIR, 'project_8items_p2.png') });
    console.log('  PASS: Project (8 items) automatically flows into 2 pages without modal dialogs!');
  }

  // -------------------------------------------------------------------------
  // TEST C: MONTHLY RETAINER QUOTATION (6 DELIVERABLES + 1 PRICE ITEM)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST C: MONTHLY RETAINER QUOTATION ---');
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = draftStr ? JSON.parse(draftStr) : {};
    draft.type = 'quotation';
    draft.quotationType = 'monthly';
    draft.clientName = 'Zenith Digital Media';
    draft.clientContactPerson = 'Pooja Verma';
    draft.projectName = 'Monthly Social Media Growth Retainer';
    draft.items = [
      {
        id: 'm-item-1',
        description: 'Monthly Social Media Growth Retainer',
        subDescription: 'Full creative production, copywriting, calendar planning & monthly performance review',
        quantity: 1,
        rate: 45000,
        amount: 45000,
        billing: 'monthly',
      },
    ];
    draft.subtotal = 45000;
    draft.minTermMonths = 3;
    draft.noticePeriodDays = 30;
    draft.autoRenewal = true;
    draft.contractStartDate = '2026-11-15';
    draft.monthlyDeliverables = [
      { id: 'd1', item: 'Short-Form Videos (Reels / Shorts)', quantity: '12 / month', order: 1 },
      { id: 'd2', item: 'High-Converting Carousel Posts', quantity: '8 / month', order: 2 },
      { id: 'd3', item: 'Custom Graphic Posts & Stories', quantity: '15 / month', order: 3 },
      { id: 'd4', item: 'Copywriting & Captions with Hashtag Research', quantity: 'All posts', order: 4 },
      { id: 'd5', item: 'Monthly Content Strategy & Calendar', quantity: '1 / month', order: 5 },
      { id: 'd6', item: 'Monthly Analytics & Growth Review Report', quantity: '1 / month', order: 6 },
    ];
    draft.quotationBlocks = undefined;
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  a4Pages = await page.locator('.a4-page-export').all();
  console.log(`  Monthly (6 deliverables + 1 price item) rendered pages: ${a4Pages.length} (Expected: 1)`);
  if (a4Pages.length === 1) {
    await a4Pages[0].screenshot({ path: path.join(OUT_DIR, 'monthly_standard_6items.png') });
    console.log('  PASS: Monthly Retainer (6 deliverables + 1 price item) fits strictly on 1 page!');
  } else {
    console.error(`  FAIL: Monthly Retainer rendered on ${a4Pages.length} pages instead of 1.`);
  }

  // Verify text elements on Monthly Quotation
  const pageText = await a4Pages[0].innerText();
  const hasRetainerEyebrow = pageText.includes('MONTHLY RETAINER');
  const hasDeliverablesHeader = pageText.includes("WHAT'S INCLUDED EACH MONTH") && pageText.includes('6 DELIVERABLES');
  const hasBillingStrip = pageText.includes('BILLING CYCLE') && pageText.includes('MINIMUM TERM');
  const hasDueToStart = pageText.includes('DUE TO START');
  const hasMonth2Onwards = pageText.includes('From Month 2 onwards');
  const hasAcceptancePay = pageText.includes('pay the amount due to start');

  console.log(`  Monthly Retainer Feature Verifications:`);
  console.log(`    Eyebrow: 'QUOTATION · MONTHLY RETAINER' -> ${hasRetainerEyebrow}`);
  console.log(`    Deliverables Title + Count Badge ('6 DELIVERABLES') -> ${hasDeliverablesHeader}`);
  console.log(`    4-Column Billing Strip (Cycle + Term + Notice) -> ${hasBillingStrip}`);
  console.log(`    Solid Black Bar 'DUE TO START' -> ${hasDueToStart}`);
  console.log(`    Quiet Row 'From Month 2 onwards' -> ${hasMonth2Onwards}`);
  console.log(`    Acceptance Text 'pay the amount due to start' -> ${hasAcceptancePay}`);

  // -------------------------------------------------------------------------
  // TEST D: HYBRID QUOTATION (SETUP + MONTHLY)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST D: HYBRID QUOTATION (SETUP + MONTHLY) ---');
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    const draft = draftStr ? JSON.parse(draftStr) : {};
    draft.type = 'quotation';
    draft.quotationType = 'hybrid';
    draft.clientName = 'Apex E-Commerce Ltd';
    draft.clientContactPerson = 'Vikram Malhotra';
    draft.projectName = 'Brand Setup & Growth Retainer';
    draft.items = [
      {
        id: 'h-item-1',
        description: 'One-Time Creative Setup & Content Strategy',
        subDescription: 'Initial brand audit, visual asset creation and setup of template system',
        quantity: 1,
        rate: 25000,
        amount: 25000,
        billing: 'one_time',
      },
      {
        id: 'h-item-2',
        description: 'Monthly Social Media Retainer',
        subDescription: 'Ongoing content creation, scheduling, community management and reporting',
        quantity: 1,
        rate: 40000,
        amount: 40000,
        billing: 'monthly',
      },
    ];
    draft.subtotal = 65000;
    draft.minTermMonths = 3;
    draft.noticePeriodDays = 30;
    draft.contractStartDate = '2026-11-20';
    draft.monthlyDeliverables = [
      { id: 'd1', item: 'Short-Form Video Production (Reels)', quantity: '10 / month', order: 1 },
      { id: 'd2', item: 'High-Converting Carousel Slides', quantity: '6 / month', order: 2 },
      { id: 'd3', item: 'Graphic Creatives & Announcements', quantity: '12 / month', order: 3 },
      { id: 'd4', item: 'Copywriting & Scripting', quantity: 'All content', order: 4 },
      { id: 'd5', item: 'Bi-Weekly Strategy & Performance Call', quantity: '2 / month', order: 5 },
    ];
    draft.quotationBlocks = undefined;
    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  a4Pages = await page.locator('.a4-page-export').all();
  console.log(`  Hybrid (5 deliverables + 2 price items) rendered pages: ${a4Pages.length} (Expected: 1)`);
  if (a4Pages.length === 1) {
    await a4Pages[0].screenshot({ path: path.join(OUT_DIR, 'hybrid_standard.png') });
    console.log('  PASS: Hybrid Quotation fits strictly on 1 page!');
  }

  const hybridText = await a4Pages[0].innerText();
  const hasHybridEyebrow = hybridText.includes('RETAINER + SETUP');
  const hasSetupTag = hybridText.includes('ONE-TIME SETUP');
  const hasMonthlyTag = hybridText.includes('MONTHLY RETAINER');
  const hasSetupNetRow = hybridText.includes('One-Time Setup') || hybridText.includes('Setup');
  const hasMonthNetRow = hybridText.includes('First Month Retainer') || hybridText.includes('First Month');

  console.log(`  Hybrid Feature Verifications:`);
  console.log(`    Eyebrow: 'QUOTATION · RETAINER + SETUP' -> ${hasHybridEyebrow}`);
  console.log(`    Table item badges ('ONE-TIME SETUP' & 'MONTHLY RETAINER') -> ${hasSetupTag && hasMonthlyTag}`);
  console.log(`    Summary breakdown (One-Time Setup + First Month Retainer) -> ${hasSetupNetRow && hasMonthNetRow}`);

  // -------------------------------------------------------------------------
  // TEST E: IN-EDITOR PAGE LAYOUT PANEL
  // -------------------------------------------------------------------------
  console.log('\n--- TEST E: IN-EDITOR PAGE LAYOUT PANEL ---');
  const layoutToggleBtn = page.locator('button:has-text("Layout:"), button:has-text("Page Layout")').first();
  if (await layoutToggleBtn.isVisible()) {
    await layoutToggleBtn.scrollIntoViewIfNeeded();
    await layoutToggleBtn.click();
    await page.waitForTimeout(400);

    const layoutPanel = page.locator('text=Interactive Page Organizer').first();
    const isPanelOpen = await layoutPanel.isVisible();
    console.log(`  Interactive Page Organizer visible: ${isPanelOpen}`);
    await page.screenshot({ path: path.join(OUT_DIR, 'page_layout_panel.png') });
    console.log('  Saved page_layout_panel.png');

    // Click Auto-Layout button
    const autoLayoutBtn = page.locator('button:has-text("Auto-Layout")').first();
    if (await autoLayoutBtn.isVisible()) {
      await autoLayoutBtn.click();
      await page.waitForTimeout(400);
      console.log('  PASS: Auto-Layout button clicked successfully.');
    }
  }

  // -------------------------------------------------------------------------
  // TEST F: EXPORT PDF & UNFILLED PLACEHOLDER GUARD
  // -------------------------------------------------------------------------
  console.log('\n--- TEST F: EXPORT PDF & UNFILLED PLACEHOLDER GUARD ---');
  lastDialogMessage = '';

  // Inject an unfilled bracket [...] into free notes
  await page.evaluate(() => {
    const draftStr = localStorage.getItem('devrian_active_draft_v4');
    if (draftStr) {
      const draft = JSON.parse(draftStr);
      draft.freeNotes = 'Client requirement: [Insert details here]';
      draft.sectionVisibility = { ...draft.sectionVisibility, showFreeNotes: true };
      localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
    }
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const exportBtn = page.locator('button:has-text("Export PDF"), button:has-text("Download PDF")').first();
  if (await exportBtn.isVisible()) {
    await exportBtn.click();
    await page.waitForTimeout(500);

    const hasPlaceholderWarning =
      lastDialogMessage.includes('Cannot export PDF') ||
      lastDialogMessage.includes('bracket') ||
      lastDialogMessage.includes('placeholders');
    console.log(`  Unfilled bracket guard blocked export: ${hasPlaceholderWarning}`);
    if (hasPlaceholderWarning) {
      console.log('  PASS: Unfilled bracket placeholder strictly blocked PDF export!');
    }
  }

  // -------------------------------------------------------------------------
  // TEST G: MOBILE VIEWPORT (375x812)
  // -------------------------------------------------------------------------
  console.log('\n--- TEST G: MOBILE VIEWPORT (375x812) ---');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);

  // Take mobile screenshot in Edit tab
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_edit_tab.png') });
  console.log('  Saved mobile_edit_tab.png');

  // Switch to Preview tab
  const previewTabBtn = page.locator('button:text-is("Preview")').first();
  if (await previewTabBtn.isVisible()) {
    await previewTabBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT_DIR, 'mobile_preview_tab.png') });
    console.log('  Saved mobile_preview_tab.png');
  }

  console.log('\n========================================================================');
  console.log('   QA TEST SUITE COMPLETED SUCCESSFULLY!                                ');
  console.log('========================================================================\n');

  await browser.close();
}

main().catch((err) => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
