document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('uploadModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('uploadForm');
    const achievementsGrid = document.getElementById('achievementsGrid');

    // Default empty data
    const defaultAchievements = [];

    // One-time clear of old mock achievements to start completely fresh
    if (!localStorage.getItem('flexroom_fresh_start_v1')) {
        localStorage.removeItem('flexroom_achievements');
        localStorage.setItem('flexroom_fresh_start_v1', 'true');
    }

    // Load from localStorage safely
    let achievements = [];
    try {
        const stored = localStorage.getItem('flexroom_achievements');
        if (stored) {
            achievements = JSON.parse(stored);
            if (!Array.isArray(achievements)) {
                achievements = [];
            }
        } else {
            localStorage.setItem('flexroom_achievements', JSON.stringify([]));
        }
    } catch (e) {
        console.error('Error accessing localStorage:', e);
        achievements = [];
    }

    // Render a single card HTML
    const createCardHTML = (achievement) => {
        const imageHTML = achievement.image ? `
            <div class="card-image-container">
                <img src="${achievement.image}" alt="${achievement.title}" class="card-image" onerror="this.onerror=null; this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'" />
            </div>` : '';

        const shareBtnHTML = achievement.image ? `
            <button class="btn btn-outline share-btn" onclick="alert('Share link copied to clipboard!')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
            </button>` : '';

        const deleteBtnHTML = `
            <button class="btn btn-outline delete-btn" data-id="${achievement.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
            </button>
        `;

        return `
        <div class="achievement-card glass animate-fade-in" data-id="${achievement.id}">
            ${imageHTML}
            <div class="card-content">
                <div class="card-header">
                    <h3 class="game-title">${achievement.game}</h3>
                    <span class="date">${achievement.date}</span>
                </div>
                <h2 class="achievement-title text-gradient">${achievement.title}</h2>
                <p class="description">${achievement.description}</p>
                <div class="card-actions">
                    ${shareBtnHTML}
                    ${deleteBtnHTML}
                </div>
            </div>
        </div>
        `;
    };

    // Initial render
    const renderAchievements = () => {
        achievementsGrid.innerHTML = '';
        
        // Render achievements
        achievements.forEach(ach => {
            achievementsGrid.insertAdjacentHTML('beforeend', createCardHTML(ach));
        });

        // Calculate empty slots needed:
        // - If less than 3 achievements, pad up to 3 boxes total.
        // - If 3 or more achievements, always append exactly 1 new empty box.
        const emptySlots = achievements.length < 3 ? 3 - achievements.length : 1;
        for (let i = 0; i < emptySlots; i++) {
            achievementsGrid.insertAdjacentHTML('beforeend', `
                <div class="achievement-card glass add-card animate-fade-in open-modal-card">
                    <div class="plus-sign">+</div>
                </div>
            `);
        }

        // Reattach event listeners for ALL the new add cards
        document.querySelectorAll('.open-modal-card').forEach(card => {
            card.addEventListener('click', () => {
                modal.style.display = 'flex';
            });
        });

        // Reattach event listeners for delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                deleteAchievement(id);
            });
        });
    };

    // Delete an achievement
    const deleteAchievement = (id) => {
        if (confirm('Are you sure you want to delete this achievement?')) {
            achievements = achievements.filter(ach => ach.id !== id);
            localStorage.setItem('flexroom_achievements', JSON.stringify(achievements));
            renderAchievements();
        }
    };

    // File Upload Elements
    const fileInput = document.getElementById('imageFile');
    const dropzone = document.getElementById('uploadDropzone');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const removePreviewBtn = document.getElementById('removePreviewBtn');
    const imageHiddenInput = document.getElementById('image');

    // Trigger file click when clicking dropzone
    if (dropzone) {
        dropzone.addEventListener('click', (e) => {
            if (e.target !== removePreviewBtn) {
                fileInput.click();
            }
        });

        // Drag & drop support
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
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
            }
        });
    }

    if (removePreviewBtn) {
        removePreviewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetUpload();
        });
    }

    // Helper to handle and compress the file
    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Compress image using canvas
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 800; // Premium compression dimension

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed jpeg data URL (0.7 quality)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                // Set input value and preview
                imageHiddenInput.value = compressedDataUrl;
                previewImg.src = compressedDataUrl;
                uploadPlaceholder.style.display = 'none';
                uploadPreview.style.display = 'flex';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const resetUpload = () => {
        if (fileInput) fileInput.value = '';
        if (imageHiddenInput) imageHiddenInput.value = '';
        if (previewImg) previewImg.src = '';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
        if (uploadPreview) uploadPreview.style.display = 'none';
    };

    renderAchievements();

    // Open Modal fallback if openBtn exists (we removed it from header but keeping logic just in case)
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newAchievement = {
            id: Date.now(),
            game: document.getElementById('game').value,
            title: document.getElementById('title').value,
            image: document.getElementById('image').value,
            description: document.getElementById('description').value,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        };

        // Prepend to array
        achievements.unshift(newAchievement);
        
        // Save to localStorage
        localStorage.setItem('flexroom_achievements', JSON.stringify(achievements));

        // Re-render to maintain the Add Card at the beginning
        renderAchievements();
        
        // Reset and close
        form.reset();
        resetUpload();
        modal.style.display = 'none';
    });
});
