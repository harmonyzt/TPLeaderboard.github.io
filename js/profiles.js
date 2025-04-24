function openProfile(playerId) {
    const modal = document.getElementById('playerProfileModal');
    const modalContent = document.getElementById('modalPlayerInfo');

    modalContent.innerHTML = '';

    // If no id data-player-id="0" (shouldn't be happening)
    if (!playerId || playerId === '0') {
        showPrivateProfile(modalContent, "Unknown Player");
        modal.style.display = 'block';
        setupModalCloseHandlers(modal);
        return;
    }

    // Finding Player in data
    const player = leaderboardData.find(p => p.id === playerId);

    // Couldn't find
    if (!player) {
        showPrivateProfile(modalContent, "Player Not Found");
        modal.style.display = 'block';
        setupModalCloseHandlers(modal);
        return;
    }

    const isPublic = player.publicProfile === "true";

    // If disqualified
    if (player.disqualified === "true") {
        modal.style.display = 'block';
        showDisqualProfile(modalContent, player);
        setupModalCloseHandlers(modal, player);
        return;
    }

    // Privated profile
    if (!isPublic) {
        modal.style.display = 'block';
        showPrivateProfile(modalContent, player);
        setupModalCloseHandlers(modal, player);
        return;
    }

    // Showing public profile
    showPublicProfile(modalContent, player);
    modal.style.display = 'block';
    setupModalCloseHandlers(modal);
}

// Private profile HTML
function showPrivateProfile(container, player) {
    container.innerHTML = `
    <div class="profile-background">
      <div class="fake-stats-blurred">
        <div class="player-info-section">
          <img src="media/default_avatar.png" class="player-avatar" alt="${player.name}">
          <div class="player-status">
            <div class="status-indicator status-offline"></div>
            <span>Offline</span>
          </div>
          <h2 class="profile-player-name">${player.name}</h2>
          <div class="player-reg-date">
            <span class="reg-date-text">Registered: 2023.24.24</span>
          </div>
          <div class="player-about">I'm very evil person</div>
          <div class="badges-container">
            <div class="badge" title="Prestige $1">
              <img src="media/prestige1.png" width="40" height="40" alt="Prestige">
            </div>
          </div>
        </div>
        <div class="stats-section">
          <div class="player-stats-container">
            <div class="player-stat-block"><span>Level:</span><span>30</span></div>
            <div class="player-stat-block"><span>K/D:</span><span>5</span></div>
            <div class="player-stat-block"><span>Damage:</span><span>60000</span></div>
            <div class="player-stat-block"><span>Raids:</span><span>35</span></div>
            <div class="player-stat-block"><span>Survival:</span><span>37%</span></div>
            <div class="player-stat-block"><span>Longest Shot:</span><span>300m</span></div>
          </div>
        </div>
      </div>
      
      <div class="private-profile-overlay">
        <div class="private-profile-content">
          <div class="lock-icon">🔒</div>
          <h3>Private Profile</h3>
          <p>This player has chosen to keep their stats hidden</p>
          <div class="private-profile-hint">
            <span>Stats behind are simulated</span>
          </div>
        </div>
      </div>
    </div>

    `;
}

// Disqualified profile HTML
function showDisqualProfile(container, player) {
    container.innerHTML = `
    <div class="profile-background">
      <div class="fake-stats-blurred">
        <div class="player-info-section">
          <img src="media/default_avatar.png" class="player-avatar" alt="${player.name}">
          <div class="player-status">
            <div class="status-indicator status-offline"></div>
            <span>Offline</span>
          </div>
          <h2 class="profile-player-name">${player.name}</h2>
          <div class="player-reg-date">
            <span class="reg-date-text">Registered: 2023.24.24</span>
          </div>
          <div class="player-about">I'm very evil person</div>
          <div class="badges-container">
            <div class="badge" title="Prestige $1">
              <img src="media/prestige1.png" width="40" height="40" alt="Prestige">
            </div>
          </div>
        </div>
        <div class="stats-section">
          <div class="player-stats-container">
            <div class="player-stat-block">Level:<span>30</div>
            <div class="player-stat-block">K/D:<span>5</div>
            <div class="player-stat-block">Damage:<span>60000</div>
            <div class="player-stat-block">Raids:35</div>
            <div class="player-stat-block">Survival:37%</div>
            <div class="player-stat-block">Longest Shot:300m</div>
          </div>
        </div>
      </div>
      
      <div class="private-profile-overlay">
        <div class="private-profile-content">
          <div class="lock-icon">👻</div>
          <h3>Banned Profile</h3>
          <p>This player was banned. Huzzah!</p>
          <div class="private-profile-hint">
            <span>Stats behind are simulated</span>
          </div>
        </div>
      </div>
    </div>
    `;
}

