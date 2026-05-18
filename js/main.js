document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('uploadModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('uploadForm');
    const achievementsGrid = document.getElementById('achievementsGrid');

    // Default dummy data
    const defaultAchievements = [
        {
            id: 1,
            title: 'Elden Lord',
            game: 'Elden Ring',
            description: 'You have claimed the Elden Ring and become the Elden Lord. A true testament to your perseverance.',
            image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            rarity: 'Legendary',
            date: 'May 18, 2026'
        },
        {
            id: 2,
            title: 'Master of the Hunt',
            game: 'The Witcher 3',
            description: 'Defeated all the legendary beasts and collected every trophy across the Northern Realms.',
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            rarity: 'Epic',
            date: 'May 10, 2026'
        },
        {
            id: 3,
            title: 'Flawless Victory',
            game: 'Mortal Kombat 1',
            description: 'Won 50 online ranked matches in a row without losing a single round.',
            image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            rarity: 'Rare',
            date: 'Apr 22, 2026'
        }
    ];

    // Load from localStorage or use defaults
    let achievements = JSON.parse(localStorage.getItem('flexroom_achievements'));
    if (!achievements) {
        achievements = defaultAchievements;
        localStorage.setItem('flexroom_achievements', JSON.stringify(achievements));
    }

    // Render a single card HTML
    const createCardHTML = (achievement) => `
        <div class="achievement-card glass animate-fade-in" data-id="${achievement.id}">
            <div class="card-image-container">
                <img src="${achievement.image}" alt="${achievement.title}" class="card-image" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Not+Found'" />
                <div class="rarity-badge rarity-${achievement.rarity.toLowerCase()}">
                    ${achievement.rarity}
                </div>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3 class="game-title">${achievement.game}</h3>
                    <span class="date">${achievement.date}</span>
                </div>
                <h2 class="achievement-title text-gradient">${achievement.title}</h2>
                <p class="description">${achievement.description}</p>
                <div class="card-actions">
                    <button class="btn btn-outline share-btn" onclick="alert('Share link copied to clipboard!')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        Share
                    </button>
                </div>
            </div>
        </div>
    `;

    // Initial render
    const renderAchievements = () => {
        achievementsGrid.innerHTML = '';
        achievements.forEach(ach => {
            achievementsGrid.insertAdjacentHTML('beforeend', createCardHTML(ach));
        });
    };

    renderAchievements();

    // Open Modal
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

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
            rarity: document.getElementById('rarity').value,
            description: document.getElementById('description').value,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        };

        // Prepend to array
        achievements.unshift(newAchievement);
        
        // Save to localStorage
        localStorage.setItem('flexroom_achievements', JSON.stringify(achievements));

        // Add to DOM dynamically at the start
        achievementsGrid.insertAdjacentHTML('afterbegin', createCardHTML(newAchievement));
        
        // Reset and close
        form.reset();
        modal.style.display = 'none';
    });
});
