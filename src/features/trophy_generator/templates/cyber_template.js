import { wrapCanvasText } from '../canvas_context.js';

/**
 * Renders Cyber Flux template on canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} ach
 * @param {HTMLImageElement|null} img
 * @param {{ drawX: number, drawY: number, drawW: number, drawH: number }} bounds
 */
export function renderCyberCard(ctx, ach, img, bounds) {
  // Midnight Cyber Navy Background
  ctx.fillStyle = '#060a12';
  ctx.fillRect(0, 0, 800, 1000);

  // Cyan & Cobalt Flux Aura
  const aura = ctx.createRadialGradient(400, 400, 40, 400, 400, 500);
  aura.addColorStop(0, 'rgba(0, 224, 255, 0.16)');
  aura.addColorStop(0.5, 'rgba(10, 25, 45, 0.05)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, 800, 1000);

  // Diagonal Matrix Crosshatch
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#00e0ff';
  ctx.lineWidth = 1;
  const step = 40;
  for (let i = -800; i < 1600; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 1000, 1000);
    ctx.stroke();
  }
  ctx.restore();

  // Outer Border with Neon Cyan Accents
  ctx.strokeStyle = '#00e0ff';
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, 760, 960);

  // Corner Bracket Accents
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 4;
  const cSize = 25;
  // Top-left
  ctx.beginPath(); ctx.moveTo(15, 15 + cSize); ctx.lineTo(15, 15); ctx.lineTo(15 + cSize, 15); ctx.stroke();
  // Top-right
  ctx.beginPath(); ctx.moveTo(785 - cSize, 15); ctx.lineTo(785, 15); ctx.lineTo(785, 15 + cSize); ctx.stroke();
  // Bottom-left
  ctx.beginPath(); ctx.moveTo(15, 985 - cSize); ctx.lineTo(15, 985); ctx.lineTo(15 + cSize, 985); ctx.stroke();
  // Bottom-right
  ctx.beginPath(); ctx.moveTo(785 - cSize, 985); ctx.lineTo(785, 985); ctx.lineTo(785, 985 - cSize); ctx.stroke();

  // Header Title
  ctx.textAlign = 'center';
  ctx.font = '900 38px "Poppins", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FLEXCARD', 400, 72);

  ctx.font = '700 11px "Courier New", monospace';
  ctx.fillStyle = '#00e0ff';
  ctx.fillText('[ PROTOCOL: CYBER_FLUX // SECURE_ARCHIVE ]', 400, 98);

  // Image Frame
  const { drawX, drawY, drawW, drawH } = bounds;
  ctx.fillStyle = '#08111e';
  ctx.fillRect(drawX, drawY, drawW, drawH);

  if (img) {
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  } else {
    ctx.strokeStyle = 'rgba(0, 224, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX + drawW / 2 - 140, drawY + drawH / 2 - 25, 280, 50);

    ctx.fillStyle = '#00e0ff';
    ctx.font = '700 12px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('// TELEMETRY ACTIVE // NO_IMG //', drawX + drawW / 2, drawY + drawH / 2 + 5);
  }

  ctx.strokeStyle = '#00e0ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX, drawY, drawW, drawH);

  // Meta details
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00e0ff';
  ctx.font = '700 22px "Poppins", sans-serif';
  ctx.fillText((ach.game || 'UNTITLED').toUpperCase(), 60, 655);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '700 14px "Courier New", monospace';
  ctx.fillText(`TIMESTAMP: ${ach.date || 'ACTIVE'}`, 740, 655);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 36px "Poppins", sans-serif';
  ctx.fillText(ach.title || 'ACHIEVEMENT', 60, 710);

  ctx.fillStyle = 'rgba(200, 230, 255, 0.75)';
  ctx.font = '400 16px "Poppins", sans-serif';
  wrapCanvasText(ctx, ach.description || '', 60, 755, 680, 24);

  // Cyber Ticker Footer
  ctx.strokeStyle = 'rgba(0, 224, 255, 0.2)';
  ctx.beginPath();
  ctx.moveTo(50, 895);
  ctx.lineTo(750, 895);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#00e0ff';
  ctx.font = '700 11px "Courier New", monospace';
  ctx.fillText('// VERIFIED BY CYBER_FLUX COLLECTIBLE KERNEL 2.0 //', 400, 935);
}
