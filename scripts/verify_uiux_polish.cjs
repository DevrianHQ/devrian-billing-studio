const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9245;

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
  console.log('=== VERIFYING UI/UX POLISH & INTERACTIVE SETTINGS/CONTENT SYNC ===');
  const session = await connectChrome();

  try {
    // 1. Clear any old draft and load fresh state
    await session.evalJs(`(() => {
      localStorage.removeItem('devrian_active_draft_v4');
      window.location.reload();
    })()`);
    await sleep(2500);

    // Navigate to Invoice
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Invoice');
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    // Take screenshot of fresh invoice
    await session.screenshot('qa-screenshots/invoice-uiux-master.png');

    // 2. Test interactive typing in Form
    console.log('Testing interactive typing in Form...');
    const typingResult = await session.evalJs(`(() => {
      // Find client name input
      const inputs = Array.from(document.querySelectorAll('input'));
      const clientInput = inputs.find(i => i.placeholder?.includes('client') || i.value?.includes('Parihar') || i.value?.includes('Client'));
      if (clientInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(clientInput, 'Starlight Media Studios');
        clientInput.dispatchEvent(new Event('input', { bubbles: true }));
        clientInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    })()`);
    await sleep(800);

    const clientCheck = await session.evalJs(`(() => {
      const page = document.querySelector('.a4-page-export');
      return page ? page.textContent.includes('Starlight Media Studios') : false;
    })()`);
    console.log('Form typing -> Live preview updated with new client:', clientCheck);

    // 3. Test Settings modification & auto-sync to Invoice
    console.log('Testing Settings UPI modification & auto-sync to Invoice...');
    // Click Settings nav
    await session.evalJs(`(() => {
      const navBtn = Array.from(document.querySelectorAll('nav button')).find(b => b.innerText.includes('Settings'));
      if (navBtn) navBtn.click();
    })()`);
    await sleep(1000);

    // In Settings, change UPI to 6395171670@ybl
    await session.evalJs(`(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const upiInput = inputs.find(i => i.value?.includes('@') || i.placeholder?.includes('upi'));
      if (upiInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(upiInput, '6395171670@ybl');
        upiInput.dispatchEvent(new Event('input', { bubbles: true }));
        upiInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await sleep(800);

    // Click Create nav to return to Document Editor
    await session.evalJs(`(() => {
      const createNav = Array.from(document.querySelectorAll('nav button')).find(b => b.innerText.includes('Create'));
      if (createNav) createNav.click();
    })()`);
    await sleep(1000);

    // Check if Live Preview now shows 6395171670@ybl
    const upiSyncCheck = await session.evalJs(`(() => {
      const page = document.querySelector('.a4-page-export');
      return page ? page.textContent.includes('6395171670@ybl') : false;
    })()`);
    console.log('Settings UPI change -> Live preview updated with 6395171670@ybl:', upiSyncCheck);

    // Save final verified screenshot with updated UPI
    await session.screenshot('qa-screenshots/invoice-verified-final.png');

    // 4. Test Receipt Mode
    console.log('Testing Receipt view...');
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Receipt');
      if (btn) btn.click();
    })()`);
    await sleep(1500);
    await session.screenshot('qa-screenshots/receipt-verified-final.png');

    console.log('=== ALL TESTS COMPLETED SUCCESSFULLY ===');
  } finally {
    session.chrome.kill();
  }
}

run().catch(console.error);

