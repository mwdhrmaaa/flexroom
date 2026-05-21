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

            // Draw square grid overlay
            ctx.strokeStyle = 'rgba(213, 255, 64, 0.04)';
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

            // Draw faint binary/hex streams in the background grid (hiasan rame)
            ctx.fillStyle = 'rgba(213, 255, 64, 0.015)';
            ctx.font = '700 8px "Courier New", monospace';
            ctx.textAlign = 'left';
            for (let col = 40; col < 800; col += 120) {
                for (let row = 40; row < 1000; row += 35) {
                    const fakeHex = '0x' + Math.floor(Math.random() * 256).toString(16).toUpperCase();
                    ctx.fillText(fakeHex, col + 5, row - 5);
                }
            }

            // Faint intersection coordinates (hiasan rame)
            ctx.fillStyle = 'rgba(213, 255, 64, 0.03)';
            for (let x = 160; x < 800; x += 160) {
                for (let y = 160; y < 1000; y += 160) {
                    ctx.fillText(`${x},${y}`, x + 4, y - 4);
                }
            }

            // Outer lime border
            ctx.strokeStyle = '#d5ff40';
            ctx.lineWidth = 4;
            ctx.strokeRect(20, 20, 760, 960);

            // Tiny border tech labels (hiasan rame)
            ctx.fillStyle = '#d5ff40';
            ctx.font = '700 8px "Courier New", monospace';
            ctx.fillText('[ SECURE_LOG_SYS ]', 30, 16);
            ctx.fillText('[ CORE_LOC: 0x9AF0 ]', 350, 16);
            ctx.fillText('[ RENDER_MODE: TACTICAL ]', 590, 16);
            ctx.fillText('[ STATUS: STABLE ]', 30, 989);
            ctx.fillText('[ END_OF_CORE ]', 680, 989);

            // Cross indicators
            ctx.fillStyle = '#d5ff40';
            ctx.font = '700 16px "Courier New", monospace';
            ctx.fillText('+', 40, 45);
            ctx.fillText('+', 750, 45);
            ctx.fillText('+', 40, 950);
            ctx.fillText('+', 750, 950);

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

            // Brand Title (Moved slightly higher)
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 48px "Poppins", sans-serif';
            ctx.fillText('FLEXCARD', 400, 95);

            // Subtitle
            ctx.font = '700 11px "Courier New", monospace';
            ctx.fillStyle = '#d5ff40';
            ctx.fillText('// CORE COLLECTIBLE VER.01 // SYSTEMATIC.AUTHENTIC', 400, 120);

            // Top technical stat columns
            ctx.strokeStyle = 'rgba(213, 255, 64, 0.3)';
            ctx.lineWidth = 1;
            // Box 1
            ctx.strokeRect(50, 132, 210, 22);
            ctx.font = '700 9px "Courier New", monospace';
            ctx.fillStyle = '#d5ff40';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('MEM_BANK: 0x8F993A [OK]', 155, 144);

            // Box 2
            ctx.strokeRect(295, 132, 210, 22);
            ctx.fillText('CORE_USAGE: 89.2% [NORM]', 400, 144);

            // Box 3
            ctx.strokeRect(540, 132, 210, 22);
            ctx.fillText('NET_CONN: ACTIVE_EST', 645, 144);

            // Separator
            ctx.strokeStyle = '#d5ff40';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, 168);
            ctx.lineTo(750, 168);
            ctx.stroke();

            // Rotated Technical Spec Sidebar (hiasan)
            ctx.save();
            ctx.translate(782, 500);
            ctx.rotate(Math.PI / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(213, 255, 64, 0.35)';
            ctx.font = '700 9px "Courier New", monospace';
            ctx.fillText('SYS.LOC.FLXRM // STABLE_SYS_INIT_0x99F', 0, 0);
            ctx.restore();

            // Dot-matrix decoration top-left of grid
            ctx.fillStyle = 'rgba(213, 255, 64, 0.4)';
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    ctx.fillRect(52 + c * 8, 172 + r * 8, 3, 3);
                }
            }

            // Screenshot frame maximum bounds
            const frameX = 50;
            const frameY = 180;
            const frameW = 700;
            const frameH = 430;

            const renderBrutalistTextAndFooter = (fX, fY, fW, fH) => {
                ctx.textBaseline = 'middle';
                
                // Sharp border (exactly around active image container size)
                ctx.strokeStyle = '#d5ff40';
                ctx.lineWidth = 4;
                ctx.strokeRect(fX, fY, fW, fH);

                // Brutalist corner target brackets (exactly around active image container size)
                ctx.strokeStyle = '#d5ff40';
                ctx.lineWidth = 2;
                const bSize = 15;
                // Top-left
                ctx.beginPath(); ctx.moveTo(fX - 6, fY - 6 + bSize); ctx.lineTo(fX - 6, fY - 6); ctx.lineTo(fX - 6 + bSize, fY - 6); ctx.stroke();
                // Top-right
                ctx.beginPath(); ctx.moveTo(fX + fW + 6 - bSize, fY - 6); ctx.lineTo(fX + fW + 6, fY - 6); ctx.lineTo(fX + fW + 6, fY - 6 + bSize); ctx.stroke();
                // Bottom-left
                ctx.beginPath(); ctx.moveTo(fX - 6, fY + fH + 6 - bSize); ctx.lineTo(fX - 6, fY + fH + 6); ctx.lineTo(fX - 6 + bSize, fY + fH + 6); ctx.stroke();
                // Bottom-right
                ctx.beginPath(); ctx.moveTo(fX + fW + 6 - bSize, fY + fH + 6); ctx.lineTo(fX + fW + 6, fY + fH + 6); ctx.lineTo(fX + fW + 6, fY + fH + 6 - bSize); ctx.stroke();

                // Top-right coordinates box
                ctx.fillStyle = 'rgba(213, 255, 64, 0.15)';
                ctx.fillRect(fX + fW - 140, fY + 10, 130, 24);
                ctx.strokeStyle = '#d5ff40';
                ctx.lineWidth = 1;
                ctx.strokeRect(fX + fW - 140, fY + 10, 130, 24);
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#d5ff40';
                ctx.font = '700 9px "Courier New", monospace';
                ctx.fillText('X_36.17 // Y_-86.76', fX + fW - 75, fY + 22);
                
                // Screenshot frame HUD overlay texts (drawn on top of the screenshot image)
                ctx.textAlign = 'left';
                ctx.fillStyle = '#d5ff40';
                ctx.font = '700 9px "Courier New", monospace';
                ctx.fillText('REC [●]  C_SYS_01 // 60FPS', fX + 15, fY + 22);
                ctx.fillText('FOV_90 // OPT_LENS_50MM', fX + 15, fY + fH - 18);
                ctx.textAlign = 'right';
                ctx.fillText('P_LAT: 14MS // STB_LVL_0.98', fX + fW - 15, fY + fH - 18);

                // Center crosshair inside screenshot frame
                ctx.strokeStyle = 'rgba(213, 255, 64, 0.45)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(fX + fW/2, fY + fH/2, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(fX + fW/2 - 18, fY + fH/2); ctx.lineTo(fX + fW/2 - 4, fY + fH/2);
                ctx.moveTo(fX + fW/2 + 4, fY + fH/2); ctx.lineTo(fX + fW/2 + 18, fY + fH/2);
                ctx.moveTo(fX + fW/2, fY + fH/2 - 18); ctx.lineTo(fX + fW/2, fY + fH/2 - 4);
                ctx.moveTo(fX + fW/2, fY + fH/2 + 4); ctx.lineTo(fX + fW/2, fY + fH/2 + 18);
                ctx.stroke();

                // Rotated Technical Spec Sidebar Left (hiasan)
                ctx.save();
                ctx.translate(18, 500);
                ctx.rotate(-Math.PI / 2);
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(213, 255, 64, 0.35)';
                ctx.font = '700 9px "Courier New", monospace';
                ctx.fillText('UNIT_HASH_ID: 0xFD89A2 // TYPE: HARDWARE_MEM', 0, 0);
                ctx.restore();

                // Game Title
                ctx.textAlign = 'left';
                ctx.fillStyle = '#d5ff40';
                ctx.font = '800 24px "Poppins", sans-serif';
                ctx.fillText('// ' + ach.game.toUpperCase(), 60, 650);

                // Date
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ffffff';
                ctx.font = '700 16px "Courier New", monospace';
                ctx.fillText('DATE_ ' + ach.date.replace(/-/g, '.'), 740, 650);

                // Achievement Title
                ctx.textAlign = 'left';
                ctx.fillStyle = '#ffffff';
                ctx.font = '900 44px "Poppins", sans-serif';
                ctx.fillText(ach.title.toUpperCase(), 60, 715);

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

                wrapText(ach.description.toUpperCase(), 60, 775, 450, 26);

                // Tactical RPG Stat Table (hiasan)
                ctx.strokeStyle = 'rgba(213, 255, 64, 0.4)';
                ctx.lineWidth = 1;
                ctx.strokeRect(530, 762, 210, 115);
                
                // Header line for stats
                ctx.fillStyle = 'rgba(213, 255, 64, 0.1)';
                ctx.fillRect(530, 762, 210, 20);
                ctx.fillStyle = '#d5ff40';
                ctx.font = '800 9px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('// HARDWARE_SPECS_SYS', 635, 772);

                // Stat entries
                ctx.font = '700 9px "Courier New", monospace';
                const stats = [
                    { label: 'RARITY', val: 'MYTHIC_V.01' },
                    { label: 'INTELLIGENCE', val: '95.4 / 100' },
                    { label: 'CALIBRATION', val: '88.1 / 100' },
                    { label: 'STABILITY', val: '99.9%' }
                ];
                stats.forEach((s, idx) => {
                     const sy = 798 + idx * 20;
                     ctx.textAlign = 'left';
                     ctx.fillStyle = '#c0c2b8';
                     ctx.fillText(s.label, 540, sy);
                     ctx.textAlign = 'right';
                     ctx.fillStyle = '#d5ff40';
                     ctx.fillText(s.val, 730, sy);
                });

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

                    // Draw frame background exactly fitting image aspect ratio
                    ctx.fillStyle = '#1b1e15';
                    ctx.fillRect(drawX, drawY, drawW, drawH);

                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                    renderBrutalistTextAndFooter(drawX, drawY, drawW, drawH);
                };
                img.onerror = () => {
                    ctx.fillStyle = '#1b1e15';
                    ctx.fillRect(frameX, frameY, frameW, frameH);
                    renderBrutalistTextAndFooter(frameX, frameY, frameW, frameH);
                };
                img.src = ach.image;
            } else {
                ctx.fillStyle = '#1b1e15';
                ctx.fillRect(frameX, frameY, frameW, frameH);
                renderBrutalistTextAndFooter(frameX, frameY, frameW, frameH);
            }

        } else if (style === 'neon') {
            // Draw Crimson Glow card (inspired by high-tech agent AI theme)
            ctx.fillStyle = '#060608';
            ctx.fillRect(0, 0, 800, 1000);

            // Draw a subtle dot grid in the background (hiasan)
            ctx.fillStyle = 'rgba(255, 62, 62, 0.08)';
            for (let dx = 40; dx < 760; dx += 60) {
                for (let dy = 40; dy < 960; dy += 60) {
                    ctx.beginPath();
                    ctx.arc(dx, dy, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw thick ambient radial glow (Crimson Red Aura)
            const glow = ctx.createRadialGradient(400, 400, 50, 400, 450, 600);
            glow.addColorStop(0, 'rgba(255, 30, 30, 0.22)'); // Intense Crimson Red center aura
            glow.addColorStop(0.5, 'rgba(22, 10, 10, 0.05)');
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, 800, 1000);

            // Draw abstract glowing wave curves in background (hiasan)
            ctx.strokeStyle = 'rgba(255, 62, 62, 0.04)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 350);
            ctx.bezierCurveTo(200, 250, 400, 550, 800, 450);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 400);
            ctx.bezierCurveTo(250, 330, 350, 530, 800, 470);
            ctx.stroke();

            // Draw large circular radar/compass rings (hiasan)
            ctx.strokeStyle = 'rgba(255, 62, 62, 0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(650, 350, 160, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(650, 350, 100, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.arc(650, 350, 45, 0, Math.PI * 2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(650 - 180, 350); ctx.lineTo(650 + 180, 350); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(650, 350 - 180); ctx.lineTo(650, 350 + 180); ctx.stroke();            // Outer Crimson border
            ctx.strokeStyle = '#ff3e3e';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, 760, 960);
            
            // Outer corner alignment widgets (hiasan rame)
            ctx.strokeStyle = 'rgba(255, 62, 62, 0.4)';
            ctx.lineWidth = 1;
            // Top-left corner
            ctx.strokeRect(30, 30, 16, 16);
            ctx.beginPath(); ctx.moveTo(38, 30); ctx.lineTo(38, 46); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(30, 38); ctx.lineTo(46, 38); ctx.stroke();
            ctx.fillStyle = '#ff8080';
            ctx.font = '700 8px "Courier New", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('SYS_LOC: 0x9A', 52, 38);
            ctx.fillText('LATENCY: 0.03ms', 52, 47);

            // Top-right corner
            ctx.strokeRect(754, 30, 16, 16);
            ctx.beginPath(); ctx.moveTo(762, 30); ctx.lineTo(762, 46); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(754, 38); ctx.lineTo(770, 38); ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText('SYS_CORE: v0.9', 744, 38);
            ctx.fillText('TEMP: 27.2K', 744, 47);

            // Bottom-left corner
            ctx.strokeRect(30, 954, 16, 16);
            ctx.beginPath(); ctx.moveTo(38, 954); ctx.lineTo(38, 970); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(30, 962); ctx.lineTo(46, 962); ctx.stroke();
            ctx.textAlign = 'left';
            ctx.fillText('SECURE_ENV: PASS', 52, 963);

            // Bottom-right corner
            ctx.strokeRect(754, 954, 16, 16);
            ctx.beginPath(); ctx.moveTo(762, 954); ctx.lineTo(762, 970); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(754, 962); ctx.lineTo(770, 962); ctx.stroke();
            ctx.textAlign = 'right';
            ctx.fillText('HASH: 0x7F23D', 744, 963);

            // Inner muted border
            ctx.strokeStyle = 'rgba(255, 62, 62, 0.12)';
            ctx.lineWidth = 1;
            ctx.strokeRect(26, 26, 748, 948);

            // Micro tech ticker data along bottom border (hiasan rame)
            ctx.fillStyle = 'rgba(255, 62, 62, 0.25)';
            ctx.font = '600 7px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('▲ ▼ SYSTEM LOG // ARCHIVE INDEXER ACTIVE // ❖ ⧇ ⧈ ⧉ ⧊ ⧋ ⧌ // SECURE NETWORK PORT 443 [OK]', 400, 980);

            // Header branding
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Brand Title (Glowing Crimson)
            ctx.font = '800 32px "Poppins", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ff3e3e';
            ctx.shadowBlur = 15;
            ctx.fillText('FLEXCARD', 400, 70);
            ctx.shadowBlur = 0; // Reset shadow

            // Micro wave frequency next to title (hiasan rame)
            ctx.strokeStyle = 'rgba(255, 62, 62, 0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let gx = 0; gx < 50; gx += 4) {
                const gy = 70 + Math.sin(gx * 0.2) * 6 + Math.random() * 2;
                if (gx === 0) ctx.moveTo(225 + gx, gy);
                else ctx.lineTo(225 + gx, gy);
            }
            ctx.stroke();

            // Subtitle
            ctx.font = '600 14px "Poppins", sans-serif';
            ctx.fillStyle = '#a5a6a9';
            ctx.fillText('LEGACY DIGITAL TROPHY', 400, 105);

            // Capsule badge at top right (hiasan)
            const badgeX = 570;
            const badgeY = 93;
            const badgeW = 170;
            const badgeH = 24;
            ctx.fillStyle = 'rgba(255, 62, 62, 0.08)';
            ctx.strokeStyle = 'rgba(255, 62, 62, 0.25)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
            ctx.fill();
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.fillStyle = '#ff8080';
            ctx.font = '700 9px "Courier New", monospace';
            ctx.fillText('SN: FLX-2026-CORE', badgeX + badgeW/2, badgeY + badgeH/2 + 1);

            // Decorative horizontal line
            ctx.strokeStyle = 'rgba(255, 62, 62, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(100, 130);
            ctx.lineTo(700, 130);
            ctx.stroke();

            // Screenshot frame maximum bounds
            const frameX = 50;
            const frameY = 160;
            const frameW = 700;
            const frameH = 430;

            const renderNeonTextAndFooter = (fX, fY, fW, fH) => {
                ctx.textBaseline = 'middle';

                // Draw frame border (exactly around active image size)
                ctx.strokeStyle = '#e04343ff';
                ctx.lineWidth = 4;
                ctx.strokeRect(fX, fY, fW, fH);
                
                // Screenshot frame HUD overlay texts (drawn on top of the screenshot image)
                ctx.textAlign = 'left';
                ctx.fillStyle = '#ff8080';
                ctx.font = '600 9px "Poppins", sans-serif';
                ctx.fillText('[ SCANNING SOURCE_FILE ]', fX + 15, fY + 22);
                ctx.textAlign = 'right';
                ctx.fillText('MATRIX_ACTIVE_V.09', fX + fW - 15, fY + 22);

                // Scanning laser line across the middle of the frame (hiasan)
                ctx.strokeStyle = 'rgba(255, 62, 62, 0.28)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(fX, fY + fH/2 + 25);
                ctx.lineTo(fX + fW, fY + fH/2 + 25);
                ctx.stroke();

                // Corner crosshairs inside the screenshot frame corners (hiasan)
                ctx.strokeStyle = 'rgba(255, 62, 62, 0.4)';
                ctx.lineWidth = 1;
                const cL = 10;
                // Top-left
                ctx.beginPath(); ctx.moveTo(fX + 10, fY + 10 + cL); ctx.lineTo(fX + 10, fY + 10); ctx.lineTo(fX + 10 + cL, fY + 10); ctx.stroke();
                // Top-right
                ctx.beginPath(); ctx.moveTo(fX + fW - 10 - cL, fY + 10); ctx.lineTo(fX + fW - 10, fY + 10); ctx.lineTo(fX + fW - 10, fY + 10 + cL); ctx.stroke();
                // Bottom-left
                ctx.beginPath(); ctx.moveTo(fX + 10, fY + fH - 10 - cL); ctx.lineTo(fX + 10, fY + fH - 10); ctx.lineTo(fX + 10 + cL, fY + fH - 10); ctx.stroke();
                // Bottom-right
                ctx.beginPath(); ctx.moveTo(fX + fW - 10 - cL, fY + fH - 10); ctx.lineTo(fX + fW - 10, fY + fH - 10); ctx.lineTo(fX + fW - 10, fY + fH - 10 - cL); ctx.stroke();

                // Rotated Spec Sidebar Right (hiasan)
                ctx.save();
                ctx.translate(782, 500);
                ctx.rotate(Math.PI / 2);
                ctx.textAlign = 'center';
                ctx.fillStyle = 'rgba(255, 62, 62, 0.35)';
                ctx.font = '600 9px "Poppins", sans-serif';
                ctx.fillText('CORE_DB_ARCHIVE_FILE_7493A_REV_02', 0, 0);
                ctx.restore();

                // Game title
                ctx.textAlign = 'left';
                ctx.fillStyle = '#ff3e3e';
                ctx.font = '800 24px "Poppins", sans-serif';
                ctx.shadowColor = '#ff3e3e';
                ctx.shadowBlur = 8;
                ctx.fillText(ach.game.toUpperCase(), 60, 640);
                ctx.shadowBlur = 0;

                // Date
                ctx.textAlign = 'right';
                ctx.fillStyle = '#a5a6a9';
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

                wrapText(ach.description, 60, 770, 450, 28);

                // Hologram Stats Widget (hiasan)
                ctx.strokeStyle = 'rgba(255, 62, 62, 0.25)';
                ctx.lineWidth = 1;
                ctx.strokeRect(530, 762, 210, 115);
                
                // Header line
                ctx.fillStyle = 'rgba(255, 62, 62, 0.08)';
                ctx.fillRect(530, 762, 210, 20);
                ctx.fillStyle = '#ff8080';
                ctx.font = '600 9px "Poppins", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('DATABASE ARCHIVE OVERLAY', 635, 772);

                // Progress bars
                const neonStats = [
                    { name: 'SYNC RATIO', val: 94, unit: '%' },
                    { name: 'STABILITY', val: 89, unit: '%' },
                    { name: 'INDEX TEMP', val: 42, unit: '°C' }
                ];
                neonStats.forEach((ns, idx) => {
                    const sy = 804 + idx * 25;
                    
                    // Label
                    ctx.textAlign = 'left';
                    ctx.fillStyle = '#a5a6a9';
                    ctx.font = '600 9px "Poppins", sans-serif';
                    ctx.fillText(ns.name, 540, sy);
                    
                    // Val text
                    ctx.textAlign = 'right';
                    ctx.fillStyle = '#ff3e3e';
                    ctx.fillText(ns.val + ns.unit, 730, sy);
                    
                    // Progress bar background
                    ctx.fillStyle = 'rgba(255, 62, 62, 0.1)';
                    ctx.fillRect(540, sy + 5, 180, 4);
                    
                    // Filled progress bar (glowing)
                    ctx.fillStyle = '#ff3e3e';
                    ctx.shadowColor = '#ff3e3e';
                    ctx.shadowBlur = 4;
                    ctx.fillRect(540, sy + 5, (180 * ns.val) / 100, 4);
                    ctx.shadowBlur = 0; // Reset
                });

                // Rating Diamond Badges (inspired by AgentAI star/dots)
                ctx.fillStyle = '#ff3e3e';
                ctx.shadowColor = '#ff3e3e';
                ctx.shadowBlur = 6;
                for (let s = 0; s < 5; s++) {
                    ctx.beginPath();
                    const sx = 60 + s * 16;
                    const sy = 862;
                    ctx.moveTo(sx, sy - 5);
                    ctx.lineTo(sx + 4, sy);
                    ctx.lineTo(sx, sy + 5);
                    ctx.lineTo(sx - 4, sy);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.shadowBlur = 0; // Reset

                // Tier text next to diamonds
                ctx.textAlign = 'left';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.font = '600 11px "Poppins", sans-serif';
                ctx.fillText('VERIFIED LEGACY COLLECTIBLE', 150, 862);

                // Decorative separator
                ctx.strokeStyle = 'rgba(255, 62, 62, 0.12)';
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
                
                ctx.fillStyle = 'rgba(255, 62, 62, 0.5)';
                ctx.font = '500 12px "Poppins", sans-serif';
                ctx.fillText('flexroom.github.io', 400, 955);

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

                    // Crimson backlit aura exactly behind the screenshot size (hiasan)
                    const frameGlow = ctx.createRadialGradient(drawX + drawW/2, drawY + drawH/2, 50, drawX + drawW/2, drawY + drawH/2, 350);
                    frameGlow.addColorStop(0, 'rgba(255, 30, 30, 0.25)');
                    frameGlow.addColorStop(0.5, 'rgba(255, 30, 30, 0.03)');
                    frameGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = frameGlow;
                    ctx.fillRect(drawX - 50, drawY - 50, drawW + 100, drawH + 100);

                    // Draw frame background exactly matching the active image container size
                    ctx.fillStyle = 'rgba(22, 10, 10, 0.75)';
                    ctx.fillRect(drawX, drawY, drawW, drawH);

                    ctx.drawImage(img, drawX, drawY, drawW, drawH);
                    
                    // Draw a subtle red tint overlay on top of the image to blend it with Crimson Glow
                    ctx.fillStyle = 'rgba(255, 30, 30, 0.08)';
                    ctx.fillRect(drawX, drawY, drawW, drawH);

                    renderNeonTextAndFooter(drawX, drawY, drawW, drawH);
                };
                img.onerror = () => {
                    ctx.fillStyle = 'rgba(22, 10, 10, 0.9)';
                    ctx.fillRect(frameX, frameY, frameW, frameH);
                    renderNeonTextAndFooter(frameX, frameY, frameW, frameH);
                };
                img.src = ach.image;
            } else {
                ctx.fillStyle = 'rgba(22, 10, 10, 0.9)';
                ctx.fillRect(frameX, frameY, frameW, frameH);
                renderNeonTextAndFooter(frameX, frameY, frameW, frameH);
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
