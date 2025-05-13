function initHOF(player) {
    const toggleBtn = document.getElementById('toggle-hof-button');
    const hof = document.getElementById('player-profile-hof');

    const blocksToHide = [
        document.getElementById('raid-stats-grid'),
        document.getElementById('last-raid-feed')
    ];

    if (!toggleBtn || !hof) {
        console.warn('HOF: toggle button or HOF block not found.');
        return;
    }

    toggleBtn.addEventListener('click', () => {
        const isHofVisible = hof.style.display === 'flex';

        hof.style.display = isHofVisible ? 'none' : 'flex';
        blocksToHide.forEach(block => {
            if (block) {
                block.style.display = isHofVisible ? 'grid' : 'none';
            }
        });

        toggleBtn.textContent = isHofVisible ? 'Show Hall of Fame' : 'Back to Profile';
    });
}
