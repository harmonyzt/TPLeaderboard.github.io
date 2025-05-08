let updateInterval = 60; // seconds
let timeLeft = updateInterval;
let autoUpdateEnabled = true;
let updateTimer;

function initControls() {
    const autoUpdateToggle = document.getElementById('autoUpdateToggle');
    const updateIntervalSelect = document.getElementById('updateInterval');
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
    
    updateIntervalSelect.addEventListener('change', (e) => {
        updateInterval = parseInt(e.target.value);
        timeLeft = updateInterval;
        if (autoUpdateEnabled) {
            clearTimeout(updateTimer);
            startUpdateTimer();
        }
        updateTimeDisplay();
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

// only on dom load
document.addEventListener('DOMContentLoaded', initControls);