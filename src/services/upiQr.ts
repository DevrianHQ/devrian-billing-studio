import QRCode from 'qrcode';

export async function generateUpiQrDataUrl(
  upiId: string,
  amount: number,
  documentNumber: string,
  businessName = 'DEVRIAN'
): Promise<string> {
  if (!upiId || !upiId.trim()) return '';

  const cleanUpi = upiId.trim();
  const cleanDocNum = encodeURIComponent(documentNumber.trim());
  const cleanName = encodeURIComponent(businessName.trim());
  const amountStr = amount > 0 ? amount.toFixed(2) : '';

  // Format: upi://pay?pa=<UPI>&pn=DEVRIAN&am=<balance>&tn=<document no.>
  let upiUrl = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&tn=${cleanDocNum}`;
  if (amountStr) {
    upiUrl += `&am=${amountStr}&cu=INR`;
  }

  try {
    const dataUrl = await QRCode.toDataURL(upiUrl, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0E0E0E',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate UPI QR code', err);
    return '';
  }
}

