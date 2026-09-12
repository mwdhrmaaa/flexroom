import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDimensions } from '../src/features/upload/image_compressor.js';

describe('ImageCompressor Dimension Calculations', () => {
  it('should return original dimensions if already below maxDim', () => {
    const result = calculateDimensions(600, 400, 800);
    assert.deepStrictEqual(result, { width: 600, height: 400 });
  });

  it('should scale down landscape images proportionally to maxDim width', () => {
    const result = calculateDimensions(1600, 800, 800);
    assert.deepStrictEqual(result, { width: 800, height: 400 });
  });

  it('should scale down portrait images proportionally to maxDim height', () => {
    const result = calculateDimensions(800, 1600, 800);
    assert.deepStrictEqual(result, { width: 400, height: 800 });
  });

  it('should scale down large square images to maxDim x maxDim', () => {
    const result = calculateDimensions(2000, 2000, 800);
    assert.deepStrictEqual(result, { width: 800, height: 800 });
  });

  it('should return zeroes for invalid or zero dimensions', () => {
    assert.deepStrictEqual(calculateDimensions(0, 500), { width: 0, height: 0 });
    assert.deepStrictEqual(calculateDimensions(-10, -20), { width: 0, height: 0 });
  });
});
