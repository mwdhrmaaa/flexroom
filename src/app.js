import {
  getAllAchievements,
  saveAchievement,
  deleteAchievementById
} from './core/storage/achievement_storage.js';
import { renderAchievementGrid } from './features/achievements/achievement_grid.js';
import { initUploadModal } from './features/modals/upload_modal.js';
import { initShareModal } from './features/modals/share_modal.js';

document.addEventListener('DOMContentLoaded', () => {
  const achievementsGrid = document.getElementById('achievementsGrid');

  // Initialize Share Modal
  const shareModalManager = initShareModal({
    shareModal: document.getElementById('shareModal'),
    closeShareModalBtn: document.getElementById('closeShareModalBtn'),
    shareLoader: document.getElementById('shareLoader'),
    shareCardPreview: document.getElementById('shareCardPreview'),
    downloadShareCardBtn: document.getElementById('downloadShareCardBtn'),
    copyShareCardBtn: document.getElementById('copyShareCardBtn'),
    copyBtnText: document.getElementById('copyBtnText'),
    styleOptBtns: document.querySelectorAll('.style-opt-btn')
  });

  // State & Grid Refresh
  const refreshGrid = () => {
    const list = getAllAchievements();
    renderAchievementGrid(achievementsGrid, list, {
      onAdd: () => uploadModalManager.open(),
      onShare: (ach) => shareModalManager.open(ach),
      onDelete: (id) => {
        if (window.confirm('Are you sure you want to delete this achievement?')) {
          deleteAchievementById(id);
          refreshGrid();
        }
      }
    });
  };

  // Initialize Upload Modal
  const uploadModalManager = initUploadModal(
    {
      modal: document.getElementById('uploadModal'),
      openBtn: document.getElementById('openModalBtn'),
      closeBtn: document.getElementById('closeModalBtn'),
      form: document.getElementById('uploadForm'),
      fileInput: document.getElementById('imageFile'),
      dropzone: document.getElementById('uploadDropzone'),
      uploadPlaceholder: document.getElementById('uploadPlaceholder'),
      uploadPreview: document.getElementById('uploadPreview'),
      previewImg: document.getElementById('previewImg'),
      removePreviewBtn: document.getElementById('removePreviewBtn'),
      imageHiddenInput: document.getElementById('image')
    },
    (payload) => {
      saveAchievement(payload);
      refreshGrid();
    }
  );

  // Initial render
  refreshGrid();
});
