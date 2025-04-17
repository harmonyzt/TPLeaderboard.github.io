// When data loaded
document.addEventListener('DOMContentLoaded', detectSeasons);

let leaderboardData = []; // For keeping data
let allSeasonsData = []; // For keeping ALL players data
let sortDirection = {}; // Sort direction
let seasons = []; // Storing seasons

async function checkSeasonExists(seasonNumber) {
    try {
        const response = await fetch(`https://visuals.nullcore.net/hidden/season${seasonNumber}.json`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Detect available seasons
async function detectSeasons() {
    let seasonNumber = 1;
    seasons = [];

    // FIXME
    // Throws 404 because it tries to access not existing next season file
    while (await checkSeasonExists(seasonNumber)) {
        seasons.push(seasonNumber);
        seasonNumber++;
    }

    seasons.sort((a, b) => b - a);

    populateSeasonDropdown();

    // Determine previous winners if we have latest leaderboard
    if (seasons.length > 1) {
        loadPreviousSeasonWinners();
    }

    // Load the latest season data
    loadLeaderboardData(seasons[0]);
}

async function populateSeasonDropdown() {
    const seasonSelect = document.getElementById('seasonSelect');
    seasonSelect.innerHTML = '';

    // Casual seasons
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season;
        option.textContent = `Season ${season}`;
        seasonSelect.appendChild(option);
    });

    // All seasons
    const allSeasonsOption = document.createElement('option');
    allSeasonsOption.value = 'all';
    allSeasonsOption.textContent = 'Global Leaderboard';
    seasonSelect.appendChild(allSeasonsOption);

    seasonSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;

        if (selectedValue === 'all') {
            loadAllSeasonsData();
        } else {
            loadLeaderboardData(selectedValue);
        }
    });
}

// Called upon Global Leaderboard selection in drop-down menu populateSeasonDropdown()
async function loadAllSeasonsData() {
    const loadingNotification = document.getElementById('loadingNotification');
    const emptyLeaderboardNotification = document.getElementById('emptyLeaderboardNotification');

    emptyLeaderboardNotification.style.display = 'none';
    loadingNotification.style.display = 'block';

    try {
        const uniquePlayers = {};

        // Loop through all seasons data
        for (const season of seasons) {
            const response = await fetch(`https://visuals.nullcore.net/hidden/season${season}.json`);
            if (!response.ok) continue;

            const data = await response.json();
            if (data.leaderboard && data.leaderboard.length > 0) {
                data.leaderboard.forEach(player => {
                    // If we find a player with same name from two seasons (or more) choose most recent one
                    if (!uniquePlayers[player.name] ||
                        compareLastPlayed(player.lastPlayed, uniquePlayers[player.name].lastPlayed) > 0) {
                        uniquePlayers[player.name] = {
                            ...player,
                            seasonsPlayed: uniquePlayers[player.name]
                                ? [...uniquePlayers[player.name].seasonsPlayed, season]
                                : [season]
                        };
                    }
                });
            }
        }

        // Turning everyone back into massive object (M-M-MASSIVE?)
        allSeasonsCombinedData = Object.values(uniquePlayers);

        if (allSeasonsCombinedData.length === 0) {
            emptyLeaderboardNotification.style.display = 'block';
        } else {
            addColorIndicators(allSeasonsCombinedData);
            calculateRanks(allSeasonsCombinedData);
            calculateOverallStats(allSeasonsCombinedData);
        }

        displayLeaderboard(allSeasonsCombinedData);
        addSortListeners();

    } catch (error) {
        console.error('Error loading all seasons data:', error);
    } finally {
        loadingNotification.style.display = 'none';
    }
}

// Unix
function compareLastPlayed(dateStr1, dateStr2) {
    const parseDate = (dateStr) => {
        if (/^\d+$/.test(dateStr)) {
            return new Date(parseInt(dateStr) * 1000);
        }

        // if "dd.mm.yyyy"
        if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
            const [d, m, y] = dateStr.split('.').map(Number);
            return new Date(y, m - 1, d);
        }

        return null;
    };

    const date1 = parseDate(dateStr1);
    const date2 = parseDate(dateStr2);

    if (!date1 || !date2) {
        return "Unknown";
    }

    return date1 - date2;
}

