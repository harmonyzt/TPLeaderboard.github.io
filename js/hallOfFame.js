function initHOF(player) {
    const toggleBtn = document.getElementById('toggle-hof-button');
    const hof = document.getElementById('player-profile-hof');
    const hof2 = document.getElementById('player-profile-hof-sec');

    const blocksToHide = [
        document.getElementById('raid-stats-grid'),
        document.getElementById('last-raid-feed')
    ];

    if (!toggleBtn || !hof || !hof2) {
        console.warn('HOF: toggle button or HOF block not found.');
        return;
    }

    toggleBtn.addEventListener('click', () => {
        const isHofVisible = hof.style.display === 'grid' || hof2.style.display === 'grid';

        hof.style.display = isHofVisible ? 'none' : 'grid';
        hof2.style.display = isHofVisible ? 'none' : 'grid';
        blocksToHide.forEach(block => {
            if (block) {
                block.style.display = isHofVisible ? 'grid' : 'none';
            }
        });

        toggleBtn.textContent = isHofVisible ? 'Profile Battlepass' : 'Back to Profile';
    });

    updatePlayerProfile(player);
    updatePlayerProfileMastery(player);
    refreshRewards(player);
}

function calculatePlayerLevel(player) {
    const expFromRaids = player.pmcRaids * 80;
    const expFromKills = player.pmcKills * 30;
    const expFromSurvival = player.survived * 75;
    const expFromDamage = Math.floor(player.damage / 1000);
    const expFromSkill = Math.round(player.totalScore * 1500);

    // get summary
    const totalExp = expFromRaids + expFromKills + expFromSurvival + expFromDamage + expFromSkill;

    // 1800 exp per lvl
    const level = Math.floor(totalExp / 1800);
    const currentLevelExp = totalExp % 1000;
    const expForNextLevel = 1000;

    player.battlePassLevel = level;

    return {
        level: level,
        currentExp: currentLevelExp,
        expForNextLevel: expForNextLevel,
        totalExp: totalExp
    };
}

function calculateMasteryLevel(player) {
    let expFromMastery = 0;

    if(player?.isUsingStattrack){
        expFromMastery = 
            (player.modWeaponStats.bestWeapon.stats.totalShots * 0.1) + 
            (player.modWeaponStats.bestWeapon.stats.kills * 10) + 
            (player.modWeaponStats.bestWeapon.stats.headshots * 5);
    } else {
        expFromMastery = 0;
    }

    // get summary
    const totalExp = expFromMastery;

    // 1800 exp per lvl
    const level = Math.floor(totalExp / 1000);
    const currentLevelExp = totalExp % 1000;
    const expForNextLevel = 1000;

    return {
        level: level,
        currentExp: currentLevelExp,
        expForNextLevel: expForNextLevel,
        totalExp: totalExp
    };
}

// EXP for weapon mastery
function updatePlayerProfileMastery(player) {
    const levelData = calculateMasteryLevel(player);

    // update level
    document.querySelector('.level-value-wp').textContent = levelData.level;

    // update exp bar
    const expPercentage = (levelData.currentExp / levelData.expForNextLevel) * 100;
    document.querySelector('.exp-progress-wp').style.width = `${expPercentage}%`;

    // update exp values
    document.querySelector('.current-exp-wp').textContent = levelData.currentExp.toLocaleString();
    document.querySelector('.next-level-exp-wp').textContent = levelData.expForNextLevel.toLocaleString();
    const remainingExp = levelData.expForNextLevel - levelData.currentExp;
    document.querySelector('.remaining-value-wp').textContent = remainingExp.toLocaleString();
}

// EXP for leaderboard level
function updatePlayerProfile(player) {
    const levelData = calculatePlayerLevel(player);

    // update level
    document.querySelector('.level-value').textContent = levelData.level;

    // update exp bar
    const expPercentage = (levelData.currentExp / levelData.expForNextLevel) * 100;
    document.querySelector('.exp-progress').style.width = `${expPercentage}%`;

    // update exp values
    document.querySelector('.current-exp').textContent = levelData.currentExp.toLocaleString();
    document.querySelector('.next-level-exp').textContent = levelData.expForNextLevel.toLocaleString();
    const remainingExp = levelData.expForNextLevel - levelData.currentExp;
    document.querySelector('.remaining-value').textContent = remainingExp.toLocaleString();
}

