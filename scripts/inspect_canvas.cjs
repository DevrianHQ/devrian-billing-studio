const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9250;

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

async function testExportCanvas() {
  const session = await connectChrome();
  try {
    console.log('Testing html2canvas capture from live preview...');
    
    // Evaluate capture of .a4-page-export using html2canvas directly in the page
    const captureData = await session.evalJs(`(async () => {
      const el = document.querySelector('.a4-page-export');
      if (!el) return { error: 'No .a4-page-export found' };

      // Check current zoom/transform on parent
      const parent = el.parentElement;
      const parentTransform = window.getComputedStyle(parent).transform;
      const elRect = el.getBoundingClientRect();

      // Test html2canvas capture as it currently runs in pdfExport.ts
      const canvas = await window.html2canvas ? window.html2canvas(el) : null;
      
      return {
        parentTransform,
        elRect: { width: elRect.width, height: elRect.height, left: elRect.left, top: elRect.top },
        hasHtml2Canvas: typeof html2canvas !== 'undefined'
      };
    })()`);
    console.log('Capture data from browser:', captureData);

  } finally {
    session.chrome.kill();
  }
}

testExportCanvas().catch(console.error);

