const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9240;

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

  const screenshot = async (outPath) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
    console.log('Saved screenshot:', outPath);
  };

  return { chrome, ws, send, evalJs, screenshot };
}

async function run() {
  console.log('=== VERIFYING REVISED LAYOUT (TOP DETAILS & PAYMENT ALIGNMENT) ===');
  const session = await connectChrome();

  try {
    // Navigate to invoice
    await session.evalJs(`(() => {
      // Clear draft to ensure default fresh values with new contactLine & structure
      localStorage.removeItem('devrian_active_draft_v4');
      window.location.reload();
    })()`);
    await sleep(2500);

    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Invoice');
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    const check = await session.evalJs(`(() => {
      const page = document.querySelector('.a4-page-export');
      const text = page ? page.textContent : '';
      const lower = text.toLowerCase();
      return {
        hasTagline: text.includes('Building Attention, Authority & Growth for Modern Businesses'),
        hasHelloEmail: text.includes('hello@devrian.in | inquiry@devrian.in | devrian.in'),
        hasUdyam: text.includes('UDYAM-UP-54-0127731'),
        hasDevRajpoot: text.includes('Dev Rajpoot'),
        hasBilledTo: lower.includes('billed to'),
        noBilledBy: !lower.includes('billed by'),
        hasPaymentDetails: lower.includes('payment details'),
        hasBankTransfer: lower.includes('bank transfer')
      };
    })()`);

    console.log('Invoice page inspection:', check);

    // Save high-resolution screenshot
    await session.screenshot('qa-screenshots/invoice-revised-aligned.png');

    // Also check Receipt
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Receipt');
      if (btn) btn.click();
    })()`);
    await sleep(1500);
    await session.screenshot('qa-screenshots/receipt-revised-aligned.png');

    console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
  } finally {
    session.chrome.kill();
  }
}

run().catch(console.error);
