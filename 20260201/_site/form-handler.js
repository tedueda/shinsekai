document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const timestampField = document.getElementById('formTimestamp');
    const honeypot = document.getElementById('website');
    const recaptchaField = document.getElementById('recaptchaToken');
    const RECAPTCHA_SITE_KEY = '6Lcq9ZEsAAAAAERRU2QnIxp414iYCMlATX7wjy5I';

    if (!form) {
        return;
    }

    if (timestampField) {
        timestampField.value = String(Date.now());
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (honeypot && honeypot.value !== '') {
            return;
        }

        if (timestampField) {
            const loadedAt = Number(timestampField.value);
            const diffSeconds = (Date.now() - loadedAt) / 1000;
            if (Number.isFinite(diffSeconds) && diffSeconds >= 0 && diffSeconds < 3) {
                alert('送信が早すぎます。もう一度お試しください。');
                return;
            }
        }

        if (typeof grecaptcha !== 'undefined' && recaptchaField) {
            grecaptcha.ready(() => {
                grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'contact' })
                    .then((token) => {
                        recaptchaField.value = token;
                        form.submit();
                    })
                    .catch(() => {
                        form.submit();
                    });
            });
        } else {
            form.submit();
        }
    });
});