// Called upon season detection or change by detectSeasons() + populateSeasonDropdown()
async function loadLeaderboardData(season) {
    const loadingNotification = document.getElementById('loadingNotification');
    const emptyLeaderboardNotification = document.getElementById('emptyLeaderboardNotification');

    emptyLeaderboardNotification.style.display = 'none';
    loadingNotification.style.display = 'block';

    try {
        const response = await fetch(`https://visuals.nullcore.net/hidden/season${season}.json`);
        if (!response.ok) {
            throw new Error('Failed to load leaderboard data');
        }
        const data = await response.json();

        leaderboardData = data.leaderboard || [];

        // Show the notification if the leaderboard is empty. Displaying numbers is hacky so force to calculate nothing lmao
        // 4/4/2025 - by the way, it gets fucked when there are no players in file.. Too bad.
        if (leaderboardData.length === 0 || (leaderboardData.length === 1 && Object.keys(leaderboardData[0]).length === 0)) {
            emptyLeaderboardNotification.style.display = 'block';
            animateNumber('totalDeaths', 0);
            //animateNumber('totalDeathsFromTP', 0);
            animateNumber('totalRaids', 0);
            animateNumber('totalKills', 0);
            animateNumber('totalDamage', 0);
            animateNumber('averageKDR', 0, 2);
            animateNumber('averageSurvival', 0, 2);
            displayLeaderboard(leaderboardData);
            return;
        } else {
            // Proceed with normal leaderboard display logic
            addColorIndicators(leaderboardData);
            calculateRanks(leaderboardData);
            calculateOverallStats(leaderboardData);
            displayLeaderboard(leaderboardData);
            addSortListeners();
        }
    } catch (error) {
        console.error('Error loading leaderboard data:', error);
    } finally {
        loadingNotification.style.display = 'none';
    }
}

