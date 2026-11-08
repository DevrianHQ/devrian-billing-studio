const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9252;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testCurrentPdfExport() {
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
    // Check what happens inside html2canvas capture right now
    const evaluation = await evalJs(`(async () => {
      const el = document.querySelector('.a4-page-export');
      if (!el) return { error: 'No .a4-page-export found' };
      
      const parent = el.parentElement;
      const zoomTransform = parent ? parent.style.transform : 'none';

      // Capture image data URL using html2canvas
      const canvas = await window.html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        zoomTransform,
        dataUrlPrefix: canvas.toDataURL('image/png').slice(0, 50)
      };
    })()`);

    console.log('Evaluation result:', evaluation);

  } finally {
    chrome.kill();
  }
}

testCurrentPdfExport().catch(console.error);

