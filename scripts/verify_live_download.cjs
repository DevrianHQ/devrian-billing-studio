const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9255;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('Testing live PDF export fidelity...');
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
    // Click Download PDF and check export toast
    const clickResult = await evalJs(`(() => {
      const dlBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Download PDF'));
      if (!dlBtn) return { error: 'No Download PDF button' };
      dlBtn.click();
      return { clicked: true };
    })()`);
    console.log('Clicked Download PDF:', clickResult);

    await sleep(3500);

    const toastCheck = await evalJs(`(() => {
      const toast = Array.from(document.querySelectorAll('div, span')).find(el => el.textContent && el.textContent.includes('PDF downloaded successfully'));
      return { toastFound: Boolean(toast), text: toast ? toast.textContent : '' };
    })()`);
    console.log('Toast check after download:', toastCheck);

    // Save screenshot of the screen to verify preview was restored without jump
    const screenRes = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('qa-screenshots/preview-after-pdf-download.png', Buffer.from(screenRes.data, 'base64'));
    console.log('Saved screenshot of screen after export: qa-screenshots/preview-after-pdf-download.png');

  } finally {
    chrome.kill();
  }
}

run().catch(console.error);

