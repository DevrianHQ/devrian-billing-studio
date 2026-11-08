const http = require('http');
const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=1920,1080',
  'http://localhost:5173/'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const targets = JSON.parse(data);
      const wsUrl = targets[0].webSocketDebuggerUrl;
      const ws = new WebSocket(wsUrl);
      ws.addEventListener('open', () => {
        // First click the Invoice button if needed
        const expr = `(() => {
          // find invoice tab button
          const invBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Invoice');
          if (invBtn) invBtn.click();
          
          return new Promise(resolve => {
            setTimeout(() => {
              const page = document.querySelector('.a4-page-export');
              if (!page) return resolve({ error: 'No .a4-page-export found' });
              const pageRect = page.getBoundingClientRect();
              
              const elements = [];
              for (const el of page.querySelectorAll('*')) {
                const r = el.getBoundingClientRect();
                const text = (el.innerText || '').slice(0, 30).trim().replace(/\\s+/g, ' ');
                if (['INVOICE', 'PAYMENT DETAILS', 'NOTE', 'TERMS & NOTES', 'BALANCE DUE', 'STATUS', 'BILLED BY', 'DEVRIAN |', 'Dev Rajpoot'].some(k => text.includes(k))) {
                  elements.push({
                    text,
                    top: Math.round(r.top - pageRect.top),
                    height: Math.round(r.height),
                    bottom: Math.round(r.bottom - pageRect.top)
                  });
                }
              }
              resolve({
                pageHeight: Math.round(pageRect.height),
                pageScrollHeight: page.scrollHeight,
                elements
              });
            }, 500);
          });
        })()`;
        
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: { expression: expr, awaitPromise: true, returnByValue: true }
        }));
      });
      ws.addEventListener('message', (event) => {
        const res = JSON.parse(event.data);
        if (res.id === 1) {
          console.log('Inspection result:', JSON.stringify(res.result.result.value, null, 2));
          chrome.kill();
          process.exit(0);
        }
      });
    });
  });
}, 2500);
