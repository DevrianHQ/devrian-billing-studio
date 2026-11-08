const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9258;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testExportFidelity() {
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
    console.log('Testing live export with html-to-image engine...');

    // Trigger the Download PDF button
    const res = await evalJs(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (btn) {
        btn.click();
        return { clicked: true };
      }
      return { error: 'No button' };
    })()`);
    console.log('Download button click:', res);

    await sleep(4000);

    // Check toast
    const toast = await evalJs(`(() => {
      const t = Array.from(document.querySelectorAll('*')).find(el => el.textContent && el.textContent.includes('PDF downloaded successfully'));
      return Boolean(t);
    })()`);
    console.log('PDF Download success toast:', toast);

  } finally {
    chrome.kill();
  }
}

testExportFidelity().catch(console.error);

