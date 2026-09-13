/**
 * Safely escapes HTML special characters.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const FALLBACK_IMAGE_DATA_URI =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23121318'/%3E%3Cpath d='M0 0L800 400M800 0L0 400' stroke='rgba(213,255,64,0.05)' stroke-width='1'/%3E%3Ccircle cx='400' cy='180' r='40' fill='none' stroke='%23d5ff40' stroke-width='2' stroke-opacity='0.4'/%3E%3Cpath d='M390 180h20M400 170v20' stroke='%23d5ff40' stroke-width='2'/%3E%3Ctext x='400' y='245' fill='%23c0c2b8' font-family='sans-serif' font-size='12' font-weight='600' text-anchor='middle' letter-spacing='2'%3ENO SCREENSHOT AVAILABLE%3C/text%3E%3C/svg%3E";

/**
 * Generates HTML string for a single achievement card.
 * @param {object} achievement
 * @returns {string}
 */
export function createAchievementCardHtml(achievement) {
  const safeId = escapeHtml(String(achievement.id || ''));
  const safeTitle = escapeHtml(achievement.title);
  const safeGame = escapeHtml(achievement.game);
  const safeDesc = escapeHtml(achievement.description);
  const safeDate = escapeHtml(achievement.date);
  const safeImage = achievement.image ? escapeHtml(achievement.image) : FALLBACK_IMAGE_DATA_URI;

  const imageHtml = `
    <div class="card-image-container">
      <img src="${safeImage}" alt="${safeTitle}" class="card-image" loading="lazy" onerror="this.onerror=null; this.src='${FALLBACK_IMAGE_DATA_URI}'" />
      <div class="card-image-overlay"></div>
    </div>
  `;

  return `
    <div class="achievement-card glass animate-fade-in" data-id="${safeId}">
      ${imageHtml}
      <div class="card-content">
        <div class="card-header">
          <h3 class="game-title">${safeGame}</h3>
          <span class="date">${safeDate}</span>
        </div>
        <h2 class="achievement-title text-gradient">${safeTitle}</h2>
        <p class="description">${safeDesc}</p>
        <div class="card-actions">
          <button class="btn btn-outline share-btn" data-id="${safeId}" aria-label="Share ${safeTitle}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
          <button class="btn btn-outline delete-btn" data-id="${safeId}" aria-label="Delete ${safeTitle}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
}
