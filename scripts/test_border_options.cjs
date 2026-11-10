const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Poppins', sans-serif; background: #fff; padding: 40px; }
    .title { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
    .box { width: 174mm; margin-bottom: 30px; box-sizing: border-box; }
  </style>
</head>
<body>
  <div class="title">Option 1: Black outer border (0.25mm solid #0E0E0E, overflow: hidden)</div>
  <div class="box" style="border: 0.25mm solid #0E0E0E; overflow: hidden;">
    <div style="background: #0E0E0E; height: 7.5mm; padding: 0 4.5mm; display: flex; align-items: center; color: #fff; font-size: 7pt; font-weight: 700; letter-spacing: 0.22em;">
      <span>PAYMENT DETAILS</span>
      <div style="width: 0.2mm; height: 4mm; background: #2A2A2A; margin: 0 5mm;"></div>
      <span>BANK TRANSFER</span>
    </div>
    <div style="background: #F0F0F0; padding: 3.5mm 4.5mm; display: flex; gap: 5mm;">
      <div style="flex: 1;">
        <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">PAY VIA UPI</span>
        <span style="font-size: 10pt; font-weight: 600; color: #0E0E0E;">6395171870@ybl</span>
      </div>
      <div style="width: 0.2mm; background: #E5E5E5;"></div>
      <div style="flex: 1.5; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm;">
        <div>
          <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">ACCOUNT NAME</span>
          <span style="font-size: 9pt; font-weight: 600; color: #0E0E0E;">Dev Rajpoot</span>
        </div>
        <div>
          <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">BANK NAME</span>
          <span style="font-size: 9pt; font-weight: 600; color: #0E0E0E;">State Bank of India</span>
        </div>
      </div>
    </div>
  </div>

  <div class="title">Option 2: No outer border on black header, subtle border on gray body only</div>
  <div class="box">
    <div style="background: #0E0E0E; height: 7.5mm; padding: 0 4.5mm; display: flex; align-items: center; color: #fff; font-size: 7pt; font-weight: 700; letter-spacing: 0.22em;">
      <span>PAYMENT DETAILS</span>
      <div style="width: 0.2mm; height: 4mm; background: #2A2A2A; margin: 0 5mm;"></div>
      <span>BANK TRANSFER</span>
    </div>
    <div style="background: #F0F0F0; border-left: 0.25mm solid #E0E0E0; border-right: 0.25mm solid #E0E0E0; border-bottom: 0.25mm solid #E0E0E0; padding: 3.5mm 4.5mm; display: flex; gap: 5mm;">
      <div style="flex: 1;">
        <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">PAY VIA UPI</span>
        <span style="font-size: 10pt; font-weight: 600; color: #0E0E0E;">6395171870@ybl</span>
      </div>
      <div style="width: 0.2mm; background: #E5E5E5;"></div>
      <div style="flex: 1.5; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm;">
        <div>
          <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">ACCOUNT NAME</span>
          <span style="font-size: 9pt; font-weight: 600; color: #0E0E0E;">Dev Rajpoot</span>
        </div>
        <div>
          <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">BANK NAME</span>
          <span style="font-size: 9pt; font-weight: 600; color: #0E0E0E;">State Bank of India</span>
        </div>
      </div>
    </div>
  </div>

  <div class="title">Option 3: Pure seamless block (No borders at all, exact same geometric width)</div>
  <div class="box">
    <div style="background: #0E0E0E; height: 7.5mm; padding: 0 4.5mm; display: flex; align-items: center; color: #fff; font-size: 7pt; font-weight: 700; letter-spacing: 0.22em;">
      <span>PAYMENT DETAILS</span>
      <div style="width: 0.2mm; height: 4mm; background: #2A2A2A; margin: 0 5mm;"></div>
      <span>BANK TRANSFER</span>
    </div>
    <div style="background: #F0F0F0; padding: 3.5mm 4.5mm; display: flex; gap: 5mm;">
      <div style="flex: 1;">
        <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">PAY VIA UPI</span>
        <span style="font-size: 10pt; font-weight: 600; color: #0E0E0E;">6395171870@ybl</span>
      </div>
      <div style="width: 0.2mm; background: #E5E5E5;"></div>
      <div style="flex: 1.5; display: grid; grid-template-columns: 1fr 1fr; gap: 4mm;">
        <div>
          <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">ACCOUNT NAME</span>
          <span style="font-size: 9pt; font-weight: 600; color: #0E0E0E;">Dev Rajpoot</span>
        </div>
        <div>
          <span style="font-size: 6.8pt; font-weight: 600; color: #6B6B6B; display: block; margin-bottom: 0.8mm;">BANK NAME</span>
          <span style="font-size: 9pt; font-weight: 600; color: #0E0E0E;">State Bank of India</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

  await page.setContent(html);
  await page.waitForTimeout(1000);
  const outPath = path.resolve(__dirname, '../qa-screenshots/diagnose/compare_borders.png');
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved:', outPath);
  await browser.close();
})();

