openedPlayerData = [];

function openProfile(playerId) {
    const modal = document.getElementById('playerProfileModal');
    const modalContent = document.getElementById('modalPlayerInfo');

    modalContent.innerHTML = '';

    // If no id data-player-id="0" (shouldn't be happening)
    if (!playerId || playerId === '0') {
        showPrivateProfile(modalContent, "Unknown Player");
        modal.style.display = 'flex';
        setupModalCloseHandlers(modal);
        return;
    }

    // Finding Player in data
    const player = leaderboardData.find(p => p.id === playerId);

    // Couldn't find
    if (!player) {
        showPrivateProfile(modalContent, "Player Not Found");
        modal.style.display = 'flex';
        setupModalCloseHandlers(modal);
        return;
    }

    const isPublic = player.publicProfile;

    // If disqualified
    if (player.disqualified) {
        modal.style.display = 'flex';
        showDisqualProfile(modalContent, player);
        setupModalCloseHandlers(modal, player);
        return;
    }

    // Privated profile
    if (!isPublic) {
        modal.style.display = 'flex';
        showPrivateProfile(modalContent, player);
        setupModalCloseHandlers(modal, player);
        return;
    }

    // Showing public profile
    showPublicProfile(modalContent, player);
    openedPlayerData = player;
    modal.style.display = 'flex';
    setupModalCloseHandlers(modal);
}

// Private profile HTML
function showPrivateProfile(container, player) {
    const profileModal = document.querySelector('.profile-modal-content');
    profileModal.style.background = "#1e1e2d";

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
    const profileModal = document.querySelector('.profile-modal-content');
    profileModal.style.background = "#1e1e2d";

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

// To 00:00
function formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
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

    // Profile Theme
    const profileModal = document.querySelector('.profile-modal-content');
    switch (player.profileTheme) {
        case "Darker":
            profileModal.style.background = "#121212";
            break;
        case "Light":
            profileModal.style.background = "rgb(61 87 106)";
            break;
        case "Gradient":
            profileModal.style.background = "linear-gradient(169deg,rgba(62, 150, 141, 1) 0%, rgba(49, 49, 92, 1) 42%, rgba(60, 62, 99, 1) 69%)";
            break;
        default:
            profileModal.style.background = "#1e1e2d";
    }

    // About me
    const aboutText = player.profileAboutMe && player.profileAboutMe.length <= 80
        ? player.profileAboutMe
        : 'Nothing to see here.';

    // Generate badges
    const badgesHTML = generateBadgesHTML(player);

    const lastRaidDuration = formatSeconds(player.lastRaidTimeSeconds);
    const lastRaidAgo = formatLastPlayedRaid(player.lastPlayed);
    const lastAchivementAgo = formatLastPlayedRaid(player.latestAchievementTimestamp);

    let lastAchievementIconResult = '';
    if (player.latestAchievementImageUrl) {
        let lastAchievementIcon = player.latestAchievementImageUrl
        lastAchievementIconResult = lastAchievementIcon.slice(1)
    }

    // If user has usePrestigeStyling and prestige unlocked, assign a color name
    let profileClassStyle = ''
    if (player.prestige && player.usePrestigeStyling) {
        profileClassStyle = 'prestige-title';
    }

    container.innerHTML = `
    <div class="profile-grid-layout">
      <!-- Main -->
      <div class="profile-main-card">
        <div class="hall-of-fame-button-container">
            <button class="hall-of-fame-button" id="toggle-hof-button">Hall of Fame</button>
        </div>
        <img src="${player.profilePicture}" class="player-avatar" alt="${player.name}">
        <div class="player-status">
          <div class="status-indicator ${player.isOnline ? 'status-online' : 'status-offline'}"></div>
          <span>${player.isOnline ? 'Online' : 'Offline'}</span>
        </div>
        <h2 class="profile-player-name ${profileClassStyle}">${player.name}</h2>
          <div class="player-about">${aboutText}</div>
        <div class="player-reg-date">
          <span class="reg-date-text">Registered: ${regDate}</span>
        </div>
        <div class="badges-container">
          ${badgesHTML}
        </div>
      </div>

      <!-- Last Raid -->
        <div class="last-raid-feed 
            ${player.discFromRaid ? 'disconnected-bg' :
            player.isTransition ? 'transit-bg' :
                player.lastRaidSurvived ? 'survived-bg' : 'died-bg'}" id="last-raid-feed">

            <h3 class="section-title 
                ${player.discFromRaid ? 'disconnected' :
            player.isTransition ? 'transit' :
                player.lastRaidSurvived ? 'survived' : 'died'}">
                Last Raid
            </h3>

        <div class="raid-overview">
            <span class="raid-result 
                ${player.discFromRaid ? 'disconnected' :
            player.isTransition ? 'transit' :
                player.lastRaidSurvived ? 'survived' : 'died'}">
                ${player.discFromRaid ? `<em class='bx bxs-log-out'></em> Left` :
            player.isTransition ? `<i class='bx bx-loader-alt bx-spin' style='line-height: 0 !important;'></i> In Transit (${player.lastRaidMap} <em class='bx bxs-chevrons-right' style='position: relative; top: 2px;'></em> ${player.lastRaidTransitionTo || 'Unknown'})` :
                player.lastRaidSurvived ? `<em class='bx bx-walk'></em> Survived` : `<em class='bx bxs-skull'></em> Killed in Action`}
            </span>
            <span class="raid-meta">
                ${player.lastRaidMap || 'Unknown'} • ${player.lastRaidAs || 'N/A'} • ${lastRaidDuration || '00:00'} • ${lastRaidAgo || 'Just Now'}
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
            <div class="raid-stat-block">
                <span class="profile-stat-label">Player Hits:</span>
                <span class="profile-stat-value">${player.lastRaidHits ?? 0}</span>
            </div>
            <div class="raid-stat-block">
                <span class="profile-stat-label">Looting EXP:</span>
                <span class="profile-stat-value">${player.lastRaidEXP ?? 0}</span>
            </div>
            </div>

            <!-- Latest Achievement Block -->
            <div class="stat-block achievement-block">
                <h3 class="section-title">Latest Achievement</h3>
                <div class="achievement-content">
                    <div class="achievement-icon">
                    <img src="${lastAchievementIconResult || 'files/achievement/Standard_35_1.png'}" alt="Achievement Icon">
                    <div class="achievement-time">${lastAchivementAgo || 'N/A'}</div>
                    </div>
                    <div class="achievement-info">
                    <div class="achievement-title">${player.latestAchievementName || 'Nothing to see here yet...'}</div>
                    <div class="achievement-description">${player.latestAchievementDescription || 'Nothing to see here yet...'}</div>
                    </div>
                </div>
            </div>
        </div>


      <div class="stats-blocks" id="raid-stats-grid">
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
            <span class="profile-stat-value">${player.pmcRaids || 0}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival Rate</span>
            <span class="profile-stat-value">${player.survivalRate || 0}%</span>
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
            <span class="profile-stat-label">K/D Ratio</span>
            <span class="profile-stat-value">${player.scavKillToDeathRatio || 'N/A'}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Raids</span>
            <span class="profile-stat-value">${player.scavRaids || 0}</span>
          </div>
          <div class="stat-row">
            <span class="profile-stat-label">Survival Rate</span>
            <span class="profile-stat-value">${player.scavSurvivalRate ? player.scavSurvivalRate + '%' : 'N/A'}</span>
          </div>
        </div>
      </div>
    <div id="player-profile-hof">
        hello!gergergegegergergregre
      </div>
    </div>
    `;

    // Init hall of fame button once the thing has opened
    initHOF(player);
}

