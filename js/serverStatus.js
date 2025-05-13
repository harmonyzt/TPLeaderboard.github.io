async function checkServerStatus() {
    try {
        const response = await fetch('https://visuals.nullcore.net/hidden/online.json');
        if (response.ok) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

async function updateServerStatus() {
    const isOnline = await checkServerStatus();
    const statusElement = document.getElementById('serverStatus');

    if (isOnline) {
        statusElement.textContent = 'Server Online';
        statusElement.style.color = '#66ff66';
        statusElement.style.textShadow = '0 0 8px #6affa3';
    } else {
        statusElement.textContent = 'Server Offline';
        statusElement.style.color = '#ff6666';
        statusElement.style.textShadow = '0 0 8px #ff6a6a';
    }
}

// 30 sec update
updateServerStatus();
setInterval(updateServerStatus, 30000);

document.getElementById('serverStatus').style.transition = 'all 0.3s ease';