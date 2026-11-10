const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');

const OUT_DIR = path.resolve(__dirname, '../qa-screenshots/quotation-v5');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function isServerReady(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runQA() {
  console.log('=== STARTING QA VERIFICATION FOR QUOTATION V5 ===');

  const ready = await isServerReady('http://localhost:4173/');
  if (!ready) {
    console.error('Preview server is not reachable on http://localhost:4173. Please ensure it is running.');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Test 1: Project Quotation with 1 item (Exact case from user screenshot)
  console.log('\n--- Test 1: Project Quotation with 1 Item (User Screenshot Layout) ---');
  await page.goto('http://localhost:4173/');
  await page.waitForLoadState('networkidle');

  // Inject 1-item quotation matching user's exact scenario
  await page.evaluate(() => {
    const doc = {
      id: 'qa-proj-1',
      type: 'quotation',
      quotationType: 'project',
      documentNumber: 'DEV-QT-2026-001',
      date: '2026-11-10',
      validTill: '2026-11-25',
      status: 'draft',
      clientName: 'Naveen Kumar',
      clientContactPerson: 'Naveen Kumar',
      clientAddress: 'Sector 62, Noida, UP',
      clientPhone: '+91 98765 43210',
      clientEmail: 'client@example.com',
      projectName: 'FMCG Vertical Videos Campaign',
      items: [
        {
          id: 'i1',
          description: '50% Advance Payment',
          subDescription: 'Video editing - 15 FMCG vertical videos (as per proposal dated 04 November 2026)',
          quantity: 1,
          rate: 3000,
          amount: 3000,
        },
      ],
      subtotal: 3000,
      totalAmount: 3000,
      advancePercent: 50,
      balanceDueHours: 48,
      gstEnabled: false,
      applySignature: true,
      customText: {
        gstLine: 'GST: Not applicable (not registered under GST).',
        documentTitle: 'QUOTATION',
      },
      sectionVisibility: {
        showPaymentDetails: true,
        showAmountInWords: true,
        showGstLine: true,
        showTermsAndNotes: true,
        showAcceptance: true,
        showClosingLine: true,
      },
    };

    const profile = JSON.parse(localStorage.getItem('devrian_business_profile_v4') || '{}');
    profile.showBankDetails = true;
    profile.showUpi = true;
    profile.upiId = '6395171870@ybl';
    profile.bankAccountName = 'Dev Rajpoot';
    profile.bankName = 'State Bank of India';
    profile.bankAccountNumber = '43691322760';
    profile.bankIfsc = 'SBIN0031010';
    localStorage.setItem('devrian_business_profile_v4', JSON.stringify(profile));

    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(doc));
    localStorage.setItem('activeDocument', JSON.stringify(doc));
    // Also save in devrian_documents
    const all = JSON.parse(localStorage.getItem('devrian_documents') || '[]');
    const idx = all.findIndex((d) => d.id === doc.id);
    if (idx >= 0) all[idx] = doc;
    else all.unshift(doc);
    localStorage.setItem('devrian_documents', JSON.stringify(all));
  });

  await page.reload();
  await page.waitForTimeout(1000);

  // Capture Project 1-item full page and specific bottom block
  const p1Pages = await page.$$('.a4-page-export');
  console.log(`Rendered ${p1Pages.length} page(s) for 1-item project quotation`);
  if (p1Pages.length > 0) {
    await p1Pages[0].screenshot({ path: path.join(OUT_DIR, 'project_1item_full.png') });
    console.log('Saved project_1item_full.png');
  }

  // Inspect the bottom block DOM positions:
  const layoutCheck = await page.evaluate(() => {
    const table = document.querySelector('[data-section="quotation-data-table"]');
    const summary = document.querySelector('[data-section="quotation-summary"]');
    const payment = document.querySelector('[data-section="quotation-payment-box"]');

    // Find all text containing "GST: Not applicable"
    const bodyText = document.body.innerText;
    const gstOccurrences = (bodyText.match(/GST: Not applicable/g) || []).length;

    // Check if there's any GST text directly under the table before summary
    let gstUnderTable = false;
    if (table) {
      let next = table.nextElementSibling;
      while (next && next !== summary && !next.contains(summary)) {
        if (next.innerText && next.innerText.includes('GST: Not applicable')) {
          gstUnderTable = true;
        }
        next = next.nextElementSibling;
      }
    }

    // Check GST position relative to PaymentBox
    let gstBeforePayment = false;
    if (payment) {
      let prev = payment.previousElementSibling;
      if (!prev) {
        // Check parent's previous element
        const parent = payment.closest('.w-full.box-border');
        if (parent && parent.previousElementSibling) {
          prev = parent.previousElementSibling;
        }
      }
      if (prev && prev.innerText && prev.innerText.includes('GST: Not applicable')) {
        gstBeforePayment = true;
      }
    }

    // Check Amount in Words
    const hasWords = bodyText.includes('Rupees');

    return {
      gstOccurrences,
      gstUnderTable,
      gstBeforePayment,
      hasWords,
      hasPayment: Boolean(payment),
      hasSummary: Boolean(summary),
    };
  });

  console.log('DOM Layout Check Results:', layoutCheck);

  // Test 2: Project Quotation with 4 items
  console.log('\n--- Test 2: Project Quotation with 4 Items (Standard 1-Page Case) ---');
  await page.evaluate(() => {
    const doc = JSON.parse(localStorage.getItem('activeDocument'));
    doc.items = [
      { id: '1', description: 'Brand Identity Design', subDescription: 'Logo, typography, visual guidelines', quantity: 1, rate: 25000, amount: 25000 },
      { id: '2', description: 'Responsive Web UI/UX', subDescription: 'Figma mockups and interactive prototype', quantity: 1, rate: 30000, amount: 30000 },
      { id: '3', description: 'Frontend Development', subDescription: 'React, Tailwind CSS implementation', quantity: 1, rate: 35000, amount: 35000 },
      { id: '4', description: 'Deployment & Launch Support', subDescription: 'Domain setup and cloud configuration', quantity: 1, rate: 10000, amount: 10000 },
    ];
    doc.subtotal = 100000;
    doc.totalAmount = 100000;
    const profile = JSON.parse(localStorage.getItem('devrian_business_profile_v4') || '{}');
    profile.showBankDetails = true;
    profile.showUpi = true;
    profile.upiId = '6395171870@ybl';
    profile.bankAccountName = 'Dev Rajpoot';
    profile.bankName = 'State Bank of India';
    profile.bankAccountNumber = '43691322760';
    profile.bankIfsc = 'SBIN0031010';
    localStorage.setItem('devrian_business_profile_v4', JSON.stringify(profile));

    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(doc));
    localStorage.setItem('activeDocument', JSON.stringify(doc));
  });

  await page.reload();
  await page.waitForTimeout(1000);

  const p4Pages = await page.$$('.a4-page-export');
  console.log(`Rendered ${p4Pages.length} page(s) for 4-item project quotation`);
  if (p4Pages.length > 0) {
    await p4Pages[0].screenshot({ path: path.join(OUT_DIR, 'project_4items_full.png') });
    console.log('Saved project_4items_full.png');
  }

  // Test 3: Monthly Retainer Quotation (2 Pages)
  console.log('\n--- Test 3: Monthly Retainer Quotation (2-Page Architecture) ---');
  await page.evaluate(() => {
    const doc = {
      id: 'qa-monthly-1',
      type: 'quotation',
      quotationType: 'monthly',
      documentNumber: 'DEV-QT-2026-002',
      date: '2026-11-10',
      validTill: '2026-11-25',
      status: 'draft',
      clientName: 'Nexus Growth Labs',
      clientContactPerson: 'Vikram Malhotra',
      clientAddress: 'Cyber City, Gurugram, HR',
      clientPhone: '+91 91234 56789',
      clientEmail: 'growth@nexuslabs.co',
      projectName: 'Full-Stack Organic Social & Content Retainer',
      items: [
        {
          id: 'm1',
          description: 'Social Media Management & Strategy Retainer',
          subDescription: 'End-to-end strategy, scripting, production and publishing',
          quantity: 1,
          rate: 35000,
          amount: 35000,
        },
      ],
      monthlyDeliverables: [
        { id: 'd1', item: 'Short-Form Vertical Videos (Reels / Shorts)', quantity: '12 / Month' },
        { id: 'd2', item: 'Carousels & Infographics', quantity: '8 / Month' },
        { id: 'd3', item: 'Copywriting & Scriptwriting', quantity: 'Included' },
        { id: 'd4', item: 'Community Management & Comment Moderation', quantity: 'Daily' },
        { id: 'd5', item: 'Monthly Analytics & Performance Review Call', quantity: '1 / Month' },
        { id: 'd6', item: 'Dedicated Account Manager & Slack Access', quantity: 'Included' },
      ],
      billingCycle: 'Monthly Retainer',
      contractStartDate: '2026-12-01',
      minTermMonths: 3,
      noticePeriodDays: 30,
      paymentDueDescription: 'In advance, before start of billing cycle',
      autoRenewalDescription: 'Monthly renewal until cancelled in writing',
      subtotal: 35000,
      totalAmount: 35000,
      gstEnabled: false,
      applySignature: true,
      customText: {
        gstLine: 'GST: Not applicable (not registered under GST).',
        documentTitle: 'QUOTATION',
      },
      sectionVisibility: {
        showPaymentDetails: true,
        showAmountInWords: true,
        showGstLine: true,
        showTermsAndNotes: true,
        showAcceptance: true,
        showClosingLine: true,
      },
    };

    const profile = JSON.parse(localStorage.getItem('devrian_business_profile_v4') || '{}');
    profile.showBankDetails = true;
    profile.showUpi = true;
    profile.upiId = '6395171870@ybl';
    profile.bankAccountName = 'Dev Rajpoot';
    profile.bankName = 'State Bank of India';
    profile.bankAccountNumber = '43691322760';
    profile.bankIfsc = 'SBIN0031010';
    localStorage.setItem('devrian_business_profile_v4', JSON.stringify(profile));

    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(doc));
    localStorage.setItem('activeDocument', JSON.stringify(doc));
    const all = JSON.parse(localStorage.getItem('devrian_documents') || '[]');
    all.unshift(doc);
    localStorage.setItem('devrian_documents', JSON.stringify(all));
  });

  await page.reload();
  await page.waitForTimeout(1000);

  const mPages = await page.$$('.a4-page-export');
  console.log(`Rendered ${mPages.length} page(s) for monthly retainer quotation`);
  if (mPages.length >= 2) {
    await mPages[0].screenshot({ path: path.join(OUT_DIR, 'monthly_page1_full.png') });
    await mPages[1].screenshot({ path: path.join(OUT_DIR, 'monthly_page2_full.png') });
    console.log('Saved monthly_page1_full.png and monthly_page2_full.png');
  }

  // Inspect Monthly Columns and Headings:
  const monthlyCheck = await page.evaluate(() => {
    const listTable = document.querySelector('[data-section="quotation-list-table"]');
    const dataTable = document.querySelector('[data-section="quotation-data-table"]');
    const keyValueStrip = document.querySelector('[data-section="quotation-key-value-strip"]');

    const listTableHeaders = listTable ? Array.from(listTable.querySelectorAll('th')).map((th) => th.innerText.trim()) : [];
    const dataTableHeaders = dataTable ? Array.from(dataTable.querySelectorAll('th')).map((th) => th.innerText.trim()) : [];

    return {
      listTableHeaders,
      dataTableHeaders,
      hasKeyValueStrip: Boolean(keyValueStrip),
    };
  });

  console.log('Monthly Table Headers Check:', monthlyCheck);

  // Test 4: Regression Check on Invoice
  console.log('\n--- Test 4: Regression Check on Invoice ---');
  await page.evaluate(() => {
    const doc = {
      id: 'qa-inv-1',
      type: 'invoice',
      documentNumber: 'DEV-INV-2026-001',
      date: '2026-11-10',
      dueDate: '2026-11-20',
      status: 'pending',
      clientName: 'Apex Enterprise',
      clientContactPerson: 'Rohan Sharma',
      clientAddress: 'Connaught Place, New Delhi',
      items: [
        { id: '1', description: 'Full Website Redesign', quantity: 1, rate: 45000, amount: 45000 },
      ],
      subtotal: 45000,
      balanceDue: 45000,
      gstEnabled: false,
      applySignature: true,
      customText: {
        documentTitle: 'INVOICE',
        gstLine: 'GST: Not applicable (not registered under GST).',
      },
      sectionVisibility: {
        showPaymentDetails: true,
        showAmountInWords: true,
        showGstLine: true,
        showTermsAndNotes: true,
        showClosingLine: true,
      },
    };
    const profile = JSON.parse(localStorage.getItem('devrian_business_profile_v4') || '{}');
    profile.showBankDetails = true;
    profile.showUpi = true;
    profile.upiId = '6395171870@ybl';
    profile.bankAccountName = 'Dev Rajpoot';
    profile.bankName = 'State Bank of India';
    profile.bankAccountNumber = '43691322760';
    profile.bankIfsc = 'SBIN0031010';
    localStorage.setItem('devrian_business_profile_v4', JSON.stringify(profile));

    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(doc));
    localStorage.setItem('activeDocument', JSON.stringify(doc));
  });

  await page.reload();
  await page.waitForTimeout(1000);
  const invPages = await page.$$('.a4-page-export');
  if (invPages.length > 0) {
    await invPages[0].screenshot({ path: path.join(OUT_DIR, 'invoice_regression.png') });
    console.log('Saved invoice_regression.png');
  }

  // Test 5: Regression Check on Payment Receipt
  console.log('\n--- Test 5: Regression Check on Payment Receipt ---');
  await page.evaluate(() => {
    const doc = {
      id: 'qa-rec-1',
      type: 'receipt',
      documentNumber: 'DEV-REC-2026-001',
      date: '2026-11-10',
      status: 'paid',
      clientName: 'Apex Enterprise',
      clientContactPerson: 'Rohan Sharma',
      clientAddress: 'Connaught Place, New Delhi',
      items: [
        { id: '1', description: 'Advance Payment Received for Website Redesign', quantity: 1, rate: 22500, amount: 22500 },
      ],
      subtotal: 22500,
      amountReceived: 22500,
      balanceDue: 22500,
      totalProjectCost: 45000,
      advanceReceived: 22500,
      applySignature: true,
      customText: {
        documentTitle: 'PAYMENT RECEIPT',
      },
      sectionVisibility: {
        showPaymentDetails: true,
        showAmountInWords: true,
        showTermsAndNotes: true,
        showClosingLine: true,
      },
    };
    const profile = JSON.parse(localStorage.getItem('devrian_business_profile_v4') || '{}');
    profile.showBankDetails = true;
    profile.showUpi = true;
    profile.upiId = '6395171870@ybl';
    profile.bankAccountName = 'Dev Rajpoot';
    profile.bankName = 'State Bank of India';
    profile.bankAccountNumber = '43691322760';
    profile.bankIfsc = 'SBIN0031010';
    localStorage.setItem('devrian_business_profile_v4', JSON.stringify(profile));

    localStorage.setItem('devrian_active_draft_v4', JSON.stringify(doc));
    localStorage.setItem('activeDocument', JSON.stringify(doc));
  });

  await page.reload();
  await page.waitForTimeout(1000);
  const recPages = await page.$$('.a4-page-export');
  if (recPages.length > 0) {
    await recPages[0].screenshot({ path: path.join(OUT_DIR, 'receipt_regression.png') });
    console.log('Saved receipt_regression.png');
  }

  await browser.close();
  console.log('\n=== ALL QA TESTS COMPLETED SUCCESSFULLY! ===');
}

runQA().catch((err) => {
  console.error('QA Script failed with error:', err);
  process.exit(1);
});
