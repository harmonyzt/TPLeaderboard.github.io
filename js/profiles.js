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

    const isPublic = player.publicProfile;

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
   <div class="profile-grid-layout banned">
      <!-- Main -->
      <div class="profile-main-card">
        <img src="media/default_avatar.png" class="player-avatar">
        <div class="player-status">
          <div class="status-indicator status-offline"></div>
          <span>Offline</span>
        </div>
        <h2 class="profile-player-name">${player.name}</h2>
          <div class="player-about">Hello!</div>
        <div class="player-reg-date">
          <span class="reg-date-text">Registered: 12.12.2000</span>
        </div>
        <div class="badges-container">
        </div>
      </div>

      <!-- Last Raid -->
      <div class="last-raid-feed">
        <h3 class="section-title">Last Raid</h3>
        <div class="raid-stats-grid">
          <div class="raid-stat-block">
            <span class="profile-profile-stat-label">Map</span>
            <span class="profile-stat-value">Factory</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Result:</span>
            <span class="profile-stat-value died">
              Died
            </span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Kills:</span>
            <span class="profile-stat-value">1</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Damage:</span>
            <span class="profile-stat-value">76</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Duration:</span>
            <span class="profile-stat-value">3:00</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Loot Value:</span>
            <span class="profile-stat-value">₽394</span>
          </div>
        </div>
      </div>

      <div class="stats-blocks">
        <!-- PMC Block -->
        <div class="stat-block pmc-block">
          <h3 class="section-title">PMC</h3>
          <div class="stat-row">
            <span class="profile-stat-label">Level</span>
            <span class="profile-stat-value">30</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">K/D Ratio</span>
            <span class="profile-stat-value">4</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Raids</span>
            <span class="profile-stat-value">10</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival</span>
            <span class="profile-stat-value">55%</span>
          </div>
        </div>

        <!-- SCAV Block -->
        <div class="stat-block scav-block">
          <h3 class="section-title">SCAV</h3>
          <div class="stat-row">
            <span class="profile-stat-label">Level</span>
            <span class="profile-stat-value">3</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Raids</span>
            <span class="profile-stat-value">6</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival</span>
            <span class="profile-stat-value">57%</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">K/D Ratio</span>
            <span class="profile-stat-value">4</span>
          </div>
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
    <div class="profile-grid-layout banned">
      <!-- Main -->
      <div class="profile-main-card">
        <img src="media/default_avatar.png" class="player-avatar">
        <div class="player-status">
          <div class="status-indicator status-offline"></div>
          <span>Offline</span>
        </div>
        <h2 class="profile-player-name">${player.name}</h2>
          <div class="player-about">Hello!</div>
        <div class="player-reg-date">
          <span class="reg-date-text">Registered: 12.12.2000</span>
        </div>
        <div class="badges-container">
        </div>
      </div>

      <!-- Last Raid -->
      <div class="last-raid-feed">
        <h3 class="section-title">Last Raid</h3>
        <div class="raid-stats-grid">
          <div class="raid-stat-block">
            <span class="profile-profile-stat-label">Map</span>
            <span class="profile-stat-value">Factory</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Result:</span>
            <span class="profile-stat-value died">
              Died
            </span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Kills:</span>
            <span class="profile-stat-value">1</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Damage:</span>
            <span class="profile-stat-value">76</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Duration:</span>
            <span class="profile-stat-value">3:00</span>
          </div>
          <div class="raid-stat-block">
            <span class="profile-stat-label">Loot Value:</span>
            <span class="profile-stat-value">₽394</span>
          </div>
        </div>
      </div>

      <div class="stats-blocks">
        <!-- PMC Block -->
        <div class="stat-block pmc-block">
          <h3 class="section-title">PMC</h3>
          <div class="stat-row">
            <span class="profile-stat-label">Level</span>
            <span class="profile-stat-value">30</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">K/D Ratio</span>
            <span class="profile-stat-value">4</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Raids</span>
            <span class="profile-stat-value">10</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival</span>
            <span class="profile-stat-value">55%</span>
          </div>
        </div>

        <!-- SCAV Block -->
        <div class="stat-block scav-block">
          <h3 class="section-title">SCAV</h3>
          <div class="stat-row">
            <span class="profile-stat-label">Level</span>
            <span class="profile-stat-value">3</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Raids</span>
            <span class="profile-stat-value">6</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival</span>
            <span class="profile-stat-value">57%</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">K/D Ratio</span>
            <span class="profile-stat-value">4</span>
          </div>
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
        : 'Nothing to see here.';

    // Generate badges
    const badgesHTML = generateBadgesHTML(player);

    container.innerHTML = `
    <div class="profile-grid-layout">
      <!-- Main -->
      <div class="profile-main-card">
        <img src="${player.avatar || 'media/default_avatar.png'}" class="player-avatar" alt="${player.name}">
        <div class="player-status">
          <div class="status-indicator ${player.isOnline ? 'status-online' : 'status-offline'}"></div>
          <span>${player.isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <h2 class="profile-player-name">${player.name}</h2>
          <div class="player-about">${aboutText}</div>
        <div class="player-reg-date">
          <span class="reg-date-text">Registered: ${regDate}</span>
        </div>
        <div class="badges-container">
          ${badgesHTML}
        </div>
      </div>

      <!-- Last Raid -->
        <div class="last-raid-feed ${player.lastRaidSurvived ? 'survived-bg' : 'died-bg'}">
        <h3 class="section-title ${player.lastRaidSurvived ? 'survived' : 'died'}">Last Raid</h3>
        <div class="raid-overview">
            <span class="raid-result ${player.lastRaidSurvived ? 'survived' : 'died'}">
            ${player.lastRaidSurvived ? 'Survived' : 'Died'}
            </span>
            <span class="raid-meta">
            ${player.lastRaidMap || 'Factory'} • ${player.lastRaidType || 'SCAV'} • ${player.lastRaidDuration || '00:00'} • ${player.lastRaidTimeAgo || 'Just Now'}
            </span>
        </div>
        <div class="raid-stats-grid">
            <div class="raid-stat-block">
            <span class="profile-stat-label">Kills:</span>
            <span class="profile-stat-value">${player.lastRaidKills ?? 0}</span>
            </div>
            <div class="raid-stat-block">
            <span class="profile-stat-label">Damage:</span>
            <span class="profile-stat-value">${player.lastRaidDamage ?? 0}</span>
            </div>
        </div>
        </div>

      <div class="stats-blocks">
        <!-- PMC Block -->
        <div class="stat-block pmc-block">
          <h3 class="section-title">PMC</h3>
          <div class="stat-row">
            <span class="profile-stat-label">Level (Overall)</span>
            <span class="profile-stat-value">${player.pmcLevel || 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">K/D Ratio</span>
            <span class="profile-stat-value">${player.killToDeathRatio || 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Raids</span>
            <span class="profile-stat-value">${player.totalRaids || 0}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival</span>
            <span class="profile-stat-value">${player.survivedToDiedRatio || 0}%</span>
          </div>
        </div>

        <!-- SCAV Block -->
        <div class="stat-block scav-block">
          <h3 class="section-title scav">SCAV</h3>
          <div class="stat-row">
            <span class="profile-stat-label">Level (Overall)</span>
            <span class="profile-stat-value">${player.scavLevel || 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Raids</span>
            <span class="profile-stat-value">${player.scavRaids || 0}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival</span>
            <span class="profile-stat-value">${player.scavSurvRate ? player.scavSurvRate + '%' : 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">K/D Ratio</span>
            <span class="profile-stat-value">${player.scavKdRatio || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
    `;
}