async function displayLeaderboard(data) {
    const tableBody = document.querySelector('#leaderboardTable tbody');
    tableBody.innerHTML = '';

    data.forEach(player => {
        const row = document.createElement('tr');

        let rankClass = '';
        let nameClass = '';
            if (player.rank === 1) {
                rankClass = 'gold';
                nameClass = 'gold-name';
            } else if (player.rank === 2) {
                rankClass = 'silver';
                nameClass = 'silver-name';
            } else if (player.rank === 3) {
                rankClass = 'bronze';
                nameClass = 'bronze-name';
            }

        // Format the date from user profile (Last Raid row in Unix now)
        function formatLastPlayed(unixTimestamp) {
            if (typeof unixTimestamp !== 'number' || unixTimestamp <= 0) {
                return 'Unknown';
            }

            const date = new Date(unixTimestamp * 1000);
            const now = new Date();
            const diffInSeconds = Math.floor((now - date) / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60)

            if (diffInMinutes < 60) {
                return 'In raid <div id="blink"></div>';
            }

            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) {
                return `${diffInHours}h ago`;
            }

            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays === 1) {
                return '1d ago';
            }
            if (diffInDays < 30) {
                return `${diffInDays}d ago`;
            }

            const diffInMonths = Math.floor(diffInDays / 30);
            const remainingDays = diffInDays % 30;
            if (diffInMonths < 12) {
                return `${diffInMonths}mo${remainingDays > 0 ? ` ${remainingDays}d` : ''} ago`;
            }

            const diffInYears = Math.floor(diffInMonths / 12);
            const remainingMonths = diffInMonths % 12;
            return `${diffInYears}y${remainingMonths > 0 ? ` ${remainingMonths}mo` : ''} ago`;
        }

        // Turning last game into 'x days/weeks ago'
        let lastGame = formatLastPlayed(player.lastPlayed)

        // EFT Account icons and colors handling
        let accountIcon = '';
        let accountColor = '';
        if(player.disqualified === "false" || player?.disqualified) {
            switch (player.accountType) {
                case 'edge_of_darkness':
                    accountIcon = '<img src="media/EOD.png" alt="EOD" class="account-icon">';
                    accountColor = '#be8301';
                    break;
                case 'unheard_edition':
                    accountIcon = '<img src="media/Unheard.png" alt="Unheard" class="account-icon">';
                    accountColor = '#54d0e7';
                    break;
            }
        } else {
            accountIcon = '';
            accountColor = '#787878';
        }

        // If using Twitch Players
        //let TPicon = '';
        //if (player.isUsingTwitchPlayers) {
        //    TPicon = '✅';
        //} else {
        //    TPicon = '❌';
        //}

        let fikaIcon = '';
        if (player.fika === "true") {
            fikaIcon = '✅';
        } else {
            fikaIcon = '❌';
        }

        // Get skill
        const rankLabel = getRankLabel(player.totalScore);

        // Compare SPT version of the user
        function getSptVerClass(playerVersion) {
            const latestVersion = '3.11.3'; // Newest SPT ver
            const outdatedVersion = '3.10'; // Outdated SPT ver. Everything below that version will be old versions

            if (compareVersions(playerVersion, latestVersion) >= 0) {
                return 'current-version';
            }

            if (compareVersions(playerVersion, outdatedVersion) >= 0) {
                return 'outdated-version';
            }

            return 'old-version';
        }

        // Recognize the version of SPT
        function compareVersions(version1, version2) {
            const v1 = version1.split('.').map(Number);
            const v2 = version2.split('.').map(Number);

            for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
                const part1 = v1[i] || 0;
                const part2 = v2[i] || 0;

                if (part1 > part2) return 1;  // version1 > version2
                if (part1 < part2) return -1; // version1 < version2
            }

            return 0; // version1 == version2
        }

        row.innerHTML = `
            <td class="rank ${rankClass}">${player.rank} ${player.medal}</td>
            <td class="player-name ${nameClass}" style="color: ${accountColor}" data-player-id="${player.id || '0'}"> ${accountIcon} ${player.name}</td>
            <td>${lastGame || 'N/A'}</td>
            <td>${player.pmcLevel}</td>
            <td>${player.totalRaids}</td>
            <td class="${player.survivedToDiedRatioClass}">${player.survivedToDiedRatio}%</td>
            <td class="${player.killToDeathRatioClass}">${player.killToDeathRatio}</td>
            <td class="${player.averageLifeTimeClass}">${player.averageLifeTime}</td>
            <td>${player.totalScore <= 0 ? 'Calibrating...' : player.totalScore.toFixed(2)} ${player.totalScore <= 0 ? '' : `(${rankLabel})`}</td>
            <td>${fikaIcon}</td>
            <td class="${getSptVerClass(player.sptVer)}">${player.sptVer}</td>
        `;

        tableBody.appendChild(row);
    });

    // Clickity for names in leaderboard
    document.querySelectorAll('.player-name').forEach(element => {
        element.addEventListener('click', () => {
            openProfile(element.dataset.playerId);
        });
    });

    return { status: 'success', data: leaderboardData };
}

function addSortListeners() {
    const headers = document.querySelectorAll('#leaderboardTable th[data-sort]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.getAttribute('data-sort');
            sortLeaderboard(sortKey);
        });
    });
}

