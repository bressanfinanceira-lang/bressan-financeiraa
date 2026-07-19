const openModalButtons = document.querySelectorAll('.open-simulation-modal');
const closeModalButtons = document.querySelectorAll('.close-simulation-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const simulationModal = document.querySelector('.simulation-modal');
const simulationContent = document.querySelector('.simulation-content');
const quoteContent = document.querySelector('.quote-content');
const simulationForm = document.getElementById('simulation-form');
const quoteForm = document.getElementById('quote-form');
const rapidQuoteForm = document.getElementById('rapid-quote-form');
const successFeedback = document.querySelector('.form-feedback--success');
const errorFeedback = document.querySelector('.form-feedback--error');
const submitButton = simulationForm?.querySelector('.btn-submit');
const desiredAssetSelect = simulationForm?.querySelector('select[name="desiredAsset"]');
const requestTypeInput = simulationForm?.querySelector('input[name="requestType"]');
const modalTitle = document.getElementById('simulation-modal-title');
const modalDescription = document.querySelector('.modal-header p');
const form = simulationForm;

const COMPANY_WHATSAPP = '5564996024548';

const ASSET_LABELS = {
    'Casa': 'Casa',
    'Imóvel': 'Imóvel',
    'Carro': 'Carro',
    'Moto': 'Moto',
    'Caminhão': 'Caminhão',
    'Truck': 'Truck',
    'Máquinas': 'Máquinas',
    'Seguro APVS Truck': 'Seguro APVS Truck',
    'Outros': 'Outros',
};

function toggleModal(visible) {
    if (!simulationModal || !modalOverlay) return;
    simulationModal.classList.toggle('active', visible);
    modalOverlay.classList.toggle('active', visible);
    document.body.style.overflow = visible ? 'hidden' : '';
    if (visible) {
        const firstField = simulationModal.querySelector('input, select, textarea');
        firstField?.focus();
    }
}

function openSimulationModal(event) {
    const button = event.currentTarget;
    const selectedAsset = button.dataset.asset || '';
    const modalType = button.dataset.modalType || 'simulacao';

    if (modalType === 'simulacao') {
        if (selectedAsset && ASSET_LABELS[selectedAsset]) {
            desiredAssetSelect.value = selectedAsset;
        } else {
            desiredAssetSelect.value = '';
        }

        if (requestTypeInput) {
            requestTypeInput.value = modalType;
        }
    }

    updateModalView(modalType);
    setModalContext(modalType);
    clearValidation();
    hideFeedback();
    toggleModal(true);
}

function updateModalView(type) {
    if (!simulationContent || !quoteContent) return;

    simulationContent.classList.toggle('hidden', type === 'cotacao');
    quoteContent.classList.toggle('hidden', type !== 'cotacao');
}

function setModalContext(type) {
    if (!modalTitle || !modalDescription) return;

    if (type === 'cotacao') {
        modalTitle.textContent = 'Pedir cotação de seguro';
        modalDescription.textContent = 'Envie seus dados para receber uma cotação especializada em seguro APVS Truck.';
    } else {
        modalTitle.textContent = 'Solicite sua simulação';
        modalDescription.textContent = 'Envie seus dados e receba uma proposta rápida da equipe Bressan.';
    }
}

function closeSimulationModal() {
    toggleModal(false);
}

function clearValidation() {
    const fields = simulationModal.querySelectorAll('input, select, textarea');
    fields.forEach((field) => {
        const error = field.closest('.form-group')?.querySelector('.field-error');
        if (error) {
            error.textContent = '';
        }
        field.classList.remove('invalid');
    });
}

function hideFeedback() {
    successFeedback?.setAttribute('hidden', '');
    errorFeedback?.setAttribute('hidden', '');
}

function validateField(field) {
    const error = field.closest('.form-group')?.querySelector('.field-error');
    let message = '';

    if (field.hasAttribute('required') && !field.value.trim()) {
        message = 'Campo obrigatório.';
    } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        message = 'Informe um e-mail válido.';
    }

    if (error) {
        error.textContent = message;
    }

    field.classList.toggle('invalid', !!message);
    return !message;
}

