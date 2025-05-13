let updateInterval = 5; // seconds
let timeLeft = updateInterval;
let autoUpdateEnabled = true;
let updateTimer;

function setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
}

// Initialize controls from cookies
function initControlsFromCookies() {
    // Auto-update toggle
    const autoUpdateToggle = document.getElementById('autoUpdateToggle');
    const savedAutoUpdate = getCookie('autoUpdateEnabled');
    autoUpdateToggle.checked = savedAutoUpdate !== 'false';
    autoUpdateEnabled = autoUpdateToggle.checked;

    updateTimeDisplay();
}

// Save controls to cookies
function saveControlsToCookies() {
    setCookie('autoUpdateEnabled', autoUpdateEnabled);
    setCookie('updateInterval', updateInterval);
}

function initControls() {
    const autoUpdateToggle = document.getElementById('autoUpdateToggle');
    const manualUpdateBtn = document.getElementById('manualUpdate');
    const timeToUpdateSpan = document.getElementById('timeToUpdate');

    autoUpdateToggle.addEventListener('change', (e) => {
        autoUpdateEnabled = e.target.checked;
        if (autoUpdateEnabled) {
            startUpdateTimer();
        } else {
            clearTimeout(updateTimer);
            timeToUpdateSpan.textContent = "Auto-update disabled";
        }
    });


    manualUpdateBtn.addEventListener('click', () => {
        detectSeasons();
        if (autoUpdateEnabled) {
            timeLeft = updateInterval;
            updateTimeDisplay();
        }
    });

    // start timer
    startUpdateTimer();

    function startUpdateTimer() {
        updateTimer = setInterval(() => {
            timeLeft--;

            updateTimeDisplay();

            if (timeLeft <= 0) {
                detectSeasons();
                timeLeft = updateInterval;
            }
        }, 1000);
    }

    function updateTimeDisplay() {
        timeToUpdateSpan.textContent = `Next update in: ${timeLeft}s`;
    }
}
