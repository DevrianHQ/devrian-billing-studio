export interface SignatureProcessOptions {
  threshold: number; // 10 to 90 (default ~40)
  smoothness: number; // 1 to 5 (default 2)
  thickness: number; // 1 to 5 (default 1)
  rotation: number; // -45 to 45 degrees (default 0)
  inkColor: 'black' | 'blue';
}

/**
 * In-browser canvas image processor that removes paper background,
 * normalizes non-uniform lighting/shadows, eliminates noise specks,
 * crops to ink boundaries, and normalizes ink color to clean transparent PNG.
 */
export async function processSignatureImage(
  imageSource: HTMLImageElement,
  options: SignatureProcessOptions
): Promise<string> {
  const { threshold = 40, smoothness = 2, thickness = 1, rotation = 0, inkColor = 'black' } = options;

  // 1. Initial Canvas with Rotation / Deskew
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const rotWidth = Math.floor(imageSource.naturalWidth * cos + imageSource.naturalHeight * sin);
  const rotHeight = Math.floor(imageSource.naturalWidth * sin + imageSource.naturalHeight * cos);

  const canvas = document.createElement('canvas');
  canvas.width = rotWidth;
  canvas.height = rotHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.translate(rotWidth / 2, rotHeight / 2);
  ctx.rotate(rad);
  ctx.drawImage(imageSource, -imageSource.naturalWidth / 2, -imageSource.naturalHeight / 2);

  const imgData = ctx.getImageData(0, 0, rotWidth, rotHeight);
  const { data, width, height } = imgData;
  const totalPixels = width * height;

  // 2. Grayscale Buffer
  const gray = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // 3. Estimate Local Background Illumination via Fast Box Blur
  // To handle shadows and uneven paper lighting
  const bgBlur = new Float32Array(totalPixels);
  const radius = Math.max(10, Math.floor(Math.min(width, height) / 25));
  
  // Horizontal pass
  for (let y = 0; y < height; y++) {
    let sum = 0;
    const yOffset = y * width;
    for (let x = -radius; x <= radius; x++) {
      const px = Math.min(Math.max(x, 0), width - 1);
      sum += gray[yOffset + px];
    }
    for (let x = 0; x < width; x++) {
      bgBlur[yOffset + x] = sum / (radius * 2 + 1);
      const nextX = Math.min(x + radius + 1, width - 1);
      const prevX = Math.max(x - radius, 0);
      sum += gray[yOffset + nextX] - gray[yOffset + prevX];
    }
  }

  // Vertical pass
  const localBg = new Float32Array(totalPixels);
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      const py = Math.min(Math.max(y, 0), height - 1);
      sum += bgBlur[py * width + x];
    }
    for (let y = 0; y < height; y++) {
      localBg[y * width + x] = sum / (radius * 2 + 1);
      const nextY = Math.min(y + radius + 1, height - 1);
      const prevY = Math.max(y - radius, 0);
      sum += bgBlur[nextY * width + x] - bgBlur[prevY * width + x];
    }
  }

  // 4. Compute Ink Alpha using Background Subtraction & Dynamic Threshold
  const alphaChannel = new Uint8Array(totalPixels);
  // Color selection
  const targetR = inkColor === 'blue' ? 14 : 14; // #0E0E0E or dark blue
  const targetG = inkColor === 'blue' ? 37 : 14;
  const targetB = inkColor === 'blue' ? 69 : 14;

  const sensitivity = threshold * 0.8; // threshold slider mapped

  for (let i = 0; i < totalPixels; i++) {
    const diff = localBg[i] - gray[i];
    if (diff > sensitivity) {
      // Calculate normalized alpha with smooth falloff
      const factor = (diff - sensitivity) / (255 - sensitivity);
      const enhanced = Math.min(255, Math.pow(factor, 1 / (smoothness * 0.8 + 0.4)) * 255 * (1 + thickness * 0.25));
      alphaChannel[i] = Math.round(enhanced);
    } else {
      alphaChannel[i] = 0;
    }
  }

  // 5. Remove Isolated Specks (Noise filter)
  const cleanedAlpha = new Uint8Array(totalPixels);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (alphaChannel[idx] > 0) {
        // Count surrounding active pixels
        let neighbors = 0;
        if (alphaChannel[idx - 1] > 30) neighbors++;
        if (alphaChannel[idx + 1] > 30) neighbors++;
        if (alphaChannel[idx - width] > 30) neighbors++;
        if (alphaChannel[idx + width] > 30) neighbors++;
        if (neighbors >= 1) {
          cleanedAlpha[idx] = alphaChannel[idx];
        } else {
          cleanedAlpha[idx] = 0;
        }
      }
    }
  }

  // 6. Calculate Bounding Box of Ink
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasInk = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const a = cleanedAlpha[idx];
      if (a > 15) {
        hasInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      // Populate output pixel
      data[idx * 4] = targetR;
      data[idx * 4 + 1] = targetG;
      data[idx * 4 + 2] = targetB;
      data[idx * 4 + 3] = a;
    }
  }

  if (!hasInk) {
    // Return empty 1x1 transparent
    const empty = document.createElement('canvas');
    empty.width = 1;
    empty.height = 1;
    return empty.toDataURL('image/png');
  }

  ctx.putImageData(imgData, 0, 0);

  // 7. Auto-Crop to Bounding Box with Padding
  const pad = 12;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - minX + pad * 2);
  const cropH = Math.min(height - cropY, maxY - minY + pad * 2);

  // 8. Scale to safety width (max 500px)
  const maxSafetyWidth = 500;
  const scale = cropW > maxSafetyWidth ? maxSafetyWidth / cropW : 1;
  const finalW = Math.max(1, Math.round(cropW * scale));
  const finalH = Math.max(1, Math.round(cropH * scale));

  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = finalW;
  outputCanvas.height = finalH;
  const outCtx = outputCanvas.getContext('2d');
  if (!outCtx) return canvas.toDataURL('image/png');

  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, finalW, finalH);

  return outputCanvas.toDataURL('image/png');
}

/**
 * Creates a signature from canvas drawing with auto-crop and 500px safety limit
 */
export function cropDrawnCanvasSignature(sourceCanvas: HTMLCanvasElement): string {
  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return sourceCanvas.toDataURL('image/png');

  const { width, height } = sourceCanvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const { data } = imgData;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasInk = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 10) {
        hasInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasInk) return sourceCanvas.toDataURL('image/png');

  const pad = 10;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, maxX - minX + pad * 2);
  const cropH = Math.min(height - cropY, maxY - minY + pad * 2);

  const maxW = 500;
  const scale = cropW > maxW ? maxW / cropW : 1;
  const finalW = Math.round(cropW * scale);
  const finalH = Math.round(cropH * scale);

  const out = document.createElement('canvas');
  out.width = finalW;
  out.height = finalH;
  const outCtx = out.getContext('2d');
  if (!outCtx) return sourceCanvas.toDataURL('image/png');

  outCtx.imageSmoothingEnabled = true;
  outCtx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, finalW, finalH);

  return out.toDataURL('image/png');
}

/**
 * Generates transparent signature image from typed text and selected script font
 */
export function generateTypedScriptSignature(name: string, fontName: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0E0E0E';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `64px '${fontName}', cursive`;

  ctx.fillText(name || 'Dev Rajpoot', 300, 90);

  return cropDrawnCanvasSignature(canvas);
}

