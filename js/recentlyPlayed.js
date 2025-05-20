const shownPlayerNotifications = new Set();
const playerLastRaidTimes = new Map();
const notificationStack = [];

function showPlayerNotification(player) {

    if (!player.lastPlayed) return;

    const lastRaidTime = player.lastPlayed;
    const lastNotifiedRaidTime = playerLastRaidTimes.get(player.id);

    // skip if that raid was already shown
    if (lastNotifiedRaidTime === lastRaidTime) {
        return;
    }

    playerLastRaidTimes.set(player.id, lastRaidTime);

    const notification = document.createElement('div');
    notification.className = 'player-notification-r';
    notification.innerHTML = `
        <div class="notification-content-r">
            <div class="notification-text">
                <span class="notification-name-r">${player.name}</span>
                <span class="notification-info-r">Finished a raid</span>
        ${player.publicProfile ? `
            <div class="raid-overview-notify">
            <span class="raid-result-r ${player.discFromRaid ? 'disconnected' : player.isTransition ? 'transit' : player.lastRaidSurvived ? 'survived' : 'died'}">
                ${player.discFromRaid ? `<em class="bx bxs-log-out"></em> Left` : player.isTransition ? `<i class="bx bx-loader-alt bx-spin" style="line-height: 0 !important;"></i> In Transit (${player.lastRaidMap}
                <em class="bx bxs-chevrons-right" style="position: relative; top: 2px;"></em> ${player.lastRaidTransitionTo || 'Unknown'})` : player.lastRaidSurvived ? `<em class="bx bx-walk"></em> Survived` : `
                <em class="bx bxs-skull"></em> Killed in Action`}
            </span>
            <span class="raid-meta-notify">
                ${player.lastRaidMap || 'Unknown'} • ${player.lastRaidAs || 'N/A'}
            </span>
        </div>
        `: ''}
            </div>
        </div>
    `;

    const container = document.getElementById('notifications-container-r') || createNotificationsContainer();
    container.appendChild(notification);

    notificationStack.push(notification);
    updateNotificationPositions();

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s forwards';
    }, 7000);

    setTimeout(() => {
        notification.remove();
        const index = notificationStack.indexOf(notification);
        if (index > -1) {
            notificationStack.splice(index, 1);
        }
        updateNotificationPositions();
    }, 10000);
}


function updateNotificationPositions() {
    const offset = 10;
    let topPosition = 100;

    notificationStack.forEach((notif, index) => {
        notif.style.top = `${topPosition}px`;
        notif.style.right = '10px';
        notif.style.zIndex = 1000 + index;
        topPosition += notif.offsetHeight + offset;
    });
}

function createNotificationsContainer() {
    const container = document.createElement('div');
    container.id = 'notifications-container-r';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    container.style.width = '300px';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    return container;
}

function checkRecentPlayers(leaderboardData) {
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = currentTime - 1200;

    leaderboardData.forEach(player => {
        if (player.lastPlayed && player.lastPlayed > fiveMinutesAgo) {
            showPlayerNotification(player);
        }
    });
}