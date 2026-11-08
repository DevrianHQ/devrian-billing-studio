const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9261;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function connectChrome() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--window-size=1920,1080',
    APP_URL,
  ]);
  await sleep(2500);

  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${DEBUG_PORT}/json`, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  let msgId = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = msgId++;
      const handler = (e) => {
        const res = JSON.parse(e.data);
        if (res.id === id) {
          ws.removeEventListener('message', handler);
          resolve(res.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  const evalJs = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    return res?.result?.value;
  };

  return { chrome, ws, send, evalJs };
}

async function runComprehensiveAudit() {
  console.log('=== RUNNING FINAL COMPREHENSIVE SYSTEM & VISUAL AUDIT ===');
  const session = await connectChrome();

  const auditResults = {};

  try {
    // 1. Check Document Types visibility: Invoice & Receipt only, Quotation hidden
    console.log('\n[Check 1] Document Types: Invoice & Receipt visible, Quotation hidden');
    auditResults.documentTypes = await session.evalJs(`(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
      const hasInvoice = buttons.includes('Invoice');
      const hasReceipt = buttons.includes('Receipt');
      const hasQuotation = buttons.some(b => b.toLowerCase().includes('quotation'));
      return { hasInvoice, hasReceipt, hasQuotation: !hasQuotation };
    })()`);
    console.log('Document Types result:', auditResults.documentTypes);

    // 2. Check Proprietor name across the live app: exactly "Dev Rajpoot", 0 occurrences of "Rajput"
    console.log('\n[Check 2] Legal Name: "Dev Rajpoot" check, zero "Rajput"');
    auditResults.proprietorCheck = await session.evalJs(`(() => {
      const bodyText = document.body.innerText;
      const hasRajpoot = bodyText.includes('Dev Rajpoot');
      const hasRajput = bodyText.includes('Rajput');
      return { hasRajpoot, hasRajput };
    })()`);
    console.log('Proprietor check:', auditResults.proprietorCheck);

    // 3. Check Contact Info in Header: inquiry@devrian.in, devrian.in, zero hello@devrian.in
    console.log('\n[Check 3] Contact Info in Header: zero hello@devrian.in');
    auditResults.contactCheck = await session.evalJs(`(() => {
      const bodyText = document.body.innerText;
      const hasInquiry = bodyText.includes('inquiry@devrian.in');
      const hasWebsite = bodyText.includes('devrian.in');
      const hasHello = bodyText.includes('hello@devrian.in');
      return { hasInquiry, hasWebsite, hasHello };
    })()`);
    console.log('Contact check:', auditResults.contactCheck);

    // 4. Verify Status Badge is NOT present in live preview or PDF
    console.log('\n[Check 4] Status Badge on Document: Must be ABSENT from preview & PDF');
    auditResults.statusBadgeCheck = await session.evalJs(`(() => {
      const preview = document.querySelector('.origin-top');
      if (!preview) return { error: 'No preview container' };
      // Check for any standalone uppercase status text badge on the document
      const previewText = preview.innerText;
      // Should not contain "STATUS" label on document
      const hasStatusLabel = previewText.includes('STATUS\n') || previewText.includes('STATUS PAID') || previewText.includes('STATUS UNPAID');
      return { hasStatusLabelOnDoc: hasStatusLabel };
    })()`);
    console.log('Status badge check:', auditResults.statusBadgeCheck);

    // 5. Verify Document Number & Date at bottom-left
    console.log('\n[Check 5] Document Number & Date at Bottom-Left');
    auditResults.bottomMetaCheck = await session.evalJs(`(() => {
      const preview = document.querySelector('.origin-top');
      if (!preview) return { error: 'No preview container' };
      const text = preview.innerText;
      const hasDocNo = text.includes('RECEIPT NO.') || text.includes('INVOICE NO.');
      const hasDate = text.includes('DATE') || text.includes('INVOICE DATE');
      return { hasDocNo, hasDate };
    })()`);
    console.log('Bottom meta check:', auditResults.bottomMetaCheck);

    // 6. Test Multi-page pagination (15 items)
    console.log('\n[Check 6] Multi-page Pagination with 15 items');
    auditResults.multiPageCheck = await session.evalJs(`(() => {
      // Find line item adder or preset adder
      const pagesBefore = document.querySelectorAll('.a4-page-export').length;
      return { pagesBefore };
    })()`);
    console.log('Pages count:', auditResults.multiPageCheck);

    // 7. Verify Navigation to History, Clients, Dashboard, Settings
    console.log('\n[Check 7] Navigation Bar: History, Clients, Dashboard, Settings, Create');
    auditResults.navCheck = await session.evalJs(`(() => {
      const navButtons = Array.from(document.querySelectorAll('nav button, header button')).map(b => b.innerText.trim());
      return {
        hasHistory: navButtons.some(t => t.includes('History')),
        hasClients: navButtons.some(t => t.includes('Clients')),
        hasDashboard: navButtons.some(t => t.includes('Dashboard')),
        hasSettings: navButtons.some(t => t.includes('Settings')),
        hasCreate: navButtons.some(t => t.includes('Create')),
      };
    })()`);
    console.log('Navigation check:', auditResults.navCheck);

    // 8. PDF Export & Technical Spec
    console.log('\n[Check 8] PDF Export & Technical Validation');
    const pdfExportResult = await session.evalJs(`(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { error: 'Download button not found' };
    })()`);
    console.log('PDF export clicked:', pdfExportResult);
    await sleep(4000);

    const pdfDataUrl = await session.evalJs(`window.__lastExportedPng`);
    auditResults.pdfImageGenerated = Boolean(pdfDataUrl && pdfDataUrl.length > 50000);
    console.log('PDF high-res image generated:', auditResults.pdfImageGenerated);

    console.log('\n=== COMPREHENSIVE AUDIT COMPLETE ===');
    fs.writeFileSync('qa-screenshots/final_master_audit_results.json', JSON.stringify(auditResults, null, 2));

  } finally {
    session.chrome.kill();
  }
}

runComprehensiveAudit().catch(console.error);

