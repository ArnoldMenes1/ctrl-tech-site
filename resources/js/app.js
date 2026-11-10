import './bootstrap';
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-confirm]').forEach((element) => {
        element.addEventListener('click', (event) => {
            if (!window.confirm(element.dataset.confirm || 'Confirmer cette action ?')) event.preventDefault();
        });
    });
});