function sortLeaderboard(sortKey) {
    if (!sortDirection[sortKey]) {
        sortDirection[sortKey] = 'asc';
    } else {
        sortDirection[sortKey] = sortDirection[sortKey] === 'asc' ? 'desc' : 'asc';
    }

    leaderboardData.sort((a, b) => {
        let valueA = a[sortKey];
        let valueB = b[sortKey];

        if (sortKey === 'rank') {
            valueA = a.rank;
            valueB = b.rank;
        }

        if (sortKey === 'pmcLevel' || sortKey === 'totalRaids' || sortKey === 'survivedToDiedRatio' || sortKey === 'killToDeathRatio' || sortKey === 'totalScore') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
        }

        if (sortKey === 'averageLifeTime') {
            valueA = convertTimeToSeconds(valueA);
            valueB = convertTimeToSeconds(valueB);
        }

        if (valueA < valueB) {
            return sortDirection[sortKey] === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return sortDirection[sortKey] === 'asc' ? 1 : -1;
        }
        return 0;
    });

    displayLeaderboard(leaderboardData);
}

function convertTimeToSeconds(time) {
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
}

function addColorIndicators(data) {
    data.forEach(player => {
        // Survived/Died Ratio
        if (player.survivedToDiedRatio < 30) { // Less than 30%
            player.survivedToDiedRatioClass = 'bad';
        } else if (player.survivedToDiedRatio >= 30 && player.survivedToDiedRatio < 55) { // 30% - 54%
            player.survivedToDiedRatioClass = 'average';
        } else if (player.survivedToDiedRatio >= 55 && player.survivedToDiedRatio < 65) { // 55% - 64%
            player.survivedToDiedRatioClass = 'good';
        } else { // 65% and above
            player.survivedToDiedRatioClass = 'impressive';
        }

        // Kill/Death Ratio
        if (player.killToDeathRatio < 5) { // Less than 5
            player.killToDeathRatioClass = 'bad';
        } else if (player.killToDeathRatio >= 5 && player.killToDeathRatio < 12) { // 5 - 7.99
            player.killToDeathRatioClass = 'average';
        } else if (player.killToDeathRatio >= 12 && player.killToDeathRatio < 15) { // 8 - 14.99
            player.killToDeathRatioClass = 'good';
        } else { // 15 and above
            player.killToDeathRatioClass = 'impressive';
        }

        // Average Life Time
        const lifeTimeSeconds = convertTimeToSeconds(player.averageLifeTime);
        if (lifeTimeSeconds < 300) { // Less than 5 minutes
            player.averageLifeTimeClass = 'bad';
        } else if (lifeTimeSeconds >= 300 && lifeTimeSeconds < 900) { // 5 - 14.99 minutes
            player.averageLifeTimeClass = 'average';
        } else if (lifeTimeSeconds >= 900 && lifeTimeSeconds < 1200) { // 15 - 19.99 minutes
            player.averageLifeTimeClass = 'good';
        } else { // 20 minutes and above
            player.averageLifeTimeClass = 'impressive';
        }
    });
}

// Ranking calculation (needed comments for this one)
function calculateRanks(data) {
    data.forEach(player => {
        const kdrScore = player.killToDeathRatio * 0.2; // 20% weight
        const sdrScore = player.survivedToDiedRatio * 0.2; // 20% weight
        const raidsScore = player.totalRaids * 0.5; // 50% weight
        const pmcLevelScore = player.pmcLevel * 0.1; // 10% weight

        const MIN_RAIDS = 50;
        const SOFT_CAP_RAIDS = 100;

        // Total score
        player.totalScore = kdrScore + sdrScore + Math.log(raidsScore) + pmcLevelScore;

        // Tune the player skill score down if he has less than 50 raids
        if (player.totalRaids <= MIN_RAIDS) {
            player.totalScore *= 0.3;  // Setting rating lower by 70%
        } else if (player.totalRaids < SOFT_CAP_RAIDS) {
            const progress = (player.totalRaids - MIN_RAIDS) / (SOFT_CAP_RAIDS - MIN_RAIDS);
            player.totalScore *= 0.3 + (0.7 * progress);
        }

        // Disquilify Player
        if(player.disqualified === "true"){
            player.totalScore = 0;
            player.damage = 0;
        }

        // If player is not using Twitch Players (with intent that it's gonna be easier) tune down his total score
        //if (!player.isUsingTwitchPlayers) {
        //    player.totalScore -= 5;
        //}

        // If player is using Fika (with intent that it's gonna be easier) tune down his total score
        //if (player.fika) {
        //    player.totalScore -= 5;
        //}

    });

    // Sorting by skill score
    data.sort((a, b) => b.totalScore - a.totalScore);

    // Ranks and medals :D
    data.forEach((player, index) => {
        player.rank = index + 1;
        if (player.rank === 1) {
            player.medal = '🥇';
        } else if (player.rank === 2) {
            player.medal = '🥈';
        } else if (player.rank === 3) {
            player.medal = '🥉';
        } else {
            player.medal = '';
        }
    });
}

