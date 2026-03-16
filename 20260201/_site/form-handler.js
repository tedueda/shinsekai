document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const timestampField = document.getElementById('formTimestamp');
    const honeypot = document.getElementById('website');

    if (!form) {
        return;
    }

    if (timestampField) {
        timestampField.value = String(Date.now());
    }

    form.addEventListener('submit', (event) => {
        if (honeypot && honeypot.value !== '') {
            event.preventDefault();
            return;
        }

        if (timestampField) {
            const loadedAt = Number(timestampField.value);
            const diffSeconds = (Date.now() - loadedAt) / 1000;
            if (Number.isFinite(diffSeconds) && diffSeconds >= 0 && diffSeconds < 1) {
                event.preventDefault();
                alert('送信が早すぎます。もう一度お試しください。');
            }
        }
    });
});
