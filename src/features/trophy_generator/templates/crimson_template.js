import { wrapCanvasText } from '../canvas_context.js';

/**
 * Renders Crimson Glow template on canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} ach
 * @param {HTMLImageElement|null} img
 * @param {{ drawX: number, drawY: number, drawW: number, drawH: number }} bounds
 */
export function renderCrimsonCard(ctx, ach, img, bounds) {
  // Deep Obsidian Background
  ctx.fillStyle = '#0a0a0c';
  ctx.fillRect(0, 0, 800, 1000);

  // Crimson Radial Glow
  const glow = ctx.createRadialGradient(400, 420, 50, 400, 450, 550);
  glow.addColorStop(0, 'rgba(255, 45, 45, 0.18)');
  glow.addColorStop(0.5, 'rgba(35, 10, 10, 0.06)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 800, 1000);

  // Outer Border
  ctx.strokeStyle = '#ff3e3e';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 760, 960);

  // Header Title
  ctx.textAlign = 'center';
  ctx.font = '800 36px "Poppins", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('FLEXCARD', 400, 70);

  ctx.font = '600 11px "Poppins", sans-serif';
  ctx.fillStyle = 'rgba(255, 62, 62, 0.75)';
  ctx.fillText('CRIMSON GLOW // EXCLUSIVE DIGITAL TROPHY', 400, 96);

  // Image Frame with Crimson Backlit Aura
  const { drawX, drawY, drawW, drawH } = bounds;
  ctx.fillStyle = '#140c0c';
  ctx.fillRect(drawX, drawY, drawW, drawH);

  if (img) {
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.fillStyle = 'rgba(255, 30, 30, 0.05)';
    ctx.fillRect(drawX, drawY, drawW, drawH);
  } else {
    ctx.strokeStyle = 'rgba(255, 62, 62, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(drawX + drawW / 2, drawY + drawH / 2, 45, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ff5c5c';
    ctx.font = '600 13px "Poppins", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COLLECTIBLE DATA RECORDED', drawX + drawW / 2, drawY + drawH / 2 + 5);
  }

  ctx.strokeStyle = 'rgba(255, 62, 62, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX, drawY, drawW, drawH);

  // Game & Date Header
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ff5c5c';
  ctx.font = '700 20px "Poppins", sans-serif';
  ctx.fillText((ach.game || 'UNTITLED').toUpperCase(), 60, 655);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '600 14px "Poppins", sans-serif';
  ctx.fillText(ach.date || '', 740, 655);

  // Achievement Title & Description
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 36px "Poppins", sans-serif';
  ctx.fillText(ach.title || 'ACHIEVEMENT', 60, 710);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '400 16px "Poppins", sans-serif';
  wrapCanvasText(ctx, ach.description || '', 60, 755, 680, 24);

  // Verified Badge & Diamonds
  ctx.fillStyle = '#ff3e3e';
  for (let i = 0; i < 5; i++) {
    const dx = 60 + i * 16;
    const dy = 860;
    ctx.beginPath();
    ctx.moveTo(dx, dy - 5);
    ctx.lineTo(dx + 5, dy);
    ctx.lineTo(dx, dy + 5);
    ctx.lineTo(dx - 5, dy);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '600 11px "Poppins", sans-serif';
  ctx.fillText('VERIFIED TROPHY COLLECTIBLE', 155, 864);

  // Separator & Footer
  ctx.strokeStyle = 'rgba(255, 62, 62, 0.15)';
  ctx.beginPath();
  ctx.moveTo(50, 895);
  ctx.lineTo(750, 895);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = '600 13px "Poppins", sans-serif';
  ctx.fillText('VERIFIED VIA FLEXROOM TROPHY SYSTEM', 400, 935);
}
