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
                <div class="card-image-overlay"></div>
            </div>` : '';

        const shareBtnHTML = `
            <button class="btn btn-outline share-btn" data-id="${achievement.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
                Share
            </button>
        `;

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

        // Reattach event listeners for share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.getAttribute('data-id'));
                const ach = achievements.find(a => a.id === id);
                if (ach) {
                    openShareModal(ach);
                }
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

    // Share modal variables
    const shareModal = document.getElementById('shareModal');
    const closeShareModalBtn = document.getElementById('closeShareModalBtn');
    const shareLoader = document.getElementById('shareLoader');
    const shareCardPreview = document.getElementById('shareCardPreview');
    const downloadShareCardBtn = document.getElementById('downloadShareCardBtn');

    // Close Share Modal
    if (closeShareModalBtn) {
        closeShareModalBtn.addEventListener('click', () => {
            shareModal.style.display = 'none';
        });
    }

    let activeAchievementForShare = null;
    let currentShareStyle = 'brutalist';

    // Style option click handlers
    const styleOptBtns = document.querySelectorAll('.style-opt-btn');
    styleOptBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;
            
            // Toggle active classes
            styleOptBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update style and regenerate
            currentShareStyle = btn.getAttribute('data-style');
            if (activeAchievementForShare) {
                regenerateShareCard();
            }
        });
    });

    const regenerateShareCard = () => {
        shareLoader.style.display = 'flex';
        shareCardPreview.style.display = 'none';
        downloadShareCardBtn.style.opacity = '0.5';
        downloadShareCardBtn.style.pointerEvents = 'none';

        generateShareCard(activeAchievementForShare, currentShareStyle, (dataUrl) => {
            shareCardPreview.src = dataUrl;
            downloadShareCardBtn.href = dataUrl;
            downloadShareCardBtn.download = `flexcard-${activeAchievementForShare.title.toLowerCase().replace(/\s+/g, '-')}.png`;
            
            shareLoader.style.display = 'none';
            shareCardPreview.style.display = 'flex';
            downloadShareCardBtn.style.opacity = '1';
            downloadShareCardBtn.style.pointerEvents = 'auto';
        });
    };

    const openShareModal = (ach) => {
        activeAchievementForShare = ach;
        shareModal.style.display = 'flex';
        
        // Reset active tab to brutalist when opening
        styleOptBtns.forEach(btn => {
            if (btn.getAttribute('data-style') === 'brutalist') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        currentShareStyle = 'brutalist';
        
        regenerateShareCard();
    };

    const generateShareCard = (ach, style, callback) => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');

        if (style === 'brutalist') {
            // Draw brutalist card
            ctx.fillStyle = '#12150d';
            ctx.fillRect(0, 0, 800, 1000);

            // Draw a heavy glowing aura background (Vignette + Center Glow)
            const ambientGlow = ctx.createRadialGradient(400, 500, 100, 400, 500, 700);
            ambientGlow.addColorStop(0, 'rgba(213, 255, 64, 0.15)'); // Rich glowing aura center
            ambientGlow.addColorStop(0.5, 'rgba(18, 21, 13, 0.5)');
            ambientGlow.addColorStop(1, 'rgba(6, 7, 4, 0.95)'); // Vignette borders
            ctx.fillStyle = ambientGlow;
            ctx.fillRect(0, 0, 800, 1000);

            // Draw square grid overlay
            ctx.strokeStyle = 'rgba(213, 255, 64, 0.05)';
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

            // Draw thick aura behind the screenshot frame (Eclipse effect)
            const frameGlow = ctx.createRadialGradient(400, 395, 100, 400, 395, 520);
            frameGlow.addColorStop(0, 'rgba(213, 255, 64, 0.45)'); // Heavy centered aura
            frameGlow.addColorStop(0.3, 'rgba(213, 255, 64, 0.2)');
            frameGlow.addColorStop(0.7, 'rgba(213, 255, 64, 0.03)');
            frameGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = frameGlow;
            ctx.fillRect(0, 150, 800, 500);

            // Outer lime border
            ctx.strokeStyle = '#d5ff40';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, 760, 960);

            // Cross indicators (with subtle glow)
            ctx.fillStyle = '#d5ff40';
            ctx.font = '700 16px "Courier New", monospace';
            ctx.shadowColor = '#d5ff40';
            ctx.shadowBlur = 8;
            ctx.fillText('+', 40, 45);
            ctx.fillText('+', 750, 45);
            ctx.fillText('+', 40, 950);
            ctx.fillText('+', 750, 950);
            ctx.shadowBlur = 0; // Reset shadow

            // Barcode top right
            ctx.fillStyle = '#ffffff';
            let startX = 580;
            let startY = 45;
            for (let i = 0; i < 22; i++) {
                let barWidth = (i % 5 === 0) ? 5 : (i % 3 === 0) ? 3 : (i % 2 === 0) ? 2 : 1;
                ctx.fillRect(startX, startY, barWidth, 30);
                startX += barWidth + Math.floor(Math.random() * 3) + 1;
            }

            // System rendering status indicator top-left
            ctx.textAlign = 'left';
            ctx.fillStyle = '#d5ff40';
            ctx.font = '700 11px "Courier New", monospace';
            ctx.fillText('> RENDER_SYS_OK', 60, 55);
            ctx.fillText('SYS_TIME: ' + new Date().toISOString().slice(11,19) + ' UTC', 60, 70);

            // Brand Title (Gacor Brand Glow)
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 48px "Poppins", sans-serif';
            ctx.shadowColor = '#d5ff40';
            ctx.shadowBlur = 30; // Heavy glow
            ctx.fillText('FLEXCARD', 400, 115);
            ctx.shadowBlur = 0; // Reset

            // Subtitle
            ctx.font = '700 12px "Courier New", monospace';
            ctx.fillStyle = '#d5ff40';
            ctx.fillText('// CORE COLLECTIBLE VER.01 // SYSTEMATIC.AUTHENTIC', 400, 145);

            // Separator
            ctx.strokeStyle = '#d5ff40';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, 160);
            ctx.lineTo(750, 160);
            ctx.stroke();

            // Screenshot frame
            const frameX = 50;
            const frameY = 180;
            const frameW = 700;
            const frameH = 430;

            // Draw frame background
            ctx.fillStyle = '#1b1e15';
            ctx.fillRect(frameX, frameY, frameW, frameH);

            // Sharp border (Make frame border glow)
            ctx.strokeStyle = '#d5ff40';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#d5ff40';
            ctx.shadowBlur = 15;
            ctx.strokeRect(frameX, frameY, frameW, frameH);
            ctx.shadowBlur = 0; // Reset

            // Top-right coordinates box
            ctx.fillStyle = 'rgba(213, 255, 64, 0.15)';
            ctx.fillRect(frameX + frameW - 140, frameY + 10, 130, 24);
            ctx.strokeStyle = '#d5ff40';
            ctx.lineWidth = 1;
            ctx.strokeRect(frameX + frameW - 140, frameY + 10, 130, 24);
            
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#d5ff40';
            ctx.font = '700 9px "Courier New", monospace';
            ctx.fillText('X_36.17 // Y_-86.76', frameX + frameW - 75, frameY + 22);

            const renderBrutalistTextAndFooter = () => {
                ctx.textBaseline = 'middle';
                // Game Title (Glowing)
                ctx.textAlign = 'left';
                ctx.fillStyle = '#d5ff40';
                ctx.font = '800 24px "Poppins", sans-serif';
                ctx.shadowColor = '#d5ff40';
                ctx.shadowBlur = 12;
                ctx.fillText('// ' + ach.game.toUpperCase(), 60, 650);
                ctx.shadowBlur = 0;

                // Date
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 16px "Courier New", monospace';
                ctx.fillText('DATE_ ' + ach.date.replace(/-/g, '.'), 740, 650);

                // Achievement Title (Glowing white text)
                ctx.textAlign = 'left';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 44px "Poppins", sans-serif';
                ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
                ctx.shadowBlur = 15;
                ctx.fillText(ach.title.toUpperCase(), 60, 715);
                ctx.shadowBlur = 0;

                // Description
                ctx.fillStyle = '#c0c2b8';
                ctx.font = '500 18px "Poppins", sans-serif';
                
                const wrapText = (text, x, y, maxWidth, lineHeight) => {
                    const words = text.split(' ');
                    let line = '';
                    let currentY = y;
                    for (let n = 0; n < words.length; n++) {
                        let testLine = line + words[n] + ' ';
                        let metrics = ctx.measureText(testLine);
                        let testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            ctx.fillText(line, x, currentY);
                            line = words[n] + ' ';
                            currentY += lineHeight;
                        } else {
                            line = testLine;
                        }
                    }
                    ctx.fillText(line, x, currentY);
                };

                wrapText(ach.description.toUpperCase(), 60, 775, 680, 26);

                // Decorative separator
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(50, 895);
                ctx.lineTo(750, 895);
                ctx.stroke();

                // Footer branding
                ctx.textAlign = 'center';
                ctx.fillStyle = '#d5ff40';
                ctx.font = '800 12px "Courier New", monospace';
                ctx.fillText('> ACCESS GRANTED // CORE_PRINCIPLES_OK <', 400, 930);

                // Bottom Hazard Stripes
                const stripeY = 952;
                const stripeH = 18;
                ctx.fillStyle = '#12150d';
                ctx.fillRect(25, stripeY, 750, stripeH);
                
                ctx.strokeStyle = '#d5ff40';
                ctx.lineWidth = 8;
                for (let sx = 20; sx < 780; sx += 20) {
                    ctx.beginPath();
                    ctx.moveTo(sx, stripeY);
                    ctx.lineTo(sx + 10, stripeY + stripeH);
                    ctx.stroke();
                }

                // Trigger callback
                callback(canvas.toDataURL('image/png'));
            };

            // Draw screenshot if exists
            if (ach.image) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const imgRatio = img.width / img.height;
                    const frameRatio = frameW / frameH;
                    
                    let drawW = frameW;
                    let drawH = frameH;
                    let drawX = frameX;
                    let drawY = frameY;

                    if (imgRatio > frameRatio) {
                        drawH = frameW / imgRatio;
                        drawY = frameY + (frameH - drawH) / 2;
                    } else {
                        drawW = frameH * imgRatio;
                        drawX = frameX + (frameW - drawW) / 2;
                    }

                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                    renderBrutalistTextAndFooter();
                };
                img.onerror = () => {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
                    ctx.fillRect(frameX, frameY, frameW, frameH);
                    renderBrutalistTextAndFooter();
                };
                img.src = ach.image;
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
                ctx.fillRect(frameX, frameY, frameW, frameH);
                renderBrutalistTextAndFooter();
            }

        } else if (style === 'neon') {
            // Draw neon card (current styling)
            ctx.fillStyle = '#0a0b0d';
            ctx.fillRect(0, 0, 800, 1000);

            // Draw ambient radial glow
            const glow = ctx.createRadialGradient(400, 300, 100, 400, 500, 600);
            glow.addColorStop(0, 'rgba(213, 255, 64, 0.12)'); // Lime glow
            glow.addColorStop(0.5, 'rgba(192, 194, 184, 0.04)'); // Muted silver glow
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, 800, 1000);

            // Outer lime border
            ctx.strokeStyle = '#d5ff40';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, 760, 960);
            
            // Inner muted border
            ctx.strokeStyle = 'rgba(213, 255, 64, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(26, 26, 748, 948);

            // Header branding
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Brand Title
            ctx.font = '800 32px "Poppins", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#d5ff40';
            ctx.shadowBlur = 10;
            ctx.fillText('FLEXCARD', 400, 70);
            ctx.shadowBlur = 0; // Reset shadow

            // Subtitle
            ctx.font = '600 14px "Poppins", sans-serif';
            ctx.fillStyle = '#c0c2b8';
            ctx.fillText('LEGACY DIGITAL TROPHY', 400, 105);

            // Decorative horizontal line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(100, 130);
            ctx.lineTo(700, 130);
            ctx.stroke();

            // Screenshot frame
            const frameX = 50;
            const frameY = 160;
            const frameW = 700;
            const frameH = 430;

            // Draw frame background
            ctx.fillStyle = 'rgba(19, 20, 24, 0.6)';
            ctx.fillRect(frameX, frameY, frameW, frameH);
            
            // Draw frame border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2;
            ctx.strokeRect(frameX, frameY, frameW, frameH);

            const renderNeonTextAndFooter = () => {
                ctx.textBaseline = 'middle';
                // Game title
                ctx.textAlign = 'left';
                ctx.fillStyle = '#d5ff40';
                ctx.font = '800 24px "Poppins", sans-serif';
                ctx.fillText(ach.game.toUpperCase(), 60, 640);

                // Date
                ctx.textAlign = 'right';
                ctx.fillStyle = '#c0c2b8';
                ctx.font = '500 16px "Poppins", sans-serif';
                ctx.fillText(ach.date, 740, 640);

                // Achievement Title
                ctx.textAlign = 'left';
                ctx.fillStyle = '#ffffff';
                ctx.font = '800 48px "Poppins", sans-serif';
                ctx.fillText(ach.title, 60, 705);

                // Description
                ctx.fillStyle = '#c0c2b8';
                ctx.font = '400 20px "Poppins", sans-serif';
                
                const wrapText = (text, x, y, maxWidth, lineHeight) => {
                    const words = text.split(' ');
                    let line = '';
                    let currentY = y;
                    for (let n = 0; n < words.length; n++) {
                        let testLine = line + words[n] + ' ';
                        let metrics = ctx.measureText(testLine);
                        let testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            ctx.fillText(line, x, currentY);
                            line = words[n] + ' ';
                            currentY += lineHeight;
                        } else {
                            line = testLine;
                        }
                    }
                    ctx.fillText(line, x, currentY);
                };

                wrapText(ach.description, 60, 770, 680, 28);

                // Decorative separator
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(50, 890);
                ctx.lineTo(750, 890);
                ctx.stroke();

                // Footer branding
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.font = '600 14px "Poppins", sans-serif';
                ctx.fillText('VERIFIED VIA FLEXROOM COLLECTIBLE SYSTEM', 400, 930);
                
                ctx.fillStyle = 'rgba(213, 255, 64, 0.4)';
                ctx.font = '500 12px "Poppins", sans-serif';
                ctx.fillText('flexroom.github.io', 400, 955);

                // Trigger callback
                callback(canvas.toDataURL('image/png'));
            };

            // Draw screenshot if exists
            if (ach.image) {
                const img = new Image();
                img.onload = () => {
                    const imgRatio = img.width / img.height;
                    const frameRatio = frameW / frameH;
                    
                    let drawW = frameW;
                    let drawH = frameH;
                    let drawX = frameX;
                    let drawY = frameY;

                    if (imgRatio > frameRatio) {
                        drawH = frameW / imgRatio;
                        drawY = frameY + (frameH - drawH) / 2;
                    } else {
                        drawW = frameH * imgRatio;
                        drawX = frameX + (frameW - drawW) / 2;
                    }

                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                    renderNeonTextAndFooter();
                };
                img.onerror = () => {
                    ctx.fillStyle = '#222';
                    ctx.fillRect(frameX, frameY, frameW, frameH);
                    renderNeonTextAndFooter();
                };
                img.src = ach.image;
            } else {
                renderNeonTextAndFooter();
            }
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
