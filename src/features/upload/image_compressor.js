/**
 * Computes constrained dimensions preserving original aspect ratio.
 * @param {number} width
 * @param {number} height
 * @param {number} [maxDim=800]
 * @returns {{ width: number, height: number }}
 */
export function calculateDimensions(width, height, maxDim = 800) {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 };
  if (width <= maxDim && height <= maxDim) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  if (width > height) {
    return {
      width: maxDim,
      height: Math.round((height * maxDim) / width)
    };
  }

  return {
    width: Math.round((width * maxDim) / height),
    height: maxDim
  };
}

/**
 * Compresses an image file into an optimized JPEG Data URL via HTMLCanvas.
 * @param {File} file
 * @param {number} [maxDim=800]
 * @param {number} [quality=0.7]
 * @returns {Promise<string>}
 */
export function compressImage(file, maxDim = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid file type. An image file is required.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element.'));
      img.onload = () => {
        const { width, height } = calculateDimensions(img.width, img.height, maxDim);
        if (width <= 0 || height <= 0) {
          return reject(new Error('Invalid image dimensions.'));
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context unavailable.'));
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = String(e.target?.result);
    };

    reader.readAsDataURL(file);
  });
}
