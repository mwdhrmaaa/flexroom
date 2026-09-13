import { compressImage } from '../upload/image_compressor.js';

/**
 * Initializes and manages the Upload Achievement Modal.
 * @param {object} elements
 * @param {(payload: object) => void} onSubmitCallback
 * @returns {{ open: () => void, close: () => void }}
 */
export function initUploadModal(elements, onSubmitCallback) {
  const {
    modal,
    openBtn,
    closeBtn,
    form,
    fileInput,
    dropzone,
    uploadPlaceholder,
    uploadPreview,
    previewImg,
    removePreviewBtn,
    imageHiddenInput
  } = elements;

  const resetUploadState = () => {
    if (fileInput) fileInput.value = '';
    if (imageHiddenInput) imageHiddenInput.value = '';
    if (previewImg) previewImg.src = '';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
    if (uploadPreview) uploadPreview.style.display = 'none';
  };

  const open = () => {
    if (modal) modal.style.display = 'flex';
  };

  const close = () => {
    if (modal) modal.style.display = 'none';
    if (form) form.reset();
    resetUploadState();
  };

  // Wire file handling
  const handleSelectedFile = async (file) => {
    if (!file) return;
    try {
      const compressedDataUrl = await compressImage(file, 800, 0.7);
      if (imageHiddenInput) imageHiddenInput.value = compressedDataUrl;
      if (previewImg) previewImg.src = compressedDataUrl;
      if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
      if (uploadPreview) uploadPreview.style.display = 'flex';
    } catch (error) {
      alert(error.message || 'Failed to process image.');
    }
  };

  // Dropzone interactions
  if (dropzone) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== removePreviewBtn && fileInput) {
        fileInput.click();
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer?.files?.[0]) {
        handleSelectedFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files?.[0]) {
        handleSelectedFile(e.target.files[0]);
      }
    });
  }

  if (removePreviewBtn) {
    removePreviewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetUploadState();
    });
  }

  // Open & close triggers
  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  window.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display !== 'none') {
      close();
    }
  });

  // Form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        id: Date.now(),
        game: form.querySelector('#game')?.value || '',
        title: form.querySelector('#title')?.value || '',
        description: form.querySelector('#description')?.value || '',
        image: imageHiddenInput?.value || ''
      };
      onSubmitCallback(payload);
      close();
    });
  }

  return { open, close };
}