function getRankLabel(totalScore) {
    if (totalScore < 5) return 'L-';
    if (totalScore < 10) return 'L';
    if (totalScore < 17) return 'L+';
    if (totalScore < 18) return 'M-';
    if (totalScore < 19) return 'M';
    if (totalScore < 20) return 'M+';
    if (totalScore < 21) return 'H-';
    if (totalScore < 23) return 'H';
    if (totalScore < 24) return 'H+';
    if (totalScore < 25) return 'P-';
    if (totalScore < 27) return 'P';
    if (totalScore < 32) return 'P+';
    return 'G';
}

// Overall stats calc
function calculateOverallStats(data) {
    let totalDeaths = 0;
    let totalRaids = 0;
    let totalKills = 0;
    let totalKDR = 0;
    let totalSurvival = 0;
    let totalDamage = 0;

    //let totalDeathsFromTwitchPlayers = 0;

    data.forEach(player => {
        //if (player.isUsingTwitchPlayers) {
        //    totalDeaths += Math.round(player.totalRaids * (100 - player.survivedToDiedRatio) / 100);
        //    totalDeathsFromTwitchPlayers += Math.round(player.totalRaids * (100 - player.survivedToDiedRatio) / 100);
        //} else {
        if(player.disqualified !== "true"){
            totalDeaths += Math.round(player.totalRaids * (100 - player.survivedToDiedRatio) / 100);
            totalRaids += parseInt(player.totalRaids);
            totalKills += parseFloat(player.killToDeathRatio) * Math.round(player.totalRaids * (100 - player.survivedToDiedRatio) / 100);
            totalKDR += parseFloat(player.killToDeathRatio);
            totalSurvival += parseFloat(player.survivedToDiedRatio);
    
            if (player.publicProfile === "true") {
                totalDamage += player.damage;
            }
        }
    });

    const averageKDR = (totalKDR / data.length).toFixed(2);
    const averageSurvival = (totalSurvival / data.length).toFixed(2);

    // Update all stats
    animateNumber('totalDeaths', totalDeaths);
    //animateNumber('totalDeathsFromTP', totalDeathsFromTwitchPlayers);
    animateNumber('totalRaids', totalRaids);
    animateNumber('totalKills', Math.round(totalKills));
    animateNumber('totalDamage', totalDamage);
    animateNumber('averageKDR', averageKDR, 2);
    animateNumber('averageSurvival', averageSurvival, 2);
}

// Simple number animation (CountUp.js)
function animateNumber(elementId, targetValue, decimals = 0) {
    const element = document.getElementById(elementId);
    const suffix = elementId === 'averageSurvival' ? '%' : '';

    const countUp = new CountUp(element, targetValue, {
        startVal: 0,
        duration: 5,
        decimalPlaces: decimals,
        separator: ',',
        suffix: suffix
    });

    if (!countUp.error) {
        countUp.start();
    } else {
        console.error(countUp.error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        infoModal: document.getElementById('infoModal'),
        infoButton: document.getElementById('infoButton'),
        closeButtons: document.querySelectorAll('.close'),
        modals: document.querySelectorAll('.modal')
    };

    const toggleModal = (modal, show) => {
        if (show) {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
            }, 10);
        } else {
            modal.style.opacity = '0';
            modal.style.visibility = 'hidden';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    };

    // Event listeners
    elements.infoButton.addEventListener('click', () => toggleModal(elements.infoModal, true));

    // Close modal if close button was clicked
    elements.closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleModal(elements.infoModal, false);
        });
    });

    // Close modal if user clicked outside of it
    window.addEventListener('click', (event) => {
        if (event.target === elements.infoModal) toggleModal(elements.infoModal, false);
    });
});

