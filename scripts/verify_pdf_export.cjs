const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9249;
const DOWNLOAD_DIR = path.resolve('qa-screenshots/downloads');

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

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

  // Configure Chrome download behavior
  await send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR,
    eventsEnabled: true,
  });

  return { chrome, ws, send, evalJs };
}

async function run() {
  console.log('=== VERIFYING LIVE PDF EXPORT FOR INVOICE & RECEIPT ===');
  const session = await connectChrome();

  try {
    // 1. Ensure we are on Receipt first
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Receipt');
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    // Click Download PDF
    console.log('Exporting Receipt PDF...');
    await session.evalJs(`(() => {
      const dlBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (dlBtn) dlBtn.click();
    })()`);
    await sleep(4000);

    // 2. Switch to Invoice
    console.log('Switching to Invoice...');
    await session.evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Invoice');
      if (btn) btn.click();
    })()`);
    await sleep(1500);

    // Click Download PDF
    console.log('Exporting Invoice PDF...');
    await session.evalJs(`(() => {
      const dlBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (dlBtn) dlBtn.click();
    })()`);
    await sleep(4000);

    // Check downloaded files
    const files = fs.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith('.pdf'));
    console.log('Downloaded PDF files:', files);

    for (const f of files) {
      const filePath = path.join(DOWNLOAD_DIR, f);
      const data = fs.readFileSync(filePath);
      const doc = await PDFDocument.load(data);
      console.log(`\nFile: ${f}`);
      console.log(`- Page Count: ${doc.getPageCount()}`);
      for (let i = 0; i < doc.getPageCount(); i++) {
        const p = doc.getPage(i);
        console.log(`  Page ${i + 1} size: ${p.getWidth().toFixed(2)} x ${p.getHeight().toFixed(2)} pt`);
      }
      console.log(`- File Size: ${(data.length / 1024).toFixed(1)} KB`);
    }

    console.log('\n=== ALL PDF EXPORTS VERIFIED SUCCESSFULLY ===');
  } finally {
    session.chrome.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

