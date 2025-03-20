// DOM
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const profileInfo = document.getElementById('profile-info');

function formatTime(minutes) {
    const totalSeconds = minutes * 60;
    const formattedMinutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);
    const formattedMinutesStr = String(formattedMinutes).padStart(2, '0');
    const formattedSecondsStr = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutesStr}:${formattedSecondsStr}`;
}

function formatTimeAgoUnix(unixTimestamp) {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = currentTime - unixTimestamp;

    const intervals = [
        { label: 'y', seconds: 31536000 },
        { label: 'm', seconds: 2592000 },
        { label: 'd', seconds: 86400 },
        { label: 'h', seconds: 3600 },
        { label: 'min', seconds: 60 },
        { label: 'sec', seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(timeDifference / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label[0]} ago`;
        }
    }

    return 'just now';
}

// Opening file upload window
uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {

        const reader = new FileReader();

        reader.onload = (e) => {
            const profile = JSON.parse(e.target.result);

            // Extracting data from JSON profile
            const kills = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['Kills'], false);
            const deaths = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['Deaths'], false);
            const totalRaids = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['Sessions', 'Pmc'], false);
            const totalLifetime = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['LifeTime', 'Pmc'], false);

            // Survive Rate
            let surviveRate = 0;
            if (totalRaids > 0) {
                surviveRate = ((totalRaids - deaths) / totalRaids) * 100;
                surviveRate = surviveRate.toFixed(2);
            }

            // K/D Ratio
            const killToDeathRatio = deaths !== 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);

            // AVG Life time calc (dont look im tired okay)
            const LifeTimeMinutes = totalLifetime / 60;
            const LifeTimeMinutesAverage = LifeTimeMinutes / totalRaids;
            const averageLifeTimeFormatted = formatTime(LifeTimeMinutesAverage);

            // If TP is installed
            const isModFound = findValueByKey(profile.spt.mods, "[SAIN] Twitch Players", true)

            // Assigning a new record of profile
            const requiredData = {
                id: profile.info.id,
                name: profile.characters.pmc.Info.Nickname,
                lastPlayed: formatTimeAgoUnix(profile.characters.pmc.Stats.Eft.LastSessionDate),
                pmcLevel: profile.characters.pmc.Info.Level,
                totalRaids: totalRaids,
                survivedToDiedRatio: surviveRate,
                killToDeathRatio: killToDeathRatio,
                averageLifeTime: averageLifeTimeFormatted,
                accountType: profile.characters.pmc.Info.GameVersion,
                isUsingTwitchPlayers: isModFound,
                sptVer: profile.spt.version,
            };

            // Showing stats
            profileInfo.innerHTML = `
                <p><strong>ID:</strong> ${requiredData.id}</p>
                <p><strong>Name:</strong> ${requiredData.name}</p>
                <p><strong>Last game:</strong> ${requiredData.lastPlayed}</p>
                <p><strong>PMC Level:</strong> ${requiredData.pmcLevel}</p>
                <p><strong>Total Raids:</strong> ${requiredData.totalRaids}</p>
                <p><strong>SDR:</strong> ${requiredData.survivedToDiedRatio}%</p>
                <p><strong>K/D Ratio:</strong> ${requiredData.killToDeathRatio}</p>
                <p><strong>Average Life Time:</strong> ${requiredData.averageLifeTime}</p>
                <p><strong>Account:</strong> ${requiredData.accountType}</p>
                <p><strong>Using Twitch Players:</strong> ${requiredData.isUsingTwitchPlayers}</p>
                <p><strong>SPT Version:</strong> ${requiredData.sptVer}</p>
            `;
        };

        reader.readAsText(file);
    } else {
        alert('Please choose SPT Profile .json file.');
    }
});

// Find keys in Items stats of EFT profile
function findValueByKey(data, key, isModSearch = false) {
    if (isModSearch) {
        const mod = data.find((mod) => mod.name === key);
        return mod !== undefined;
    }

    const item = data.find((item) => {
        return (
            item.Key.length === key.length &&
            item.Key.every((k, index) => k === key[index])
        );
    });
    return item ? item.Value : null;
}