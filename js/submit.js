//<div class="header-buttons">
//<button id="uploadButton">Upload your SPT Profile</button>
//<input type="file" id="fileInput" accept=".json" style="display: none;">
//</input></div>
//<div class="progress-bar">
//<div class="progress"></div>
//</div>
//<p id="status"></p>

// DOM
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const progressBar = document.querySelector('.progress');
const statusText = document.getElementById('status');

// Find keys in Items stats of EFT profile
function findValueByKey(items, key) {
    const item = items.find((item) => {
        return (
            item.Key.length === key.length &&
            item.Key.every((k, index) => k === key[index])
        );
    });
    return item ? item.Value : null;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60); 
    const remainingSeconds = seconds % 60; 
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`; // MM:SS
}

// Opening file upload
uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        progressBar.style.width = '0%';
        statusText.textContent = 'Loading file...';

        // For reading
        const reader = new FileReader();

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentLoaded = (e.loaded / e.total) * 100;
                progressBar.style.width = `${percentLoaded}%`;
            }
        };

        reader.onload = (e) => {
            const profile = JSON.parse(e.target.result);

            // Extracting data from JSON profile
            const kills = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['Kills']);
            const deaths = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['Deaths']);
            const totalRaids = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['Sessions', 'Pmc']);

            // Survive Rate
            let surviveRate = 0;
            if (totalRaids > 0) {
                surviveRate = ((totalRaids - deaths) / totalRaids) * 100;
                surviveRate = surviveRate.toFixed(2);
            }

            // K/D Ratio
            const killToDeathRatio = deaths !== 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2); // Если deaths = 0, возвращаем kills

            const averageLifeTimeSeconds = findValueByKey(profile.characters.pmc.Stats.Eft.OverallCounters.Items, ['LifeTime', 'Pmc']);

            // MM:SS Lifetime
            const averageLifeTimeFormatted = formatTime(averageLifeTimeSeconds);

            // Assigning a new record of profile
            const requiredData = {
                name: profile.characters.pmc.Info.Nickname,
                lastPlayed: profile.characters.pmc.Stats.Eft.LastSessionDate,
                pmcLevel: profile.characters.pmc.Info.Level,
                totalRaids: totalRaids,
                survivedToDiedRatio: surviveRate,
                killToDeathRatio: killToDeathRatio,
                averageLifeTime: averageLifeTimeFormatted,
                accountType: profile.characters.pmc.Info.GameVersion,
                isUsingTwitchPlayers: profile.spt.mods.name,
                sptVer: profile.spt.version,
            };

            // Loading data.json
            fetch('js/data.json')
                .then((response) => response.json())
                .then((data) => {
                    // Adding new data (from SPT profile) to leaderboard
                    data.leaderboard.push(requiredData);

                    // Save data.json
                    return fetch('data.json', {
                        method: 'PUT', // 'POST'
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });
                })
                .then(() => {
                    statusText.textContent = 'Succ!';
                    progressBar.style.width = '100%';
                })
                .catch((error) => {
                    console.error('Error:', error);
                    statusText.textContent = 'Error.';
                    progressBar.style.backgroundColor = '#ff0000';
                });
        };

        reader.onerror = () => {
            statusText.textContent = 'Error reading the file.';
            progressBar.style.backgroundColor = '#ff0000';
        };

        reader.readAsText(file);
    } else {
        alert('Please choose JSON SPT file.');
    }
});