// Public profile
function showPublicProfile(container, player) {
    const regDate = player.registrationDate
        ? new Date(player.registrationDate * 1000).toLocaleDateString('en-EN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown';

    // About me
    const aboutText = player.about && player.about.length <= 100
        ? player.about
        : 'Hey there! I am using SPT Leaderboard!';

    // Generate badges
    const badgesHTML = generateBadgesHTML(player);

    container.innerHTML = `
    <div class="profile-background">
      <div class="profile-content-overlay">
        <!-- Player Info Section -->
        <div class="player-info-section">
          <img src="${player.avatar || 'media/default_avatar.png'}" class="player-avatar" alt="${player.name}">

            <div class="player-status">
            <div class="status-indicator ${player.isOnline ? 'status-online' : 'status-offline'}"></div>
            <span>${player.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <h2 class="profile-player-name">${player.name}</h2>
                    <div class="player-reg-date">
            <span class="reg-date-text">Registered: ${regDate}</span>
          </div>
          <div class="player-about">${aboutText}</div>
          
          <!-- Badges Section -->
          <div class="badges-container">
            ${badgesHTML}
          </div>
        </div>
        
        <!-- Stats Section -->
        <div class="stats-section">
          <h3 class="player-profile-header">
            Player Statistics
          </h3>
          
          <div class="profile-tabs">
            <button class="profile-tab active" data-tab="pmc">PMC</button>
            <button class="profile-tab" data-tab="scav">SCAV</button>
            <button class="profile-tab" data-tab="lastraid">Last Raid</button>
          </div>
          
          <!-- PMC Stats -->
          <div class="player-stats-container" id="pmc-stats">
            <div class="player-stat-block">
              <span class="profile-stat-block">Level:</span>
              <span class="stat-block-value">${player.pmcLevel || 'N/A'}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">K/D Ratio:</span>
              <span class="stat-block-value">${player.killToDeathRatio || 'N/A'}</span>
            </div>
            
            ${player.damage ? `
              <div class="player-stat-block">
                <span class="stat-block-label">Damage:</span>
                <span class="stat-block-value">${player.damage.toLocaleString()}</span>
              </div>
            ` : ''}
            
            <div class="player-stat-block">
              <span class="stat-block-label">Raids:</span>
              <span class="stat-block-value">${player.totalRaids || 0}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">Survival Rate:</span>
              <span class="stat-block-value">${player.survivedToDiedRatio || 0}%</span>
            </div>
            
            ${player.longestShot ? `
              <div class="player-stat-block">
                <span class="stat-block-label">Longest Shot:</span>
                <span class="stat-block-value">${player.longestShot.toLocaleString()}m</span>
              </div>
            ` : ''}
            
            <div class="player-stat-block">
              <span class="stat-block-label">Successful Raids in a Row:</span>
              <span class="stat-block-value">${player.currentWinstreak}</span>
            </div>
          </div>
          
          <!-- SCAV Stats -->
          <div class="player-stats-container hidden" id="scav-stats">
            <div class="player-stat-block">
              <span class="stat-block-label">SCAV Level:</span>
              <span class="stat-block-value">${player.scavLevel || 'N/A'}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">SCAV Raids:</span>
              <span class="stat-block-value">${player.scavRaids || 0}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">SCAV Survives:</span>
              <span class="stat-block-value">${player.scavSurvives || 0}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">SCAV Survival Rate:</span>
              <span class="stat-block-value">${player.scavSurvRate ? player.scavSurvRate + '%' : 'N/A'}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">SCAV K/D Ratio:</span>
              <span class="stat-block-value">${player.scavKdRatio || 'N/A'}</span>
            </div>
          </div>
          
          <!-- Last Raid Stats -->
          <div class="player-stats-container hidden" id="lastraid-stats">
            <div class="player-stat-block">
              <span class="stat-block-label">Kills:</span>
              <span class="stat-block-value">${player.lastRaidKills || 0}</span>
            </div>

            <div class="player-stat-block">
              <span class="stat-block-label">Damage:</span>
              <span class="stat-block-value">${player.lastRaidDamage || 'Unknown'}</span>
            </div>

            <div class="player-stat-block">
              <span class="stat-block-label">Map:</span>
              <span class="stat-block-value">${player.lastRaidMap || 'Unknown'}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">Survived:</span>
              <span class="stat-block-value">${player.lastRaidSurvived ? 'Yes' : 'No'}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">Duration:</span>
              <span class="stat-block-value">${player.lastRaidDuration || 'Unknown'}</span>
            </div>
            
            <div class="player-stat-block">
              <span class="stat-block-label">Extracted Items Value:</span>
              <span class="stat-block-value">${player.lastRaidLootValue ? '₽' + player.lastRaidLootValue.toLocaleString() : 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div class="last-raid-summary">
    <h3 class="player-profile-header">
        Last Raid Summary
    </h3>
    <div class="player-stats-container">
        <div class="player-stat-block">
            <span class="stat-block-label">Kills:</span>
            <span class="stat-block-value">${player.lastRaidKills || 3}</span>
        </div>

        <div class="player-stat-block">
            <span class="stat-block-label">Damage:</span>
            <span class="stat-block-value">${player.lastRaidDamage || '945'}</span>
        </div>

        <div class="player-stat-block">
            <span class="stat-block-label">Map:</span>
            <span class="stat-block-value">${player.lastRaidMap || 'Factory'}</span>
        </div>
        
        <div class="player-stat-block">
            <span class="stat-block-label">Survived:</span>
            <span class="stat-block-value">${player.lastRaidSurvived ? 'Survived' : 'Died'}</span>
        </div>
    </div>
</div>
      </div>
    </div>
    `;

    // Tab switching functionality
    const tabs = container.querySelectorAll('.profile-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Hide all stats containers
            document.getElementById('pmc-stats').classList.add('hidden');
            document.getElementById('scav-stats').classList.add('hidden');
            document.getElementById('lastraid-stats').classList.add('hidden');

            // Show clicked tab's stats
            const tabName = tab.getAttribute('data-tab');
            document.getElementById(`${tabName}-stats`).classList.remove('hidden');
        });
    });
}

