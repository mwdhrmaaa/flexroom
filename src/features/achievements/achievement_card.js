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

/**
 * Generates HTML string for a single achievement card.
 * @param {object} achievement
 * @returns {string}
 */
export function createAchievementCardHtml(achievement) {
  const safeTitle = escapeHtml(achievement.title);
  const safeGame = escapeHtml(achievement.game);
  const safeDesc = escapeHtml(achievement.description);
  const safeDate = escapeHtml(achievement.date);

  const imageHtml = achievement.image
    ? `<div class="card-image-container">
         <img src="${achievement.image}" alt="${safeTitle}" class="card-image" onerror="this.onerror=null; this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'" />
         <div class="card-image-overlay"></div>
       </div>`
    : '';

  return `
    <div class="achievement-card glass animate-fade-in" data-id="${achievement.id}">
      ${imageHtml}
      <div class="card-content">
        <div class="card-header">
          <h3 class="game-title">${safeGame}</h3>
          <span class="date">${safeDate}</span>
        </div>
        <h2 class="achievement-title text-gradient">${safeTitle}</h2>
        <p class="description">${safeDesc}</p>
        <div class="card-actions">
          <button class="btn btn-outline share-btn" data-id="${achievement.id}" aria-label="Share ${safeTitle}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
          <button class="btn btn-outline delete-btn" data-id="${achievement.id}" aria-label="Delete ${safeTitle}">
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