// Helper function to generate badges HTML
function generateBadgesHTML(player) {
    let badges = '';

    const playerData = allSeasonsCombinedData.find(p => p.id === player.id || p.name === player.name);

    if(playerData && playerData.seasonsCount > 1) {
        badges += `<div class="badge tooltip">
        <em class='bx bxs-joystick'></em>
        <span class="tooltiptext">This player has been around for ${playerData.seasonsCount} seasons!</span>
      </div>`;
    }

    if(player?.verified == true){
        badges += `<div class="badge tooltip">
        <em class='bx bxs-star' style="color:rgb(100, 255, 165);"></em>
        <span class="tooltiptext">Trusted Player</span>
      </div>`;
    }

    if(player?.suspiciousMods == true){
        badges += `<div class="badge tooltip">
        <em class='bx bxs-shield-x' style="color:rgb(255, 123, 100);"></em>
        <span class="tooltiptext">This player was marked as suspicious by SkillIssueDetector™. Their statistics may be innacurate</span>
      </div>`;
    }

    // Test badge prestige
    if (player.prestige && player.prestige > 0) {
        badges += `<div class="badge tooltip">
        <img src="media/prestige${player.prestige}.png" width="40" height="40" alt="Prestige">
        <span class="tooltiptext">This player has reached prestige level ${player.prestige}</span>
      </div>`;
    }

    if (player.achivement) {
        if (player.achievements.includes('survivor')) {
            badges += `<div class="badge" title="Master Survivor">bimboom</div>`;
        }
        if (player.achievements.includes('coolest')) {
            badges += `<div class="badge" title="Item Collector">hes cool</div>`;
        }
    }

    // Add faction badge
    if (player.faction === 'Bear') {
        badges += `<div class="badge tooltip">
                     <img src="media/Bear.png" width="70" height="70" alt="BEAR">
                     <span class="tooltiptext">Plays as BEAR Operator</span>
                   </div>`;
    } else if (player.faction === 'Usec') {
        badges += `<div class="badge tooltip">
                     <img src="media/Usec.png" width="70" height="70" alt="USEC">
                     <span class="tooltiptext">Plays as USEC Operator</span>
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
}