// Helper function to generate badges HTML
function generateBadgesHTML(player) {
    let badges = '';
    
    // Test badge prestige
    if (player.prestige && player.prestige > 0) {
        badges += `<div class="badge" title="Prestige ${player.prestige}">
                     <img src="media/prestige${player.prestige}.png" width="40" height="40" alt="Prestige">
                   </div>`;
    }
    
    if (player.achievements) {
        // Add achievement badges
        // TEST
        if (player.achievements.includes('killer')) {
            badges += `<div class="badge" title="Expert Killer">💀addadadada</div>`;
        }
        if (player.achievements.includes('survivor')) {
            badges += `<div class="badge" title="Master Survivor">bimboom</div>`;
        }
        if (player.achievements.includes('coolest')) {
            badges += `<div class="badge" title="Item Collector">hes cool</div>`;
        }
    }
    
    // Add faction badge
    if (player.faction === 'Bear') {
        badges += `<div class="badge" title="BEAR Operator">
                     <img src="media/Bear.png" width="70" height="70" alt="BEAR">
                   </div>`;
    } else if (player.faction === 'Usec') {
        badges += `<div class="badge" title="USEC Operator">
                     <img src="media/Usec.png" width="70" height="70" alt="USEC">
                   </div>`;
    }
    
    return badges;
}

// Close modals on click or out of bounds click
function setupModalCloseHandlers(modal) {
    const closeBtn = modal.querySelector('.profile-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        };
    }

    window.addEventListener('click', function closeModal(e) {
        if (e.target === modal || e.target.classList.contains('profile-modal-overlay')) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
            window.removeEventListener('click', closeModal);
        }
    });
    
    // Disable scrolling when modal is open
    document.body.style.overflow = 'hidden';
}