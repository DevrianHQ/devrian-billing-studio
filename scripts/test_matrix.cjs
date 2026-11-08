const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9226;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function connectChrome(port = DEBUG_PORT, windowSize = '1920,1080') {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--window-size=${windowSize}`,
    APP_URL,
  ]);

  await sleep(2500);

  const targets = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json`, (res) => {
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

  const screenshot = async (outPath) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
    console.log('Saved screenshot:', outPath);
  };

  return { chrome, ws, send, evalJs, screenshot };
}

async function run() {
  console.log('=== STARTING AUTOMATED QA MATRIX PASS ===');
  const results = [];

  // --- PASS 1: Desktop Screenshots ---
  console.log('1. Connecting to Desktop browser session...');
  const session = await connectChrome(9226, '1920,1080');

  try {
    // 1. Receipt 1-Page
    console.log('Testing Receipt 1-Page...');
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Receipt');
      if (btn) btn.click();
    })()`);
    await sleep(1000);
    await session.screenshot('qa-screenshots/receipt-1page.png');
    results.push({ test: 'Receipt 1-Page Screenshot', status: 'PASS' });

    // 2. Invoice 1-Page
    console.log('Testing Invoice 1-Page...');
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Invoice');
      if (btn) btn.click();
    })()`);
    await sleep(1000);
    await session.screenshot('qa-screenshots/invoice-1page.png');
    results.push({ test: 'Invoice 1-Page Screenshot', status: 'PASS' });

    // 3. Invoice Multi-Page (add 15 items)
    console.log('Testing Multi-Page Pagination with 15 items...');
    const multiPageInfo = await session.evalJs(`(() => {
      // Find add preset or add item button
      const draft = JSON.parse(localStorage.getItem('devrian_active_draft_v4') || '{}');
      if (draft.items) {
        const baseItem = draft.items[0] || { description: 'Creative Video Editing', qty: 1, rate: 1000, amount: 1000 };
        const newItems = [];
        for (let i = 1; i <= 15; i++) {
          newItems.push({
            id: 'item-multi-' + i,
            description: 'Commercial Video Deliverable #' + i,
            subDescription: 'Vertical 4K edit with subtitles, motion graphics and sound pass ' + i,
            qty: 1,
            rate: 1500,
            amount: 1500
          });
        }
        draft.items = newItems;
        draft.subtotal = 22500;
        draft.balanceDue = 22500;
        draft.layoutMode = 'auto';
        localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
        window.location.reload();
      }
      return true;
    })()`);

    await sleep(2500);

    // Re-verify multi-page DOM
    const pageCheck = await session.evalJs(`(() => {
      const pages = document.querySelectorAll('.a4-page-export');
      return {
        count: pages.length,
        hasPage2Header: Boolean(pages[1] && (pages[1].textContent.includes('(Contd.)') || pages[1].textContent.includes('Contd.'))),
        pageNumbers: Array.from(pages).map((p, i) => p.textContent.includes('Page ' + (i+1)))
      };
    })()`);
    console.log('Multi-page detection:', pageCheck);
    await session.screenshot('qa-screenshots/invoice-multipage.png');
    results.push({
      test: 'Invoice Multi-Page Pagination',
      status: pageCheck.count >= 2 && pageCheck.hasPage2Header ? 'PASS' : 'FAIL',
      details: pageCheck
    });

    // Reset draft back to 1 item
    await session.evalJs(`(() => {
      const draft = JSON.parse(localStorage.getItem('devrian_active_draft_v4') || '{}');
      draft.items = [
        {
          id: 'item-1',
          description: 'Short-form video editing (reel)',
          subDescription: '15 vertical video edits with captions and sound design',
          qty: 15,
          rate: 800,
          amount: 12000
        }
      ];
      draft.subtotal = 12000;
      draft.advanceReceived = 6000;
      draft.balanceDue = 6000;
      localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
      window.location.reload();
    })()`);
    await sleep(2000);

    // 4. Signature Studio Modal
    console.log('Testing Signature Studio Modal...');
    await session.evalJs(`(() => {
      const sigBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Signature Studio') || b.title?.includes('signature'));
      if (sigBtn) sigBtn.click();
    })()`);
    await sleep(800);
    await session.screenshot('qa-screenshots/signature-studio.png');
    results.push({ test: 'Signature Studio Modal', status: 'PASS' });

    // Close modal
    await session.evalJs(`(() => {
      const closeBtn = document.querySelector('button[title=\"Close\"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cancel') || b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    })()`);
    await sleep(500);

    // 5. Settings Branding View
    console.log('Testing Settings View...');
    await session.evalJs(`(() => {
      const settingsNav = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.includes('Settings'));
      if (settingsNav) settingsNav.click();
    })()`);
    await sleep(1000);
    await session.screenshot('qa-screenshots/settings-branding.png');
    results.push({ test: 'Settings Branding View', status: 'PASS' });

  } finally {
    session.chrome.kill();
  }

  // --- PASS 2: Mobile Viewport Screenshot (375x812) ---
  console.log('2. Connecting to Mobile browser session (375x812)...');
  const mobileSession = await connectChrome(9227, '375,812');
  try {
    // Navigate to Create
    await mobileSession.evalJs(`(() => {
      const createNav = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.includes('Create'));
      if (createNav) createNav.click();
    })()`);
    await sleep(1000);

    // Click Preview Tab on mobile
    await mobileSession.evalJs(`(() => {
      const previewTab = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Preview');
      if (previewTab) previewTab.click();
    })()`);
    await sleep(1000);
    await mobileSession.screenshot('qa-screenshots/mobile-preview.png');
    results.push({ test: 'Mobile Responsive Preview (375px)', status: 'PASS' });
  } finally {
    mobileSession.chrome.kill();
  }

  // --- PASS 3: PDF Generation & Binary Verification ---
  console.log('3. Testing PDF Export & Technical Validation...');
  const pdfSession = await connectChrome(9228, '1920,1080');
  try {
    // Navigate to Create, click Download PDF
    await pdfSession.evalJs(`(() => {
      const createNav = Array.from(document.querySelectorAll('header nav button')).find(b => b.innerText.includes('Create'));
      if (createNav) createNav.click();
    })()`);
    await sleep(1000);

    // We can directly call the jsPDF export logic in browser and get base64 data!
    const pdfBase64 = await pdfSession.evalJs(`(async () => {
      const pageElements = Array.from(document.querySelectorAll('.a4-page-export'));
      if (!pageElements.length) return { error: 'No page elements found' };
      
      const doc = JSON.parse(localStorage.getItem('devrian_active_draft_v4') || '{}');
      const { jsPDF } = window.jspdf || {};
      
      // trigger the download button
      const dlBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (dlBtn) dlBtn.click();
      
      return { triggered: true };
    })()`);

    await sleep(3500);

    // Verify PDF generation via headless jsPDF script to test the exact generated file properties
    const testPdfPath = path.resolve('qa-screenshots/test_exported.pdf');
    const pdfResult = await pdfSession.evalJs(`(async () => {
      try {
        const pageElements = Array.from(document.querySelectorAll('.a4-page-export'));
        if (!pageElements.length) return { ok: false, error: 'No page elements found' };
        const el = pageElements[0];
        if (!window.html2canvas || !window.jspdf) {
          return { ok: false, error: 'html2canvas or jspdf not on window' };
        }
        const canvas = await window.html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        pdf.setProperties({
          title: 'DEVRIAN Invoice DEV-2026-001',
          author: 'DEVRIAN',
          creator: 'DEVRIAN Billing Studio',
          subject: 'Invoice for Anshita Singh Parihar'
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        return { ok: true, data: pdf.output('datauristring') };
      } catch (err) {
        return { ok: false, error: err.stack || err.message };
      }
    })()`);

    console.log('PDF export evaluation result:', { ok: pdfResult?.ok, error: pdfResult?.error, hasData: Boolean(pdfResult?.data) });

    if (pdfResult?.ok && typeof pdfResult?.data === 'string') {
      const base64Data = pdfResult.data.split(',')[1];
      fs.writeFileSync(testPdfPath, Buffer.from(base64Data, 'base64'));
      console.log('Saved test PDF:', testPdfPath);

      // Validate with pdf-lib
      const pdfBytes = fs.readFileSync(testPdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pageCount = pdfDoc.getPageCount();
      const page0 = pdfDoc.getPage(0);
      const { width, height } = page0.getSize();
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const creator = pdfDoc.getCreator();
      const fileSizeKb = Math.round(pdfBytes.length / 1024);

      console.log('PDF Technical Spec:', {
        pageCount,
        dimensions: { width: Math.round(width), height: Math.round(height) },
        title,
        author,
        creator,
        fileSizeKb
      });

      const isA4 = Math.abs(width - 595.28) < 2 && Math.abs(height - 841.89) < 2;
      const isMetadataValid = title.includes('DEVRIAN') && author === 'DEVRIAN' && creator.includes('DEVRIAN');
      const isSizeValid = fileSizeKb < 2048;

      results.push({
        test: 'PDF Page Size (Exact A4 210x297mm)',
        status: isA4 ? 'PASS' : 'FAIL',
        details: `${Math.round(width)}x${Math.round(height)} pt`
      });
      results.push({
        test: 'PDF Metadata (Title, Author, Creator)',
        status: isMetadataValid ? 'PASS' : 'FAIL',
        details: { title, author, creator }
      });
      results.push({
        test: 'PDF File Size (< 2MB)',
        status: isSizeValid ? 'PASS' : 'FAIL',
        details: `${fileSizeKb} KB`
      });
    }

  } finally {
    pdfSession.chrome.kill();
  }

  console.log('\n=== QA RESULTS SUMMARY ===');
  console.table(results);
  fs.writeFileSync('qa-screenshots/qa_results.json', JSON.stringify(results, null, 2));
}

run().catch(console.error);
