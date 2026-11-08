/**
 * Formats a number to Indian Currency string (e.g. ₹1,50,000 or 1,50,000)
 */
export function formatINR(amount: number, showSymbol = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '₹0' : '0';
  }
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Convert to fixed 2 decimals if has decimal, else integer
  const parts = absAmount.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parseInt(parts[1], 10) > 0 ? `.${parts[1]}` : '';

  // Indian numbering system formatting:
  // Last 3 digits grouped, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const formatted = `${formattedInteger}${decimalPart}`;

  if (showSymbol) {
    return `${isNegative ? '-' : ''}₹${formatted}`;
  }
  return `${isNegative ? '-' : ''}${formatted}`;
}

const UNITS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertThreeDigit(num: number): string {
  let str = '';
  if (num >= 100) {
    str += UNITS[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += TENS[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += UNITS[num] + ' ';
  }
  return str.trim();
}

/**
 * Converts a number to Indian Words (e.g. "Rupees Six Thousand Only")
 */
export function numberToIndianWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Rupees Zero Only';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const integerPart = Math.floor(absAmount);
  const decimalPart = Math.round((absAmount - integerPart) * 100);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Rupees Zero Only';
  }

  let words = '';

  const crores = Math.floor(integerPart / 10000000);
  const lakhs = Math.floor((integerPart % 10000000) / 100000);
  const thousands = Math.floor((integerPart % 100000) / 1000);
  const hundreds = integerPart % 1000;

  if (crores > 0) {
    words += `${convertThreeDigit(crores)} Crore `;
  }
  if (lakhs > 0) {
    words += `${convertThreeDigit(lakhs)} Lakh `;
  }
  if (thousands > 0) {
    words += `${convertThreeDigit(thousands)} Thousand `;
  }
  if (hundreds > 0) {
    words += `${convertThreeDigit(hundreds)} `;
  }

  words = words.trim();
  let result = `Rupees ${words}`;

  if (decimalPart > 0) {
    result += ` and ${convertThreeDigit(decimalPart)} Paise`;
  }

  result += ' Only';

  return isNegative ? `Minus ${result}` : result;
}

