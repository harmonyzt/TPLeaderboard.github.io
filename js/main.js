// When data loaded
document.addEventListener('DOMContentLoaded', detectSeasons);

let leaderboardData = []; // For keeping current season data
let allSeasonsCombinedData = []; // For keeping combined data from all seasons
let sortDirection = {}; // Sort direction
let seasons = []; // Storing available seasons

//  https://visuals.nullcore.net/hidden/season
const seasonPath = "https://visuals.nullcore.net/hidden/season";
const seasonPathEnd = ".json";

// Check if season file exists
async function checkSeasonExists(seasonNumber) {
    try {
        const response = await fetch(`${seasonPath}${seasonNumber}${seasonPathEnd}`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Detect available seasons
async function detectSeasons() {
    let seasonNumber = 1;
    seasons = [];

    while (await checkSeasonExists(seasonNumber)) {
        seasons.push(seasonNumber);
        seasonNumber++;
    }

    seasons.sort((a, b) => b - a); // Sort from newest to oldest

    populateSeasonDropdown();

    // Determine previous winners if we have latest leaderboard
    //if (seasons.length > 1) {
    //    loadPreviousSeasonWinners();
    //}

    // Load the latest season data by default
    if (seasons.length > 0) {
        loadAllSeasonsData();
        loadSeasonData(seasons[0]);
    }
}

// Previous season winners functionality
async function loadPreviousSeasonWinners() {
    if (seasons.length < 2) return;

    const previousSeason = seasons[seasons.length - 1];

    try {
        const response = await fetch(`${seasonPath}${previousSeason}${seasonPathEnd}`);
        if (!response.ok) return;

        const data = await response.json();
        const previousSeasonData = data.leaderboard || [];

        calculateRanks(previousSeasonData);
        displayWinners(previousSeasonData);
    } catch (error) {
        console.error('Error loading previous season:', error);
    }
}

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
                <p class="winner-stats">Raids: ${player.pmcRaids} | KDR: ${player.killToDeathRatio}</p>
            </div>
        `;
    });

    winnersTab.appendChild(winnersContainer);
}

function getRankText(rank) {
    switch (rank) {
        case 1: return '👑 First place 👑';
        case 2: return 'Second place';
        case 3: return 'Third place';
        default: return '';
    }
}

// Populate season dropdown menu
function populateSeasonDropdown() {
    const seasonSelect = document.getElementById('seasonSelect');
    seasonSelect.innerHTML = '';

    // Add individual seasons
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season;
        option.textContent = `Season ${season}`;
        seasonSelect.appendChild(option);
    });

    seasonSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
            loadSeasonData(selectedValue);
    });
}

// Load data for a specific season
async function loadSeasonData(season) {
    const loadingNotification = document.getElementById('loadingNotification');
    const emptyLeaderboardNotification = document.getElementById('emptyLeaderboardNotification');

    emptyLeaderboardNotification.style.display = 'none';
    loadingNotification.style.display = 'block';

    try {
        const response = await fetch(`${seasonPath}${season}${seasonPathEnd}`);

        if (!response.ok) {
            throw new Error('Failed to load season data');
        }

        const data = await response.json();
        leaderboardData = data.leaderboard || [];

        if (leaderboardData.length === 0 || (leaderboardData.length === 1 && Object.keys(leaderboardData[0]).length === 0)) {
            emptyLeaderboardNotification.style.display = 'block';
            resetStats();
        } else {
            processSeasonData(leaderboardData);
            displayLeaderboard(leaderboardData);
        }
    } catch (error) {
        console.error('Error loading season data:', error);
    } finally {
        loadingNotification.style.display = 'none';
    }
}

// Load and combine data from all seasons
async function loadAllSeasonsData() {
    try {
        const uniquePlayers = {};

        for (const season of seasons) {
            try {
                const response = await fetch(`${seasonPath}${season}${seasonPathEnd}`);


                const data = await response.json();
                if (!data.leaderboard || data.leaderboard.length === 0) continue;

                data.leaderboard.forEach(player => {
                    const playerKey = player.id || player.name;
                    
                    if (!uniquePlayers[playerKey]) {
                        // New player - initialize with current season data
                        uniquePlayers[playerKey] = {
                            ...player,
                            seasonsPlayed: [season],
                            seasonsCount: 1
                        };
                    } else {
                        // Existing player - update if this season is more recent
                        if (compareLastPlayed(player.lastPlayed, uniquePlayers[playerKey].lastPlayed) > 0) {
                            const { seasonsPlayed, seasonsCount, ...rest } = uniquePlayers[playerKey];
                            uniquePlayers[playerKey] = {
                                ...player,
                                seasonsPlayed: seasonsPlayed.includes(season) ? seasonsPlayed : [...seasonsPlayed, season],
                                seasonsCount: seasonsPlayed.includes(season) ? seasonsCount : seasonsCount + 1
                            };
                        } else if (!uniquePlayers[playerKey].seasonsPlayed.includes(season)) {
                            // Add seasons to player's record
                            uniquePlayers[playerKey].seasonsPlayed.push(season);
                            uniquePlayers[playerKey].seasonsCount += 1;
                        }
                    }
                });
            } catch (error) {
                console.error(`Error processing season ${season}:`, error);
                continue;
            }
        }

        allSeasonsCombinedData = Object.values(uniquePlayers);

    } catch (error) {
        console.error('Error loading all seasons data:', error);
    }
}

// Process season data
function processSeasonData(data) {
    addColorIndicators(data);
    calculateRanks(data);
    calculateOverallStats(data);
}

// Reset stats when no data is available
function resetStats() {
    animateNumber('totalDeaths', 0);
    animateNumber('totalRaids', 0);
    animateNumber('totalKills', 0);
    animateNumber('totalDamage', 0);
    animateNumber('averageKDR', 0, 2);
    animateNumber('averageSurvival', 0, 2);
}

// Compare last played dates (supports both Unix timestamps and "dd.mm.yyyy" format)
function compareLastPlayed(dateStr1, dateStr2) {
    const parseDate = (dateStr) => {
        if (/^\d+$/.test(dateStr)) {
            return new Date(parseInt(dateStr) * 1000);
        }

        if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateStr)) {
            const [d, m, y] = dateStr.split('.').map(Number);
            return new Date(y, m - 1, d);
        }

        return null;
    };

    const date1 = parseDate(dateStr1);
    const date2 = parseDate(dateStr2);

    if (!date1 || !date2) return 0;
    return date1 - date2;
}

// To 00:00
function formatSeconds(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// Display leaderboard table
function displayLeaderboard(data) {
    const tableBody = document.querySelector('#leaderboardTable tbody');
    tableBody.innerHTML = '';

    data.forEach(player => {
        const row = document.createElement('tr');

        // Determine rank classes
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

        // Format last played time
        const lastGame = formatLastPlayed(player.lastPlayed);
        player.isOnline = lastGame === "In game <div id=\"blink\"></div>";

        // Account type handling
        let accountIcon = '';
        let accountColor = '';
        if (player.disqualified === "false") {
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

        // Prestige icon
        const prestigeImg = [1, 2].includes(player.prestige)
            ? `<img src="media/prestige${player.prestige}.png" style="width: 30px; height: 30px" class="prestige-icon" alt="Prestige ${player.prestige}">`
            : '';

        // Skill rank label
        const rankLabel = getRankLabel(player.totalScore);

        row.innerHTML = `
            <td class="rank ${rankClass}">${player.rank} ${player.medal}</td>
            <td class="player-name ${nameClass}" style="color: ${accountColor}" data-player-id="${player.id || '0'}"> ${accountIcon} ${player.name} ${prestigeImg}</td>
            <td>${lastGame || 'N/A'}</td>
            <td>${player.pmcLevel <= 0 ? '0' : player.pmcLevel}</td>
            <td>${player.pmcRaids}</td>
            <td class="${player.survivedToDiedRatioClass}">${player.survivalRate}%</td>
            <td class="${player.killToDeathRatioClass}">${player.killToDeathRatio}</td>
            <td class="${player.averageLifeTimeClass}">${formatSeconds(player.averageLifeTime)}</td>
            <td>${player.totalScore <= 0 ? 'Calibrating...' : player.totalScore.toFixed(2)} ${player.totalScore <= 0 ? '' : `(${rankLabel})`}</td>
            <td>${player.sptVer}</td>
        `;

        tableBody.appendChild(row);
    });

    // Add click handlers for player names
    document.querySelectorAll('.player-name').forEach(element => {
        element.addEventListener('click', () => {
            openProfile(element.dataset.playerId);
        });
    });

    // Add sort listeners
    addSortListeners();
}

// Format last played time
function formatLastPlayed(unixTimestamp) {
    if (typeof unixTimestamp !== 'number' || unixTimestamp <= 0) {
        return 'Unknown';
    }

    const date = new Date(unixTimestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 60) {
        return 'In game <div id="blink"></div>';
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

// Add color indicators to player stats
function addColorIndicators(data) {
    data.forEach(player => {
        // Survived/Died Ratio
        if (player.survivalRate < 30) {
            player.survivedToDiedRatioClass = 'bad';
        } else if (player.survivalRate < 55) {
            player.survivedToDiedRatioClass = 'average';
        } else if (player.survivalRate < 65) {
            player.survivedToDiedRatioClass = 'good';
        } else {
            player.survivedToDiedRatioClass = 'impressive';
        }

        // Kill/Death Ratio
        if (player.killToDeathRatio < 5) {
            player.killToDeathRatioClass = 'bad';
        } else if (player.killToDeathRatio < 12) {
            player.killToDeathRatioClass = 'average';
        } else if (player.killToDeathRatio < 15) {
            player.killToDeathRatioClass = 'good';
        } else {
            player.killToDeathRatioClass = 'impressive';
        }

    });
}

// Convert time string to seconds
function convertTimeToSeconds(time) {
    if (!time) return 0;
    const [minutes, seconds] = time.split(':').map(Number);
    return minutes * 60 + seconds;
}

// Calculate player ranks
function calculateRanks(data) {
    data.forEach(player => {
        const kdrScore = player.killToDeathRatio * 0.1;
        const sdrScore = player.survivalRate * 0.2;
        const raidsScore = player.pmcRaids * 0.6;
        const pmcLevelScore = player.pmcLevel * 0.1;

        const MIN_RAIDS = 50;
        const SOFT_CAP_RAIDS = 100;

        if (player.disqualified === "true") {
            player.totalScore = 0;
            player.damage = 0;
            player.killToDeathRatio = 0;
            player.survivedToDiedRatio = 0;
        } else {
            player.totalScore = kdrScore + sdrScore + Math.log(raidsScore) + pmcLevelScore;
        }

        if (player.pmcRaids <= MIN_RAIDS) {
            player.totalScore *= 0.3;
        } else if (player.pmcRaids < SOFT_CAP_RAIDS) {
            const progress = (player.pmcRaids - MIN_RAIDS) / (SOFT_CAP_RAIDS - MIN_RAIDS);
            player.totalScore *= 0.3 + (0.7 * progress);
        }
    });

    
    // Sort by total score
    data.sort((a, b) => b.totalScore - a.totalScore);

    // Assign ranks and medals
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

// Get skill rank label
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

// Calculate overall stats
function calculateOverallStats(data) {
    let totalRaids = 0;
    let totalKills = 0;
    let totalDeaths = 0;
    let totalDamage = 0;

    let totalKDR = 0;
    let totalSurvival = 0;
    let validPlayers = 0;

    data.forEach(player => {
        if (player.disqualified !== true && player.disqualified !== "true") {
            const pmcRaids = Math.max(0, parseInt(player.pmcRaids) || 0);
            const survivalRate = Math.min(100, Math.max(0, parseFloat(player.survivalRate) || 0));
            const kdr = Math.max(0, parseFloat(player.killToDeathRatio) || 0);

            if (pmcRaids > 0) {
                totalRaids += pmcRaids;

                const estimatedDeaths = kdr > 0 ? pmcRaids / (1 + kdr) : pmcRaids;
                const estimatedKills = pmcRaids - estimatedDeaths;

                totalKills += estimatedKills;
                totalDeaths += estimatedDeaths;

                totalKDR += kdr;
                totalSurvival += survivalRate;
                validPlayers++;

                if (player.publicProfile) {
                    totalDamage += parseFloat(player.damage) || 0;
                }
            }
        }
    });

    const averageKDR = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : "0.00";
    const averageSurvival = validPlayers > 0 ? (totalSurvival / validPlayers).toFixed(2) : "0.00";

    animateNumber('totalRaids', totalRaids);
    animateNumber('totalKills', Math.round(totalKills));
    animateNumber('totalDeaths', Math.round(totalDeaths));
    animateNumber('totalDamage', totalDamage);
    animateNumber('averageKDR', averageKDR, 2);
    animateNumber('averageSurvival', averageSurvival, 2);
}


// Simple number animation (CountUp.js)
let countTimer = 2;
function animateNumber(elementId, targetValue, decimals = 0) {
    const element = document.getElementById(elementId);
    const suffix = elementId === 'averageSurvival' ? '%' : '';

    const countUp = new CountUp(element, targetValue, {
        startVal: 0,
        duration: countTimer += 0.3,
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

// Add sort listeners to table headers
function addSortListeners() {
    const headers = document.querySelectorAll('#leaderboardTable th[data-sort]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.getAttribute('data-sort');
            sortLeaderboard(sortKey);
        });
    });
}

// Sort leaderboard data
function sortLeaderboard(sortKey) {
    if (!sortDirection[sortKey]) {
        sortDirection[sortKey] = 'asc';
    } else {
        sortDirection[sortKey] = sortDirection[sortKey] === 'asc' ? 'desc' : 'asc';
    }

    const currentData = leaderboardData.length > 0 ? leaderboardData : allSeasonsCombinedData;
    
    currentData.sort((a, b) => {
        let valueA = a[sortKey];
        let valueB = b[sortKey];

        if (sortKey === 'rank') {
            valueA = a.rank;
            valueB = b.rank;
        }

        if (['pmcLevel', 'pmcRaids', 'survivalRate', 'killToDeathRatio', 'totalScore'].includes(sortKey)) {
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

    displayLeaderboard(currentData);
}

// Welcome popup
document.addEventListener('DOMContentLoaded', function () {
    const continueBtn = document.getElementById('continueBtn');
    const welcomePopup = document.getElementById('welcomePopup');

    if (localStorage.getItem('welPopupClosed') === 'true') {
        welcomePopup.style.display = 'none';
    } else {
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

        localStorage.setItem('welPopupClosed', 'true');

        setTimeout(() => {
            welcomePopup.style.display = 'none';
        }, 300);
    });
});