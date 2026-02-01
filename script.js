document.addEventListener('DOMContentLoaded', () => {
    const openModalButtons = document.querySelectorAll('[data-modal-target]');

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            openModal(modal);
        });
    });


    // Also close modal if user clicks outside the content area
    window.addEventListener('click', event => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
    }
});
