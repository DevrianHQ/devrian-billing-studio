const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function captureInvoice(url, outPath, port) {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--window-size=1920,1080',
    url
  ]);

  await new Promise(r => setTimeout(r, 2000));
  
  const targets = await new Promise(resolve => {
    http.get(`http://127.0.0.1:${port}/json`, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    });
  });

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve));

  // Click Invoice tab
  const clickExpr = "(() => { const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Invoice'); if (btn) btn.click(); })()";
  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: clickExpr }
  }));

  await new Promise(r => setTimeout(r, 1200));

  // Capture screenshot via Page.captureScreenshot
  ws.send(JSON.stringify({ id: 2, method: 'Page.captureScreenshot', params: { format: 'png' } }));

  const data = await new Promise(resolve => {
    ws.addEventListener('message', e => {
      const res = JSON.parse(e.data);
      if (res.id === 2) resolve(res.result.data);
    });
  });

  fs.writeFileSync(outPath, Buffer.from(data, 'base64'));
  console.log('Saved ' + outPath);
  chrome.kill();
}

async function run() {
  await captureInvoice('http://localhost:4173/', 'C:/Users/neela/.gemini/antigravity/brain/3cb6c773-e8f4-4eeb-838f-e2da43f8b827/live_4173_invoice.png', 9224);
  await captureInvoice('http://localhost:5173/', 'C:/Users/neela/.gemini/antigravity/brain/3cb6c773-e8f4-4eeb-838f-e2da43f8b827/live_5173_invoice.png', 9225);
}

run();

