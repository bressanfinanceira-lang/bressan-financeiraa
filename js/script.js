console.log('script.js carregado');
const header = document.getElementById('site-header');
const revealElements = document.querySelectorAll('.section, .premium-card, .testimonial-box, .brand-box');

window.addEventListener('scroll', () => {
    if (window.scrollY > 24) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.18 });

revealElements.forEach((element) => observer.observe(element));

function initSmoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        if (link.classList.contains('open-simulation-modal')) return;

        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (href === '#') {
                event.preventDefault();
                return;
            }

            const targetId = href.slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function getSavedSimulationData() {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return {
        fullName: localStorage.getItem('sim_fullName') || '',
        phone: localStorage.getItem('sim_phone') || '',
        email: localStorage.getItem('sim_email') || '',
    };
}

function applySavedSimulationData(form) {
    const saved = getSavedSimulationData();
    if (!saved) return;
    form.querySelector('[name="fullName"]').value = saved.fullName;
    form.querySelector('[name="phone"]').value = saved.phone;
    form.querySelector('[name="email"]').value = saved.email;
}

function saveSimulationData(form) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem('sim_fullName', form.querySelector('[name="fullName"]').value.trim());
    localStorage.setItem('sim_phone', form.querySelector('[name="phone"]').value.trim());
    localStorage.setItem('sim_email', form.querySelector('[name="email"]').value.trim());
}

function initModal() {
    const modal = document.querySelector('.simulation-modal');
    const overlay = document.querySelector('.modal-overlay');
    const openButtons = document.querySelectorAll('.open-simulation-modal');
    const closeButtons = document.querySelectorAll('.close-simulation-modal');
    const form = document.getElementById('simulation-form');
    const successMessage = form.querySelector('.submission-success');

    console.log('initModal setup', {
        modal: !!modal,
        overlay: !!overlay,
        form: !!form,
        openButtons: openButtons.length,
        closeButtons: closeButtons.length,
    });

    const toggleModal = (isOpen) => {
        modal.classList.toggle('active', isOpen);
        overlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
        if (isOpen) {
            applySavedSimulationData(form);
            const firstField = form.querySelector('input, select, textarea');
            firstField?.focus();
        }
    };

    function openSimulationModal(asset = '') {
        const selectField = form.querySelector('[name="desiredAsset"]');
        if (asset && selectField) {
            selectField.value = asset;
        }
        toggleModal(true);
    }

    document.addEventListener('click', (event) => {
        const button = event.target.closest('.open-simulation-modal');
        if (!button) return;
        console.log('open-simulation-modal clicado', button.dataset.asset);
        event.preventDefault();
        const asset = button.dataset.asset || '';
        openSimulationModal(asset);
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', () => toggleModal(false));
    });

    overlay.addEventListener('click', () => toggleModal(false));
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            toggleModal(false);
        }
    });

    const validateField = (field) => {
        const errorElement = field.closest('.form-group').querySelector('.field-error');
        let error = '';

        if (field.required && !field.value.trim()) {
            error = 'Este campo é obrigatório.';
        } else if (field.type === 'email' && field.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value.trim())) {
                error = 'Informe um e-mail válido.';
            }
        }

        errorElement.textContent = error;
        return !error;
    };

    form.querySelectorAll('input, select, textarea').forEach((field) => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            if (field.closest('.form-group').querySelector('.field-error').textContent) {
                validateField(field);
            }
        });
    });

    const errorMessage = form.querySelector('.submission-error');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fields = Array.from(form.querySelectorAll('input, select')).filter((input) => input.required);
        const valid = fields.every((field) => validateField(field));

        if (!valid) {
            return;
        }

        const formData = new FormData(form);
        const body = new URLSearchParams(formData);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'Accept': 'application/json',
                },
                body,
            });

            if (!response.ok) {
                throw new Error('Erro na solicitação');
            }

            const result = await response.json().catch(() => ({ success: true }));
            if (!result.success) {
                throw new Error(result.message || 'Erro ao salvar simulação.');
            }

            successMessage.hidden = false;
            errorMessage.hidden = true;
            saveSimulationData(form);
            form.reset();
            setTimeout(() => {
                successMessage.hidden = true;
                toggleModal(false);
            }, 2800);
        } catch (error) {
            console.error('Simulação falhou:', error);
            errorMessage.hidden = false;
            successMessage.hidden = true;
        }
    });
}

lucide.createIcons();
initSmoothLinks();
initModal();