//document.addEventListener('DOMContentLoaded', () => {
//    function formatTimeDifference(date) {
//        const now = new Date();
//        const diffInSeconds = Math.floor((now - date) / 1000); // Difference in seconds
//
//        const intervals = {
//            year: 31536000,
//            month: 2592000,
//            week: 604800,
//            day: 86400,
//            hour: 3600,
//            minute: 60,
//            second: 1,
//        };
//
//        // Find interval
//        for (const [unit, seconds] of Object.entries(intervals)) {
//            const interval = Math.floor(diffInSeconds / seconds);
//            if (interval >= 1) {
//                return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
//            }
//        }
//
//        return 'just now';
//        }

// Load date from file and convert it to text
// Yes, I use two similar functions for two similar reasons
//fetch('js/last-updated.txt')
//    .then(response => response.text())
//    .then(data => {
//        const dateParts = data.split(/[ .:]/);
//        const year = parseInt(dateParts[0], 10);
//        const month = parseInt(dateParts[1], 10) - 1; // stupid (js months starts from 0)
//        const day = parseInt(dateParts[2], 10);
//        const hour = parseInt(dateParts[3], 10);
//        const minute = parseInt(dateParts[4], 10);
//
//        const lastUpdatedDate = new Date(year, month, day, hour, minute);
//        const formattedDifference = formatTimeDifference(lastUpdatedDate);
//
// Display
//        document.getElementById('highlight').textContent = formattedDifference;
//    }).catch(error => console.error('Error loading date:', error));
//});

// This is used for announcement if needed
// Close announcement modal function
//document.addEventListener('DOMContentLoaded', function () {
//    const announcement = document.getElementById('seasonAnnouncement');
//   const closeBtn = document.getElementById('closeAnnouncement');
//
//    if (localStorage.getItem('announcementClosed') === 'true') {
//        announcement.style.display = 'none';
//    }
//
//    closeBtn.addEventListener('click', function () {
//        announcement.style.display = 'none';
//        localStorage.setItem('announcementClosed', 'true');
//    });
//
//    document.addEventListener('keydown', function (e) {
//        if (e.key === 'Escape') {
//            closeBtn.click();
//        }
//    });
//});

// Loading previous season for leaders
async function loadPreviousSeasonWinners() {
    if (seasons.length < 2) {
        console.log("Not enough seasons to show previous winners.");
        return;
    }

    const previousSeason = seasons[seasons.length - 1];

    try {
        const response = await fetch(`https://visuals.nullcore.net/hidden/season${previousSeason}.json`);

        // Throws us at season1 + 1. This is some serious SHIT
        if (!response.ok) throw new Error('Failed to load previous season data');

        const data = await response.json();
        const previousSeasonData = data.leaderboard;

        calculateRanks(previousSeasonData);
        displayWinners(previousSeasonData);
    } catch (error) {
        console.error('Error loading previous season:', error);
    }
}

// Display winners (from previous season)
function displayWinners(data) {
    const winnersTab = document.getElementById('winners');

    winnersTab.innerHTML = `
        <h2>Our previous season Champions!</h2>
    `;

    const top3Players = data.filter(player => player.rank <= 3);
    const winnersContainer = document.createElement('div');
    winnersContainer.className = 'winners-container';

    const orderedPlayers = [
        top3Players.find(p => p.rank === 2),
        top3Players.find(p => p.rank === 1),
        top3Players.find(p => p.rank === 3)
    ].filter(Boolean);

    orderedPlayers.forEach(player => {
        winnersContainer.innerHTML += `
            <div class="winner-card">
                <p class="winner-name">${player.medal} ${player.name}</p>
                <p class="winner-rank">${getRankText(player.rank)}</p>
                <p class="winner-skill">Skill score: ${player.totalScore.toFixed(2)}</p>
                <p class="winner-stats">Raids: ${player.totalRaids} | KDR: ${player.killToDeathRatio}</p>
            </div>
        `;
    });

    winnersTab.appendChild(winnersContainer);
}

