document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('uploadModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('uploadForm');
    const achievementsGrid = document.getElementById('achievementsGrid');

    // Default empty data
    const defaultAchievements = [];

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
                </div>
            </div>
        </div>
        `;
    };

    // Initial render
    const renderAchievements = () => {
        achievementsGrid.innerHTML = '';
        
        // Ensure we only have max 3 achievements
        const displayAchievements = achievements.slice(0, 3);
        
        // Render achievements
        displayAchievements.forEach(ach => {
            achievementsGrid.insertAdjacentHTML('beforeend', createCardHTML(ach));
        });

        // Render empty slots to make total exactly 3
        const emptySlots = 3 - displayAchievements.length;
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
        
        // Ensure max 3
        if (achievements.length > 3) {
            achievements = achievements.slice(0, 3);
        }
        
        // Save to localStorage
        localStorage.setItem('flexroom_achievements', JSON.stringify(achievements));

        // Re-render to maintain the Add Card at the beginning
        renderAchievements();
        
        // Reset and close
        form.reset();
        modal.style.display = 'none';
    });
});
