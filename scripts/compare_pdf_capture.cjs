const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9256;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function renderCanvasComparison() {
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
    // 1. First capture actual DOM screenshot of .a4-page-export element using Chrome's native CDP clip!
    const domClip = await evalJs(`(() => {
      const el = document.querySelector('.a4-page-export');
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height, scale: 1 };
    })()`);
    console.log('DOM Clip Rect:', domClip);

    const domScreen = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: domClip.x, y: domClip.y, width: domClip.width, height: domClip.height, scale: 1 }
    });
    fs.writeFileSync('qa-screenshots/dom_actual_preview.png', Buffer.from(domScreen.data, 'base64'));
    console.log('Saved actual DOM preview screenshot: qa-screenshots/dom_actual_preview.png');

    // 2. Now run html2canvas on that exact element and export its dataURL to disk
    const h2cData = await evalJs(`(async () => {
      const el = document.querySelector('.a4-page-export');
      const parent = el.parentElement;
      const oldTransform = parent.style.transform;
      parent.style.transform = 'none';
      await new Promise(r => setTimeout(r, 80));

      const canvas = await window.html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      parent.style.transform = oldTransform;
      return canvas.toDataURL('image/png');
    })()`);

    const base64Data = h2cData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('qa-screenshots/html2canvas_captured.png', Buffer.from(base64Data, 'base64'));
    console.log('Saved html2canvas capture: qa-screenshots/html2canvas_captured.png');

  } finally {
    chrome.kill();
  }
}

renderCanvasComparison().catch(console.error);

