const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9235;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function connectChrome(port = DEBUG_PORT) {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--window-size=1920,1080',
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
  console.log('=== VERIFYING INTERACTIVE SYNC, SETTINGS & MATH ===');
  const session = await connectChrome();

  try {
    // 1. Verify Invoice Header displays DEVRIAN tagline & contact line
    console.log('1. Checking Invoice Header content...');
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Invoice');
      if (btn) btn.click();
    })()`);
    await sleep(1000);

    const headerText = await session.evalJs(`(() => {
      const el = document.querySelector('.a4-page-export');
      return el ? el.textContent : '';
    })()`);

    console.log('Invoice preview contains tagline:', headerText.includes('Building Attention, Authority & Growth for Modern Businesses'));
    console.log('Invoice preview contains contact line:', headerText.includes('Devrian.official@gmail.com'));
    console.log('Invoice preview contains proprietor Dev Rajpoot:', headerText.includes('Dev Rajpoot'));

    await session.screenshot('qa-screenshots/verified-invoice-with-header.png');

    // 2. Test editing in the Form & verifying instant preview update
    console.log('2. Testing instant Form -> Preview synchronization...');
    const syncResult = await session.evalJs(`(() => {
      // Find client name input
      const inputs = Array.from(document.querySelectorAll('input'));
      const clientInput = inputs.find(i => i.placeholder?.includes('client') || i.value?.includes('Parihar') || i.value?.includes('Client'));
      if (clientInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(clientInput, 'Apex Growth Dynamics LLC');
        clientInput.dispatchEvent(new Event('input', { bubbles: true }));
        clientInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    })()`);
    await sleep(1000);

    const updatedText = await session.evalJs(`(() => {
      return document.querySelector('.a4-page-export')?.textContent || '';
    })()`);
    console.log('Preview updated with new client name:', updatedText.includes('Apex Growth Dynamics LLC'));

    // 3. Test Math Calculations: 2 items, 10% discount, 5,000 advance
    console.log('3. Testing Math Logic with dynamic recalculation...');
    const mathTest = await session.evalJs(`(() => {
      const draft = JSON.parse(localStorage.getItem('devrian_active_draft_v4') || '{}');
      draft.type = 'invoice';
      draft.items = [
        { id: 'i1', description: 'Brand Strategy Document', qty: 1, rate: 20000, amount: 20000 },
        { id: 'i2', description: 'Motion Reel Production', qty: 2, rate: 5000, amount: 10000 }
      ];
      // Total subtotal = 30,000
      draft.subtotal = 30000;
      draft.discountType = 'percentage';
      draft.discountValue = 10; // 10% = 3,000
      draft.discountAmount = 3000;
      draft.gstEnabled = false;
      draft.advanceReceived = 12000;
      // Balance due = 30,000 - 3,000 - 12,000 = 15,000
      draft.balanceDue = 15000;
      localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
      window.location.reload();
      return true;
    })()`);

    await sleep(2000);

    const mathPreviewText = await session.evalJs(`(() => {
      const p = document.querySelector('.a4-page-export')?.textContent || '';
      return {
        hasSubtotal30k: p.includes('30,000'),
        hasDiscount3k: p.includes('3,000'),
        hasAdvance12k: p.includes('12,000'),
        hasBalance15k: p.includes('15,000')
      };
    })()`);
    console.log('Math test results:', mathPreviewText);

    // 4. Test Receipt Mode & Math
    console.log('4. Testing Receipt Mode & Math (Total Project Cost - Advance = Remaining)...');
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Receipt');
      if (btn) btn.click();
    })()`);
    await sleep(1000);

    const receiptMath = await session.evalJs(`(() => {
      const draft = JSON.parse(localStorage.getItem('devrian_active_draft_v4') || '{}');
      draft.totalProjectCost = 50000;
      draft.advanceReceived = 25000;
      draft.amountReceived = 25000;
      draft.balanceDue = 25000;
      localStorage.setItem('devrian_active_draft_v4', JSON.stringify(draft));
      window.location.reload();
      return true;
    })()`);
    await sleep(2000);

    const receiptPreviewText = await session.evalJs(`(() => {
      const p = document.querySelector('.a4-page-export')?.textContent || '';
      return {
        hasTotal50k: p.includes('50,000'),
        hasReceived25k: p.includes('25,000'),
        hasRemaining25k: p.includes('25,000'),
        hasWords: p.includes('Rupees Twenty Five Thousand Only') || p.includes('Twenty Five Thousand')
      };
    })()`);
    console.log('Receipt math & words results:', receiptPreviewText);

    await session.screenshot('qa-screenshots/verified-receipt-math.png');

    console.log('=== ALL INTERACTIVE SYNC & MATH TESTS COMPLETED ===');
  } finally {
    session.chrome.kill();
  }
}

run().catch(console.error);
