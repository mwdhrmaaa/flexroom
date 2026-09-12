import { wrapCanvasText } from '../canvas_context.js';

/**
 * Renders Brutalist template on canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} ach
 * @param {HTMLImageElement|null} img
 * @param {{ drawX: number, drawY: number, drawW: number, drawH: number }} bounds
 */
export function renderBrutalistCard(ctx, ach, img, bounds) {
  // Background
  ctx.fillStyle = '#12150d';
  ctx.fillRect(0, 0, 800, 1000);

  // Square Grid Overlay
  ctx.strokeStyle = 'rgba(213, 255, 64, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 40; x < 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 20);
    ctx.lineTo(x, 980);
    ctx.stroke();
  }
  for (let y = 40; y < 1000; y += 40) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(780, y);
    ctx.stroke();
  }

  // Outer Lime Border
  ctx.strokeStyle = '#d5ff40';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 760, 960);

  // Cross Corner Indicators
  ctx.fillStyle = '#d5ff40';
  ctx.font = '700 16px "Courier New", monospace';
  ctx.fillText('+', 40, 45);
  ctx.fillText('+', 750, 45);
  ctx.fillText('+', 40, 950);
  ctx.fillText('+', 750, 950);

  // Top Barcode
  ctx.fillStyle = '#ffffff';
  let startX = 580;
  for (let i = 0; i < 22; i++) {
    const barWidth = (i % 5 === 0) ? 5 : (i % 3 === 0) ? 3 : (i % 2 === 0) ? 2 : 1;
    ctx.fillRect(startX, 45, barWidth, 30);
    startX += barWidth + 2;
  }

  // Header Titles
  ctx.textAlign = 'left';
  ctx.font = '700 11px "Courier New", monospace';
  ctx.fillText('> RENDER_SYS_OK', 60, 55);
  ctx.fillText(`SYS_DATE: ${ach.date || 'ACTIVE'}`, 60, 70);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px "Poppins", sans-serif';
  ctx.fillText('FLEXCARD', 400, 95);

  ctx.font = '700 11px "Courier New", monospace';
  ctx.fillStyle = '#d5ff40';
  ctx.fillText('// CORE COLLECTIBLE VER.01 // SYSTEMATIC.AUTHENTIC', 400, 120);

  // Image Frame
  const { drawX, drawY, drawW, drawH } = bounds;
  ctx.fillStyle = '#1b1e15';
  ctx.fillRect(drawX, drawY, drawW, drawH);

  if (img) {
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  ctx.strokeStyle = '#d5ff40';
  ctx.lineWidth = 4;
  ctx.strokeRect(drawX, drawY, drawW, drawH);

  // Text Metadata
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d5ff40';
  ctx.font = '800 24px "Poppins", sans-serif';
  ctx.fillText(`// ${(ach.game || 'UNKNOWN GAME').toUpperCase()}`, 60, 650);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 16px "Courier New", monospace';
  ctx.fillText(`DATE_ ${String(ach.date || '').replace(/-/g, '.')}`, 740, 650);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px "Poppins", sans-serif';
  ctx.fillText((ach.title || 'ACHIEVEMENT').toUpperCase(), 60, 715);

  ctx.fillStyle = '#c0c2b8';
  ctx.font = '500 18px "Poppins", sans-serif';
  wrapCanvasText(ctx, (ach.description || '').toUpperCase(), 60, 770, 450, 26);

  // Hardware Specs Box
  ctx.strokeStyle = 'rgba(213, 255, 64, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(530, 762, 210, 115);
  ctx.fillStyle = 'rgba(213, 255, 64, 0.1)';
  ctx.fillRect(530, 762, 210, 20);
  ctx.fillStyle = '#d5ff40';
  ctx.font = '800 9px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('// TROPHY_SPECS', 635, 775);

  const stats = [
    { label: 'RARITY', val: 'MYTHIC_V.01' },
    { label: 'CALIBRATION', val: '99.4 / 100' },
    { label: 'STABILITY', val: '99.9%' }
  ];
  stats.forEach((s, idx) => {
    const sy = 802 + idx * 22;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#c0c2b8';
    ctx.fillText(s.label, 542, sy);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#d5ff40';
    ctx.fillText(s.val, 728, sy);
  });

  // Footer
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d5ff40';
  ctx.font = '800 12px "Courier New", monospace';
  ctx.fillText('> ACCESS GRANTED // CORE_COLLECTIBLE_VERIFIED <', 400, 930);
}
