const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9260;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
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

  try {
    // 1. Switch to Receipt
    await evalJs(`(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Receipt');
      if (b) b.click();
    })()`);
    await sleep(1000);

    // 2. Click Download PDF
    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (btn) btn.click();
    })()`);
    console.log('Clicked Download PDF for Receipt');

    await sleep(3500);

    // 3. Extract the PNG dataUrl from window.__lastExportedPng
    const pngDataUrl = await evalJs(`window.__lastExportedPng`);
    if (pngDataUrl) {
      const base64 = pngDataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync('qa-screenshots/final_receipt_pdf_image.png', Buffer.from(base64, 'base64'));
      console.log('Saved exact PDF image for Receipt: qa-screenshots/final_receipt_pdf_image.png');
    } else {
      console.log('No __lastExportedPng found');
    }

    // 4. Switch to Invoice & click Download PDF
    await evalJs(`(() => {
      const b = Array.from(document.querySelectorAll('button')).find(x => x.innerText.trim() === 'Invoice');
      if (b) b.click();
    })()`);
    await sleep(1000);

    await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (btn) btn.click();
    })()`);
    console.log('Clicked Download PDF for Invoice');

    await sleep(3500);

    const invoicePngDataUrl = await evalJs(`window.__lastExportedPng`);
    if (invoicePngDataUrl) {
      const base64 = invoicePngDataUrl.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync('qa-screenshots/final_invoice_pdf_image.png', Buffer.from(base64, 'base64'));
      console.log('Saved exact PDF image for Invoice: qa-screenshots/final_invoice_pdf_image.png');
    }

  } finally {
    chrome.kill();
  }
}

run().catch(console.error);