// Get ranks for leaders of previous season
function getRankText(rank) {
    switch (rank) {
        case 1: return 'First place';
        case 2: return 'Second place';
        case 3: return 'Third place';
        default: return '';
    }
}

// Welcome screen
document.addEventListener('DOMContentLoaded', function () {
    const continueBtn = document.getElementById('continueBtn');
    const welcomePopup = document.getElementById('welcomePopup');

    if (localStorage.getItem('welcomePopupClosed') === 'true') {
        welcomePopup.style.display = 'none';
    } else if (localStorage.getItem('welcomePopupClosed') === 'false') {
        welcomePopup.style.display = 'flex';
        setTimeout(() => {
            welcomePopup.style.opacity = '1';
            welcomePopup.style.transform = 'translateY(0)';
        }, 10);
    }

    continueBtn.addEventListener('click', function () {
        welcomePopup.style.opacity = '0';
        welcomePopup.style.transform = 'translateY(-20px)';
        welcomePopup.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

        localStorage.setItem('welcomePopupClosed', 'true');

        setTimeout(() => {
            welcomePopup.style.display = 'none';
        }, 300);
    });
});

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
    if(player.disqualified === "true"){
        modal.style.display = 'block';
        showDisqualProfile(modalContent, player)
        return;
    }

    // Privated profile
    if (!isPublic) {
        showPrivateProfile(modalContent, player);
        modal.style.display = 'block';
        setupModalCloseHandlers(modal);
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
      <h3 class="player-profile-header">${player.name}</h3>
      <div class="private-profile-message">
        <div class="lock-icon">🔒</div>
        <p>This profile is private</p>
        <p class="small-text">This player has restricted access to additional stats</p>
      </div>
    `;
}

// Disqualified profile HTML
function showDisqualProfile(container, player) {
    container.innerHTML = `
      <h3 class="player-profile-header">${player.name}</h3>
      <div class="private-profile-message">
        <div class="lock-icon">👻</div>
        <p>This user is banned</p>
        <p class="small-text">This player has been disqualified from leaderboard</p>
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

    const factionImages = {
        'Bear': 'url(media/Bear.png)',
        'Usec': 'url(media/Usec.png)',
    };

    const factionBG = factionImages[player.faction] || '';

    // TODO: More data to add
    // Fav weapon + prestige
    container.innerHTML = `
      <div class="profile-background" style="background-image: ${factionBG}">
        <div class="profile-content-overlay">
          <h3 class="player-profile-header">${player.name}</h3>
          <div class="player-stats-container">
            
            <div class="player-stat-row">
              <span class="stat-label">Registered:</span>
              <span class="profile-stat-value">${regDate}</span>
            </div>
            
            ${player.damage ? `
              <div class="player-stat-row">
                <span class="stat-label">Overall Damage:</span>
                <span class="profile-stat-value">${player.damage.toLocaleString()}</span>
              </div>
            ` : ''}
            
            <div class="player-stat-row">
                <span class="stat-label">Successful Raids in a Row:</span>
                <span class="profile-stat-value">${player.currentWinstreak}</span>
            </div>

            ${player.longestShot ? `
              <div class="player-stat-row">
                <span class="stat-label">Longest Shot:</span>
                <span class="profile-stat-value">${player.longestShot.toLocaleString()} meters</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
}

// Close modals on click or out of bounds click
function setupModalCloseHandlers(modal) {
    const closeBtn = modal.querySelector('.profile-close-btn');
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }

    window.addEventListener('click', function closeModal(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            window.removeEventListener('click', closeModal);
        }
    });
}