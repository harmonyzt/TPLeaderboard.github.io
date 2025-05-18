document.addEventListener('DOMContentLoaded', function () {

    const closeButton = document.querySelector('.close-notification');
    const notification = document.querySelector('.leaderboard-notification');

    if (closeButton && notification) {
        closeButton.addEventListener('click', function () {
            closeNotification();
        });

        // 50 second timeout
        const autoCloseTimer = setTimeout(closeNotification, 50000);

        function closeNotification() {
            clearTimeout(autoCloseTimer);
            notification.classList.add('hide');

            notification.addEventListener('animationend', function handler() {
                notification.removeEventListener('animationend', handler);
                notification.remove();
            });
        }
    }
});