const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9254;

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
    const result = await evalJs(`(async () => {
      const el = document.querySelector('.a4-page-export');
      const parent = el.parentElement;
      const oldTransform = parent.style.transform;
      parent.style.transform = 'none';
      await new Promise(r => setTimeout(r, 60));

      const canvas = await window.html2canvas(el, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Save a sample image
      const imgData = canvas.toDataURL('image/png');
      parent.style.transform = oldTransform;

      return {
        width: canvas.width,
        height: canvas.height,
        dataLength: imgData.length
      };
    })()`);

    console.log('Result with transform = none at scale 3:', result);

  } finally {
    chrome.kill();
  }
}

run().catch(console.error);
