import { createAchievementCardHtml } from './achievement_card.js';

/**
 * Calculates empty slot count needed to maintain visually balanced grid.
 * @param {number} totalAchievements
 * @returns {number}
 */
export function calculateEmptySlots(totalAchievements) {
  if (totalAchievements < 3) {
    return Math.max(0, 3 - totalAchievements);
  }
  return 1;
}

/**
 * Renders achievements grid and attaches interactive event handlers.
 * @param {HTMLElement} container
 * @param {Array<object>} achievements
 * @param {{ onAdd: () => void, onShare: (ach: object) => void, onDelete: (id: number) => void }} callbacks
 */
export function renderAchievementGrid(container, achievements, callbacks) {
  if (!container) return;
  container.innerHTML = '';

  // Render achievement cards
  achievements.forEach((ach) => {
    container.insertAdjacentHTML('beforeend', createAchievementCardHtml(ach));
  });

  // Calculate & render empty slot cards
  const emptyCount = calculateEmptySlots(achievements.length);
  for (let i = 0; i < emptyCount; i++) {
    const isFirstEmpty = achievements.length === 0 && i === 0;
    container.insertAdjacentHTML(
      'beforeend',
      `
      <div class="achievement-card glass add-card animate-fade-in open-modal-card" role="button" tabindex="0" aria-label="Add new achievement">
        <div class="plus-sign">+</div>
        ${isFirstEmpty ? '<span class="add-card-label">Add your first achievement</span>' : ''}
      </div>
      `
    );
  }

  // Bind Add Card clicks
  container.querySelectorAll('.open-modal-card').forEach((card) => {
    card.addEventListener('click', () => callbacks.onAdd?.());
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callbacks.onAdd?.();
      }
    });
  });

  // Bind Delete buttons
  container.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id') || '0', 10);
      if (id) callbacks.onDelete?.(id);
    });
  });

  // Bind Share buttons
  container.querySelectorAll('.share-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id') || '0', 10);
      const ach = achievements.find((a) => a.id === id);
      if (ach) callbacks.onShare?.(ach);
    });
  });
}