// Helper function to generate badges HTML
function generateBadgesHTML(player) {
    let badges = '';

    const playerData = allSeasonsCombinedData.find(p => p.id === player.id || p.name === player.name);

    if (playerData && playerData.seasonsCount > 1) {
        badges += `<div class="badge tooltip">
        <em class='bx bxs-joystick'></em>
        <span class="tooltiptext">This player has been around for ${playerData.seasonsCount} seasons!</span>
      </div>`;
    }

    if (player?.trusted == true) {
        badges += `<div class="badge tooltip">
        <img src="media/trusted.png" width="30" height="30" alt="Trusted">
        <span class="tooltiptext">Official Tester</span>
      </div>`;
    }

    if (player?.suspicious == true) {
        badges += `<div class="badge tooltip">
        <em class='bx bxs-shield-x bx-flashing' style="color:rgb(255, 123, 100);"></em>
        <span class="tooltiptext">This player was marked as suspicious by SkillIssueDetector™. Their statistics may be innacurate</span>
      </div>`;
    } else {
        badges += `<div class="badge tooltip">
        <em class='bx bxs-check-shield' style="color:rgb(100, 255, 165);"></em>
        <span class="tooltiptext">Profile in good standing</span>
      </div>`;
    }

    // Prestige badge
    if (player.prestige && player.prestige > 0) {
        badges += `<div class="badge tooltip">
        <img src="media/prestige${player.prestige}.png" width="40" height="40" alt="Prestige">
        <span class="tooltiptext">This player has reached prestige level ${player.prestige}</span>
      </div>`;
    }

    if (player.achievement) {
        if (player.achievements.includes('survivor')) {
            badges += `<div class="badge" title="Master Survivor">bimboom</div>`;
        }
        if (player.achievements.includes('coolest')) {
            badges += `<div class="badge" title="Item Collector">hes cool</div>`;
        }
    }

    // Add faction badge
    if (player.pmcSide === 'Bear') {
        badges += `<div class="badge tooltip">
                     <img src="media/Bear.png" width="70" height="70" alt="BEAR">
                     <span class="tooltiptext">Plays as BEAR Operator</span>
                   </div>`;
    } else if (player.pmcSide === 'Usec') {
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

function formatLastPlayedRaid(unixTimestamp) {
    if (typeof unixTimestamp !== 'number' || unixTimestamp <= 0) {
        return 'Unknown';
    }

    const date = new Date(unixTimestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Just Now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes === 1) {
        return '1 minute ago';
    }
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) {
        return '1 hour ago';
    }
    if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
        return '1 day ago';
    }
    if (diffInDays < 30) {
        return `${diffInDays} days ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) {
        return '1 month ago';
    }
    if (diffInMonths < 12) {
        return `${diffInMonths} months ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    if (diffInYears === 1) {
        return '1 year ago';
    }
    return `${diffInYears} years ago`;
}