import { generateShareCard } from '../trophy_generator/trophy_generator.js';

/**
 * Initializes and manages the Share / Flexcard Trophy Modal.
 * @param {object} elements
 * @returns {{ open: (achievement: object) => void, close: () => void }}
 */
export function initShareModal(elements) {
  const {
    shareModal,
    closeShareModalBtn,
    shareLoader,
    shareCardPreview,
    downloadShareCardBtn,
    styleOptBtns
  } = elements;

  let activeAchievement = null;
  let currentStyle = 'brutalist';

  const updateCard = () => {
    if (!activeAchievement) return;
    if (shareLoader) shareLoader.style.display = 'flex';
    if (shareCardPreview) shareCardPreview.style.display = 'none';
    if (downloadShareCardBtn) {
      downloadShareCardBtn.style.opacity = '0.5';
      downloadShareCardBtn.style.pointerEvents = 'none';
    }

    generateShareCard(activeAchievement, currentStyle, (dataUrl) => {
      if (shareCardPreview) {
        shareCardPreview.src = dataUrl;
        shareCardPreview.style.display = 'flex';
      }
      if (downloadShareCardBtn) {
        downloadShareCardBtn.href = dataUrl;
        const slug = String(activeAchievement.title || 'trophy')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-');
        downloadShareCardBtn.download = `flexcard-${slug}.png`;
        downloadShareCardBtn.style.opacity = '1';
        downloadShareCardBtn.style.pointerEvents = 'auto';
      }
      if (shareLoader) shareLoader.style.display = 'none';
    });
  };

  const open = (achievement) => {
    activeAchievement = achievement;
    currentStyle = 'brutalist';

    // Reset active button
    styleOptBtns?.forEach((btn) => {
      if (btn.getAttribute('data-style') === 'brutalist') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (shareModal) shareModal.style.display = 'flex';
    updateCard();
  };

  const close = () => {
    if (shareModal) shareModal.style.display = 'none';
    activeAchievement = null;
  };

  // Bind template selector buttons
  styleOptBtns?.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      styleOptBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentStyle = btn.getAttribute('data-style') || 'brutalist';
      updateCard();
    });
  });

  if (closeShareModalBtn) {
    closeShareModalBtn.addEventListener('click', close);
  }

  window.addEventListener('click', (e) => {
    if (e.target === shareModal) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && shareModal && shareModal.style.display !== 'none') {
      close();
    }
  });

  return { open, close };
}
