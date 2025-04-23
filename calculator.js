// Brand data
const brands = {
    tsSolar: {
        name: 'TS-SOLAR',
        models: {
            '2M X 0,30M': { area: 0.60, length: 2.0, width: 0.30 },
            '3M X 0,30M': { area: 0.90, length: 3.0, width: 0.30 },
            '3,70M X 0,30M': { area: 1.11, length: 3.7, width: 0.30 },
            '4M X 0,30M': { area: 1.20, length: 4.0, width: 0.30 },
            '5M X 0,30M': { area: 1.50, length: 5.0, width: 0.30 }
        }
    },
    komeco: {
        name: 'KOMECO',
        models: {
            'KOCS PS 2.0': { area: 2.4, length: 2.0, width: 1.2 },
            'KOCS PS 3.0': { area: 3.6, length: 3.0, width: 1.2 },
            'KOCS PS 4.0': { area: 4.8, length: 4.0, width: 1.2 }
        }
    },
    solis: {
        name: 'SOLIS',
        litersPerCollector: 4000
    },
    mastersol: {
        name: 'MASTERSOL',
        models: {
            'MASTERSOL 2000': { area: 1.2, length: 2.0, width: 0.6 },
            'MASTERSOL 3000': { area: 1.5, length: 3.0, width: 0.5 },
            'MASTERSOL 3700': { area: 1.8, length: 3.7, width: 0.5 },
            'MASTERSOL 4500': { area: 2.0, length: 4.5, width: 0.45 },
            'MASTERSOL 5000': { area: 2.5, length: 5.0, width: 0.5 }
        }
    },
    girassol: {
        name: 'GIRASSOL',
        litersPerCollector: 4000
    },
    soria: {
        name: 'SORIA',
        models: {
            'URJA 200': { area: 0.64, length: 2.0, width: 0.32 },
            'URJA 300': { area: 0.96, length: 3.0, width: 0.32 },
            'URJA 400': { area: 1.18, length: 4.0, width: 0.3 },
            'URJA 500': { area: 1.44, length: 5.0, width: 0.3 },
            'URJA 5000': { area: 6.0, length: 5.0, width: 1.2 }
        }
    },
    tempersol: {
        name: 'TEMPERSOL',
        models: {
            'POOL 200': { area: 1.0, length: 2.0, width: 0.5 },
            'POOL 300': { area: 1.5, length: 3.0, width: 0.5 },
            'POOL 400': { area: 2.0, length: 4.0, width: 0.5 }
        }
    }
};

// Form steps management
let currentStep = 1;
const formSteps = document.querySelectorAll('.form-step');

