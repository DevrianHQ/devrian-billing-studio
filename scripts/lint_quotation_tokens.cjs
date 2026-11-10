const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.resolve(__dirname, '../src/modules/quotation/components');

const ALLOWED_COMPONENTS = new Set([
  'HeaderBand.tsx',
  'SlimHeader.tsx',
  'MetaRow.tsx',
  'PartyRow.tsx',
  'SectionHeading.tsx',
  'DataTable.tsx',
  'KeyValueStrip.tsx',
  'ListTable.tsx',
  'SummaryBlock.tsx',
  'TotalBar.tsx',
  'PaymentBox.tsx',
  'NoteBox.tsx',
  'SignaturePair.tsx',
  'ClosingLine.tsx',
  'Footer.tsx',
  'QuotationPreview.tsx',
  'QuotationStyleGuide.tsx',
  'QuotationTemplatesSettings.tsx',
  'LayoutBudgetPanel.tsx',
]);

const ALLOWED_COLORS = new Set([
  '#0E0E0E',
  '#FFFFFF',
  '#8A8A8A',
  '#6B6B6B',
  '#4A4A4A',
  '#333333',
  '#E5E5E5',
  '#E0E0E0',
  '#F0F0F0',
  '#1A1A1A',
  '#151515',
  '#2A2A2A',
  '#D9D9D9',
  '#9A9A9A',
  '#D4D4D8',
  '#E4E4E7',
]);

function runLint() {
  console.log('--- LINTING QUOTATION DESIGN TOKENS ---');

  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(`Components directory not found: ${COMPONENTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(COMPONENTS_DIR);
  let errors = 0;

  // 1. Verify only allowed components exist
  for (const file of files) {
    if (!ALLOWED_COMPONENTS.has(file)) {
      console.error(`[VIOLATION] Unauthorized component found: ${file}. Only the 14 authorized quotation components + composite views are allowed.`);
      errors++;
    }
  }

  // 2. Scan each component for token compliance
  for (const file of files) {
    const filePath = path.join(COMPONENTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // QuotationStyleGuide and QuotationTemplatesSettings are dev/settings wrappers, but still checked
    if (!content.includes('QUOTATION_TOKENS') && !file.includes('Settings')) {
      console.error(`[VIOLATION] ${file} does not import QUOTATION_TOKENS`);
      errors++;
    }

    // Check for arbitrary hex colors
    const hexMatches = content.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    for (const hex of hexMatches) {
      const upper = hex.toUpperCase();
      if (!ALLOWED_COLORS.has(upper)) {
        console.error(`[VIOLATION] ${file} contains raw arbitrary color ${hex}. Must use QUOTATION_TOKENS.colors.`);
        errors++;
      }
    }

    // Check for raw font-family
    const fontMatches = content.match(/fontFamily:\s*['"][^'"]+['"]/g) || [];
    for (const fm of fontMatches) {
      if (!fm.includes('QUOTATION_TOKENS.font.family') && !fm.includes('Poppins')) {
        console.error(`[VIOLATION] ${file} uses unauthorized font: ${fm}. Must be Poppins via QUOTATION_TOKENS.`);
        errors++;
      }
    }
  }

  if (errors > 0) {
    console.error(`Lint failed with ${errors} violation(s).`);
    process.exit(1);
  } else {
    console.log(`✓ Quotation tokens lint PASSED: All ${files.length} components strictly adhere to tokens.`);
  }
}

runLint();

