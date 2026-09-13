import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateImageFit } from '../src/features/trophy_generator/canvas_context.js';
import { TEMPLATE_REGISTRY } from '../src/features/trophy_generator/trophy_generator.js';
import { calculateEmptySlots } from '../src/features/achievements/achievement_grid.js';
import { escapeHtml, createAchievementCardHtml, FALLBACK_IMAGE_DATA_URI } from '../src/features/achievements/achievement_card.js';

describe('Trophy Generator & Grid Calculations', () => {
  it('should calculate proper frame positioning for image aspect ratios', () => {
    const frame = { frameX: 50, frameY: 180, frameW: 700, frameH: 430 };
    const fit = calculateImageFit(1400, 860, frame.frameX, frame.frameY, frame.frameW, frame.frameH);

    assert.strictEqual(fit.drawX, 50);
    assert.strictEqual(fit.drawW, 700);
    assert.strictEqual(Math.round(fit.drawH), 430);
  });

  it('should have all supported templates registered in template registry', () => {
    assert.strictEqual(typeof TEMPLATE_REGISTRY.brutalist, 'function');
    assert.strictEqual(typeof TEMPLATE_REGISTRY.crimson, 'function');
    assert.strictEqual(typeof TEMPLATE_REGISTRY.neon, 'function');
    assert.strictEqual(typeof TEMPLATE_REGISTRY.cyber, 'function');
  });

  it('should maintain balanced grid padding with empty slot calculation', () => {
    assert.strictEqual(calculateEmptySlots(0), 3);
    assert.strictEqual(calculateEmptySlots(1), 2);
    assert.strictEqual(calculateEmptySlots(2), 1);
    assert.strictEqual(calculateEmptySlots(3), 1);
    assert.strictEqual(calculateEmptySlots(10), 1);
  });

  it('should properly escape HTML characters to prevent XSS', () => {
    const raw = '<script>alert("hack")</script> & \'test\'';
    const escaped = escapeHtml(raw);
    assert.strictEqual(escaped.includes('<script>'), false);
    assert.strictEqual(escaped.includes('&lt;script&gt;'), true);
    assert.strictEqual(escaped.includes('&amp;'), true);
  });

  it('should use offline fallback SVG data URI when image is empty', () => {
    const html = createAchievementCardHtml({ id: 1, title: 'No Pic', game: 'Test Game', description: 'Desc' });
    assert.strictEqual(html.includes(FALLBACK_IMAGE_DATA_URI), true);
    assert.strictEqual(html.includes('via.placeholder.com'), false);
  });
});