function updateFormSteps() {
    formSteps.forEach(step => {
        const stepNumber = parseInt(step.dataset.step);
        if (stepNumber <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Initialize form steps
updateFormSteps();

// Handle brand selection
document.getElementById('brand').addEventListener('change', function() {
    if (this.value) {
        currentStep = Math.max(currentStep, 2);
        updateFormSteps();
    }
});

// Handle dimension inputs
['length', 'width'].forEach(id => {
    document.getElementById(id).addEventListener('input', function() {
        if (document.getElementById('length').value && document.getElementById('width').value) {
            currentStep = Math.max(currentStep, 3);
            updateFormSteps();
        }
    });
});

// Handle regional factors
['climate', 'temperature', 'roofOrientation'].forEach(id => {
    document.getElementById(id).addEventListener('change', function() {
        const climate = document.getElementById('climate').value;
        const temperature = document.getElementById('temperature').value;
        const orientation = document.getElementById('roofOrientation').value;
        
        if (climate && temperature && orientation) {
            currentStep = Math.max(currentStep, 4);
            updateFormSteps();
        }
    });
});

// Handle roof size checkbox
document.getElementById('checkRoofSize').addEventListener('change', function() {
    const roofDimensions = document.getElementById('roofDimensions');
    roofDimensions.style.display = this.checked ? 'block' : 'none';
    
    if (this.checked) {
        currentStep = Math.max(currentStep, 5);
        updateFormSteps();
    }
});

// Show alert message
function showAlert(message, type = 'error') {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

// Calculate collectors
function calculateCollectors(formData) {
    const {
        brand: selectedBrand,
        length,
        width,
        temperature,
        climate,
        roofOrientation,
        additionalHeating,
        checkRoofSize,
        roofWidth,
        roofLength
    } = formData;

    // Calculate base and corrected area
    let baseArea = length * width;
    const volumeInLiters = baseArea * 1000;

    // Apply additional heating if selected
    let correctedArea = additionalHeating ? baseArea * 1.3 : baseArea;

    // Apply correction factors
    correctedArea = correctedArea * temperature * climate * roofOrientation;

    const brand = brands[selectedBrand];
    const result = {
        baseArea,
        correctedArea,
        modelResults: [],
        volumeInLiters
    };

    if (brand.models) {
        // For brands with multiple models
        for (const [model, specs] of Object.entries(brand.models)) {
            const collectors = Math.ceil(correctedArea / specs.area);
            const batteries = Math.ceil(collectors / 20);
            
            const modelResult = {
                model,
                collectors,
                area: specs.area,
                batteries
            };

            // Roof size check
            if (checkRoofSize && roofWidth && roofLength) {
                const usableWidth = roofWidth - 1;
                const usableLength = roofLength - 1;
                
                const maxPerRow = Math.floor(usableLength / specs.length);
                const maxRows = Math.floor(usableWidth / specs.width);
                const maxPossible = maxPerRow * maxRows;
                
                modelResult.roofCheck = {
                    maxPerRow,
                    maxRows,
                    maxPossible,
                    fits: maxPossible >= collectors
                };
            }

            result.modelResults.push(modelResult);
        }
    } else if (brand.litersPerCollector) {
        // For brands based on liters per collector
        const collectors = Math.ceil(volumeInLiters / brand.litersPerCollector);
        const batteries = Math.ceil(collectors / 20);
        
        result.collectors = collectors;
        result.batteries = batteries;
        result.litersPerCollector = brand.litersPerCollector;
    }

    return result;
}

// Display results
function displayResults(result, selectedBrand) {
    const resultsDiv = document.getElementById('results');
    const brand = brands[selectedBrand];
    
    let html = `
        <h3 class="result-title">${brand.name}</h3>
        <div class="results-grid">
            <div class="result-card">
                <div class="result-title">Área Calculada</div>
                <p>Área base: ${result.baseArea.toFixed(2)}m²</p>
                <p>Área corrigida: ${result.correctedArea.toFixed(2)}m²</p>
                <p>Volume estimado: ${result.volumeInLiters.toFixed(0)} litros</p>
            </div>
    `;

    if (brand.models) {
        html += '<div class="result-card"><div class="result-title">Coletores por Modelo</div>';
        result.modelResults.forEach(modelResult => {
            html += `
                <div class="model-result">
                    <h4>${modelResult.model}</h4>
                    <p>Coletores necessários: ${modelResult.collectors}</p>
                    <p>Baterias necessárias: ${modelResult.batteries}</p>
                    ${modelResult.roofCheck ? `
                        <div class="roof-check ${modelResult.roofCheck.fits ? 'success' : 'error'}">
                            <p>Disposição: ${modelResult.roofCheck.maxPerRow} por linha (${modelResult.roofCheck.maxRows} linhas)</p>
                            <p>Total possível: ${modelResult.roofCheck.maxPossible}</p>
                            <p>${modelResult.roofCheck.fits ? '✅ Cabe no telhado' : '❌ Espaço insuficiente'}</p>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        html += '</div>';
    } else {
        html += `
            <div class="result-card">
                <div class="result-title">Resultado ${brand.name}</div>
                <p>Coletores necessários: ${result.collectors}</p>
                <p>Baterias necessárias: ${result.batteries}</p>
                <p class="note">Baseado em volume de água (${result.volumeInLiters.toFixed(0)} litros)</p>
            </div>
        `;
    }

    html += `
        </div>
        <div class="disclaimer">
            <p>Nota: Todos os cálculos são estimados. Recomendamos sempre consultar o manual da empresa fabricante.</p>
        </div>
    `;

    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    document.getElementById('resetButton').style.display = 'block';
}

// Handle form submission
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
        brand: document.getElementById('brand').value,
        length: parseFloat(document.getElementById('length').value),
        width: parseFloat(document.getElementById('width').value),
        temperature: parseFloat(document.getElementById('temperature').value),
        climate: parseFloat(document.getElementById('climate').value),
        roofOrientation: parseFloat(document.getElementById('roofOrientation').value),
        additionalHeating: document.getElementById('additionalHeating').checked,
        checkRoofSize: document.getElementById('checkRoofSize').checked,
        roofWidth: parseFloat(document.getElementById('roofWidth').value),
        roofLength: parseFloat(document.getElementById('roofLength').value)
    };

    // Validation
    if (!formData.brand || !formData.length || !formData.width) {
        showAlert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    if (formData.checkRoofSize && (!formData.roofWidth || !formData.roofLength)) {
        showAlert('Por favor, preencha as dimensões do telhado.');
        return;
    }

    const result = calculateCollectors(formData);
    displayResults(result, formData.brand);
});

// Handle reset button
document.getElementById('resetButton').addEventListener('click', function() {
    document.getElementById('calculatorForm').reset();
    document.getElementById('results').style.display = 'none';
    this.style.display = 'none';
    currentStep = 1;
    updateFormSteps();
    document.getElementById('roofDimensions').style.display = 'none';
});

// Contact modal functionality
const modal = document.getElementById('contactModal');
const contactButton = document.getElementById('contactButton');
const closeModal = document.getElementById('closeModal');

contactButton.addEventListener('click', () => {
    modal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle contact form submission
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    
    if (!name || !phone) {
        showAlert('Por favor, preencha todos os campos.');
        return;
    }
    
    try {
        // Prepare WhatsApp message
        const message = `Olá, meu nome é ${name} e quero falar sobre o sistema que calcula placas pra piscina.`;
        const whatsappUrl = `https://wa.me/5543996349824?text=${encodeURIComponent(message)}`;
        
        // Send to Telegram (simulated)
        console.log('Sending to Telegram:', { name, phone });
        
        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Close modal
        modal.style.display = 'none';
        
        // Reset form
        this.reset();
        
        showAlert('Mensagem enviada com sucesso!', 'success');
    } catch (error) {
        showAlert('Erro ao enviar mensagem. Tente novamente.');
    }
});