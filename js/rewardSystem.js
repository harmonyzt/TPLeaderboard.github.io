function refreshRewards(player) {
    // Background behind profile card
    const mainBackground = document.getElementById('playerProfileModal');

    // For background for main profile card
    const profileCard = document.getElementById('main-profile-card');

    // To change any avatar things (like border color around PFP)
    const profileAvatar = document.getElementById('profile-avatar');

    // Reset
    resetStyles(mainBackground, profileCard, profileAvatar);

    // Now apply
    applyBackgroundReward(player, profileCard);
    applyMainBackgroundReward(player, mainBackground);
    applyPfpStyleReward(player, profileAvatar);
    applyPfpBorderReward(player, profileAvatar);
}

function resetStyles(mainBackground, profileCard, profileAvatar) {
    mainBackground.style.backgroundImage = '';
    mainBackground.style.backgroundColor = '';
    mainBackground.classList.remove('usec-background', 'bear-background');

    profileCard.style.backgroundImage = '';
    profileCard.classList.remove('streets-bg', 'streets2-bg', 'streets3-bg', 'purple-bg', 'labs-bg');


    profileAvatar.classList.remove(
        'wide-style', 'box-style', 'red-border', 'pink-border', 'white-border', 'black-border'
    );
}

function applyBackgroundReward(player, profileCard) {
    const level = player.battlePassLevel;
    const reward = player.bp_cardbg;

    // automatically choose 
    if (reward === "labs" && level >= 25) {
        profileCard.classList.add('labs-bg');
    } else if (reward === "purple" && level >= 15) {
        profileCard.classList.add('purple-bg');
    } else if (reward === "streets3" && level >= 10) {
        profileCard.classList.add('streets3-bg');
    } else if (reward === "streets2" && level >= 7) {
        profileCard.classList.add('streets2-bg');
    } else if (reward === "streets" && level >= 4) {
        profileCard.classList.add('streets-bg');
    }
}

function applyMainBackgroundReward(player, mainBackground) {
    const level = player.battlePassLevel;
    const reward = player.bp_mainbg;

    if (reward === 'usec' && level >= 5) {
        mainBackground.classList.add('usec-background');
    } else if (reward === 'bear' && level >= 5) {
        mainBackground.classList.add('bear-background');
    } else if (reward === 'none') {
        // do nothing
    } else {
        // Default background
        mainBackground.style.backgroundColor = 'none';
    }

    if (player.usePrestigeStyling && player.prestige > 0) {

    }

}

function applyPfpStyleReward(player, profileAvatar) {
    const level = player.battlePassLevel;
    const reward = player.bp_pfpStyle;

    if (reward === 'box' && level >= 5) {
        profileAvatar.classList.add('box-style');
    } else if (reward === 'wide' && level >= 10) {
        profileAvatar.classList.add('wide-style');
    }
}

function applyPfpBorderReward(player, profileAvatar) {
    const level = player.battlePassLevel;
    const reward = player.bp_pfpbordercolor;

    if (reward !== 'default') {
        if ((reward === 'red' && level >= 5) ||
            (reward === 'pink' && level >= 8) ||
            (reward === 'white' && level >= 10) ||
            (reward === 'black' && level >= 15)) {
            profileAvatar.classList.add(`${reward}-border`);
        }
        return;
    }

    if (level >= 15) {
        profileAvatar.classList.add('black-border');
    } else if (level >= 10) {
        profileAvatar.classList.add('white-border');
    } else if (level >= 8) {
        profileAvatar.classList.add('pink-border');
    } else if (level >= 5) {
        profileAvatar.classList.add('red-border');
    }
}