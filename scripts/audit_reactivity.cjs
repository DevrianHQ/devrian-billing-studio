const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:4173/';
const DEBUG_PORT = 9248;

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

async function runTest() {
  console.log('=== RUNNING COMPREHENSIVE REACTIVITY & FORM AUDIT ===');
  const session = await connectChrome();

  try {
    // 1. Reset localStorage to clean state
    await session.evalJs(`(() => {
      localStorage.removeItem('devrian_active_draft_v4');
      window.location.reload();
    })()`);
    await sleep(2500);

    // Test 1: Change Client Name
    console.log('\n--- Test 1: Change Client Name ---');
    const clientTest = await session.evalJs(`(() => {
      // Find client name input
      const inputs = Array.from(document.querySelectorAll('input'));
      const clientInput = inputs.find(i => i.placeholder === 'Client / Company Name' || (i.previousElementSibling && i.previousElementSibling.textContent.includes('CLIENT / BUSINESS NAME')) || i.value === 'Anshita Singh Parihar');
      if (!clientInput) return { error: 'Client input not found' };

      // Set value and dispatch event
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(clientInput, 'TEST CLIENT CORP');
      clientInput.dispatchEvent(new Event('input', { bubbles: true }));
      clientInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Check if preview document contains TEST CLIENT CORP
      const preview = document.querySelector('.origin-top');
      const hasInPreview = preview ? preview.textContent.includes('TEST CLIENT CORP') : false;
      return { success: true, hasInPreview, textSnippet: preview ? preview.textContent.slice(0, 300) : '' };
    })()`);
    console.log('Client test result:', clientTest);

    // Test 2: Change Project Title
    console.log('\n--- Test 2: Change Project Title ---');
    const projectTest = await session.evalJs(`(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const projInput = inputs.find(i => i.value === 'FMCG Video Editing – 15 Videos');
      if (!projInput) return { error: 'Project input not found' };

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeSetter.call(projInput, 'SUPER CUSTOM PROJECT 2026');
      projInput.dispatchEvent(new Event('input', { bubbles: true }));
      projInput.dispatchEvent(new Event('change', { bubbles: true }));

      const preview = document.querySelector('.origin-top');
      const hasInPreview = preview ? preview.textContent.includes('SUPER CUSTOM PROJECT 2026') : false;
      return { success: true, hasInPreview };
    })()`);
    console.log('Project test result:', projectTest);

    // Test 3: Check Receipt / Invoice Switching
    console.log('\n--- Test 3: Switch between Receipt and Invoice ---');
    const switchTest = await session.evalJs(`(() => {
      const receiptBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Receipt');
      if (!receiptBtn) return { error: 'Receipt button not found' };
      receiptBtn.click();
      return { clicked: true };
    })()`);
    await sleep(1000);
    const receiptPreviewCheck = await session.evalJs(`(() => {
      const preview = document.querySelector('.origin-top');
      return {
        hasPaymentReceipt: preview ? preview.textContent.includes('PAYMENT RECEIPT') : false,
        hasAdvancePayment: preview ? preview.textContent.includes('ADVANCE PAYMENT') : false
      };
    })()`);
    console.log('Receipt switch check:', receiptPreviewCheck);

    // Test 4: Navigate to Settings, change business details, come back
    console.log('\n--- Test 4: Navigate to Settings, change details, verify preview ---');
    const navSettings = await session.evalJs(`(() => {
      const settingsNav = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Settings'));
      if (settingsNav) {
        settingsNav.click();
        return { clicked: true };
      }
      return { error: 'Settings button not found' };
    })()`);
    await sleep(1000);

    // In settings, change Tagline and Email
    const changeSettings = await session.evalJs(`(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const taglineInput = inputs.find(i => i.value && i.value.includes('Building Attention'));
      const emailInput = inputs.find(i => i.value === 'inquiry@devrian.in');
      
      const res = {};
      if (taglineInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(taglineInput, 'TEST NEW SETTINGS TAGLINE');
        taglineInput.dispatchEvent(new Event('input', { bubbles: true }));
        taglineInput.dispatchEvent(new Event('change', { bubbles: true }));
        res.taglineChanged = true;
      }
      if (emailInput) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(emailInput, 'testsupport@devrian.in');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        res.emailChanged = true;
      }

      // Click save button in settings if present
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save All Settings'));
      if (saveBtn) {
        saveBtn.click();
        res.saveBtnClicked = true;
      }

      return res;
    })()`);
    console.log('Settings changed:', changeSettings);
    await sleep(1000);

    // Navigate back to Create
    await session.evalJs(`(() => {
      const createNav = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Create'));
      if (createNav) createNav.click();
    })()`);
    await sleep(1500);

    // Check preview in Create page!
    const previewAfterSettings = await session.evalJs(`(() => {
      const preview = document.querySelector('.origin-top');
      if (!preview) return { error: 'Preview not found' };
      const text = preview.textContent;
      return {
        hasNewTagline: text.includes('TEST NEW SETTINGS TAGLINE'),
        hasNewEmail: text.includes('testsupport@devrian.in'),
        previewHeaderSnippet: text.slice(0, 300)
      };
    })()`);
    console.log('Preview after returning from Settings:', previewAfterSettings);

  } finally {
    session.chrome.kill();
  }
}

runTest().catch(console.error);

