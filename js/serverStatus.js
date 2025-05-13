async function getServerStatus() {
    try {
        const response = await fetch('online.json');
        if (!response.ok) throw new Error('Server not responding');
        return await response.json();
    } catch (error) {
        return {
            online: false,
            underWork: false,
            workText: "Failed to connect to server. Check your connection!"
        };
    }
}

async function updateServerStatus() {
    const status = await getServerStatus();
    const statusElement = document.getElementById('serverStatus');
    
    statusElement.className = 'live-data-label server-status';
    statusElement.removeAttribute('data-tooltip');
    
    if (status.underWork) {
        statusElement.textContent = 'Server Maintenance';
        statusElement.classList.add('server-maintenance');
        if (status.workText) {
            statusElement.setAttribute('data-tooltip', status.workText);
        }
    } else if (status.online) {
        statusElement.textContent = 'Server Online';
        statusElement.classList.add('server-online');
    } else {
        statusElement.textContent = 'Server Offline';
        statusElement.classList.add('server-offline');
        if (status.workText) {
            statusElement.setAttribute('data-tooltip', status.workText);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateServerStatus();
    setInterval(updateServerStatus, 30000);
    
    const statusElement = document.getElementById('serverStatus');
    statusElement.addEventListener('mouseenter', showTooltip);
    statusElement.addEventListener('mouseleave', hideTooltip);
});

function showTooltip(e) {
    if (!this.hasAttribute('data-tooltip')) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'server-tooltip';
    tooltip.textContent = this.getAttribute('data-tooltip');
    
    document.body.appendChild(tooltip);
    
    const rect = this.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
}

function hideTooltip() {
    const tooltip = document.querySelector('.server-tooltip');
    if (tooltip) tooltip.remove();
}