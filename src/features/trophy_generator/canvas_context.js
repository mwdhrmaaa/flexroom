/**
 * Creates and initializes an offscreen HTMLCanvas element.
 * @param {number} [width=800]
 * @param {number} [height=1000]
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }}
 */
export function createBaseCanvas(width = 800, height = 1000) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to acquire 2D canvas context.');
  }
  return { canvas, ctx };
}

/**
 * Fits an image into specified bounding frame preserving aspect ratio.
 * @param {number} imgWidth
 * @param {number} imgHeight
 * @param {number} frameX
 * @param {number} frameY
 * @param {number} frameW
 * @param {number} frameH
 * @returns {{ drawX: number, drawY: number, drawW: number, drawH: number }}
 */
export function calculateImageFit(imgWidth, imgHeight, frameX, frameY, frameW, frameH) {
  if (imgWidth <= 0 || imgHeight <= 0) {
    return { drawX: frameX, drawY: frameY, drawW: frameW, drawH: frameH };
  }
  const imgRatio = imgWidth / imgHeight;
  const frameRatio = frameW / frameH;

  if (imgRatio > frameRatio) {
    const drawW = frameW;
    const drawH = frameW / imgRatio;
    const drawX = frameX;
    const drawY = frameY + (frameH - drawH) / 2;
    return { drawX, drawY, drawW, drawH };
  }

  const drawW = frameH * imgRatio;
  const drawH = frameH;
  const drawX = frameX + (frameW - drawW) / 2;
  const drawY = frameY;
  return { drawX, drawY, drawW, drawH };
}

/**
 * Utility to wrap and draw text block on canvas with newline and maxLines support.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @param {number} lineHeight
 * @param {number} [maxLines=5]
 */
export function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 5) {
  const rawParagraphs = String(text || '').split('\n');
  let currentY = y;
  let linesDrawn = 0;

  for (const para of rawParagraphs) {
    const words = para.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        linesDrawn++;
        if (linesDrawn >= maxLines) return;
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line.trim()) {
      ctx.fillText(line.trim(), x, currentY);
      linesDrawn++;
      if (linesDrawn >= maxLines) return;
      currentY += lineHeight;
    }
  }
}

/**
 * Loads an image from a URI with CORS enabled for remote endpoints.
 * @param {string} src
 * @returns {Promise<HTMLImageElement>}
 */
export function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return reject(new Error('Image source is empty.'));
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load canvas image.'));
    img.src = src;
  });
}
