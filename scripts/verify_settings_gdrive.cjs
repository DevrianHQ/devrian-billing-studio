const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=1920,1080',
  'http://localhost:4173/'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const targets = JSON.parse(data);
      const wsUrl = targets[0].webSocketDebuggerUrl;
      const ws = new WebSocket(wsUrl);
      let id = 1;

      function send(method, params = {}) {
        return new Promise((resolve) => {
          const reqId = id++;
          const handler = (evt) => {
            const msg = JSON.parse(evt.data);
            if (msg.id === reqId) {
              ws.removeEventListener('message', handler);
              resolve(msg.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id: reqId, method, params }));
        });
      }

      ws.addEventListener('open', async () => {
        try {
          await send('Page.enable');
          await send('Runtime.enable');

          // Navigate to Settings
          await send('Runtime.evaluate', {
            expression: `(() => {
              const settingsBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Settings'));
              if (settingsBtn) settingsBtn.click();
            })()`,
            awaitPromise: true
          });

          await new Promise(r => setTimeout(r, 1000));

          // Capture Screenshot
          const shot = await send('Page.captureScreenshot', { format: 'png' });
          const outDir = 'C:\\Users\\neela\\.gemini\\antigravity\\brain\\3cb6c773-e8f4-4eeb-838f-e2da43f8b827\\qa-screenshots';
          if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
          const outPath = path.join(outDir, 'settings_gdrive_sync.png');
          fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
          console.log('Saved screenshot to:', outPath);

          // Check if Google Drive section text exists
          const evalRes = await send('Runtime.evaluate', {
            expression: `(() => {
              const bodyText = document.body.innerText;
              return {
                hasGDriveHeading: bodyText.includes('Google Drive Cloud Sync & Auto-Backup'),
                hasAccount: bodyText.includes('neelamrajput658@gmail.com'),
                hasTestButton: bodyText.includes('Test Connection'),
                hasSyncButton: bodyText.includes('Sync to Drive Now')
              };
            })()`,
            returnByValue: true
          });

          console.log('Verification checks:', evalRes.result.value);
        } catch (err) {
          console.error('Error during test:', err);
        } finally {
          ws.close();
          chrome.kill();
          process.exit(0);
        }
      });
    });
  });
}, 1500);
