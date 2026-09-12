import { createBaseCanvas, calculateImageFit, loadCanvasImage } from './canvas_context.js';
import { renderBrutalistCard } from './templates/brutalist_template.js';
import { renderCrimsonCard } from './templates/crimson_template.js';
import { renderCyberCard } from './templates/cyber_template.js';

export const TEMPLATE_REGISTRY = {
  brutalist: renderBrutalistCard,
  neon: renderCrimsonCard,
  crimson: renderCrimsonCard,
  cyber: renderCyberCard
};

const FRAME_BOUNDS = {
  frameX: 50,
  frameY: 180,
  frameW: 700,
  frameH: 430
};

/**
 * Generates a PNG data URL of an achievement trophy card.
 * @param {object} achievement
 * @param {string} styleName
 * @returns {Promise<string>}
 */
export async function generateShareCardDataUrl(achievement, styleName = 'brutalist') {
  const { canvas, ctx } = createBaseCanvas(800, 1000);
  const renderer = TEMPLATE_REGISTRY[styleName] || TEMPLATE_REGISTRY.brutalist;

  let loadedImg = null;
  let bounds = {
    drawX: FRAME_BOUNDS.frameX,
    drawY: FRAME_BOUNDS.frameY,
    drawW: FRAME_BOUNDS.frameW,
    drawH: FRAME_BOUNDS.frameH
  };

  if (achievement.image) {
    try {
      loadedImg = await loadCanvasImage(achievement.image);
      bounds = calculateImageFit(
        loadedImg.width,
        loadedImg.height,
        FRAME_BOUNDS.frameX,
        FRAME_BOUNDS.frameY,
        FRAME_BOUNDS.frameW,
        FRAME_BOUNDS.frameH
      );
    } catch {
      loadedImg = null;
    }
  }

  renderer(ctx, achievement, loadedImg, bounds);
  return canvas.toDataURL('image/png');
}

/**
 * Compatibility wrapper supporting both callback and Promise interfaces.
 * @param {object} achievement
 * @param {string} style
 * @param {(dataUrl: string) => void} [callback]
 * @returns {Promise<string>}
 */
export function generateShareCard(achievement, style, callback) {
  const promise = generateShareCardDataUrl(achievement, style);
  if (typeof callback === 'function') {
    promise.then(callback).catch((err) => {
      console.error('[TrophyGenerator] Failed to generate card:', err);
    });
  }
  return promise;
}