function validateForm() {
    const fields = simulationForm.querySelectorAll('input[required], select[required], textarea[required]');
    const isValid = Array.from(fields).every(validateField);
    return isValid;
}

async function submitForm(event) {
    event.preventDefault();
    hideFeedback();

    if (!validateForm()) {
        return;
    }

    submitButton.classList.add('loading');
    submitButton.disabled = true;

    const formData = new FormData(simulationForm);
    const payload = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(form.action, {
            method: form.method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            successFeedback?.removeAttribute('hidden');
            form.reset();
            desiredAssetSelect.value = '';
            if (requestTypeInput) {
                requestTypeInput.value = 'simulacao';
            }
            setModalContext('simulacao');
        } else {
            errorFeedback?.removeAttribute('hidden');
        }
    } catch (error) {
        errorFeedback?.removeAttribute('hidden');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

function handleRapidQuoteSubmit(event) {
    event.preventDefault();

    if (!rapidQuoteForm) return;

    const nameField = rapidQuoteForm.querySelector('input[name="name"]');
    const whatsappField = rapidQuoteForm.querySelector('input[name="whatsapp"]');
    const vehicleTypeField = rapidQuoteForm.querySelector('select[name="vehicleType"]');
    const brandField = rapidQuoteForm.querySelector('input[name="brand"]');
    const modelField = rapidQuoteForm.querySelector('input[name="model"]');
    const yearField = rapidQuoteForm.querySelector('input[name="year"]');
    const notesField = rapidQuoteForm.querySelector('textarea[name="notes"]');
    const coverageFields = rapidQuoteForm.querySelectorAll('input[name="coverage"]:checked');

    const requiredFields = [nameField, whatsappField, vehicleTypeField, brandField, modelField, yearField];
    const valid = requiredFields.every((field) => validateRapidField(field));
    if (!valid) return;

    const coverages = Array.from(coverageFields).map((field) => field.value);
    const coveragesText = coverages.length ? coverages.map((item) => `✅ ${item}`).join('\n') : 'Nenhuma cobertura selecionada.';
    const notes = notesField?.value.trim() || 'Sem observações adicionais.';

    const message = `📋 *NOVA SOLICITAÇÃO DE COTAÇÃO*\n\n👤 *Cliente*\nNome: ${nameField.value.trim()}\nWhatsApp: ${whatsappField.value.trim()}\n\n🚗 *Veículo*\nTipo: ${vehicleTypeField.value}\nMarca: ${brandField.value.trim()}\nModelo: ${modelField.value.trim()}\nAno: ${yearField.value.trim()}\n\n🛡️ *Coberturas de Interesse*\n${coveragesText}\n\n📝 *Observações*\n${notes}\n\nObrigado! Aguardo o contato para receber minha cotação.`;

    const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    rapidQuoteForm.reset();
}

function validateRapidField(field) {
    const error = field.closest('.form-group')?.querySelector('.field-error');
    let message = '';

    if (field.hasAttribute('required') && !field.value.trim()) {
        message = 'Campo obrigatório.';
    }

    if (error) {
        error.textContent = message;
    }
    field.classList.toggle('invalid', !!message);
    return !message;
}

openModalButtons.forEach((button) => {
    button.addEventListener('click', openSimulationModal);
});

closeModalButtons.forEach((button) => {
    button.addEventListener('click', closeSimulationModal);
});

modalOverlay?.addEventListener('click', closeSimulationModal);
simulationForm?.addEventListener('submit', submitForm);
rapidQuoteForm?.addEventListener('submit', handleRapidQuoteSubmit);

simulationForm?.querySelectorAll('input[required], select[required], textarea[required]').forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
});
rapidQuoteForm?.querySelectorAll('input[required], select[required]').forEach((field) => {
    field.addEventListener('blur', () => validateRapidField(field));
});
