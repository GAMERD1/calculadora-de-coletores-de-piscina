const brands = {
    tsSolar: {
        name: 'TS-SOLAR',
        models: {
            '2M X 0,30M': 0.60,
            '3M X 0,30M': 0.90,
            '3,70M X 0,30M': 1.11,
            '4M X 0,30M': 1.20,
            '5M X 0,30M': 1.50
        }
    },
    komeco: {
        name: 'KOMECO',
        models: {
            'KOCS PS 2.0': 2.4,
            'KOCS PS 3.0': 3.6,
            'KOCS PS 4.0': 4.8
        }
    },
    solis: {
        name: 'SOLIS',
        litersPerCollector: 4000
    },
    mastersol: {
        name: 'MASTERSOL',
        models: {
            'MASTERSOL 2000': 1.2,
            'MASTERSOL 3000': 1.5,
            'MASTERSOL 3700': 1.8,
            'MASTERSOL 4500': 2.0,
            'MASTERSOL 5000': 2.5
        }
    },
    girassol: {
        name: 'GIRASSOL',
        litersPerCollector: 4000
    },
    soria: {
        name: 'SORIA',
        models: {
            'URJA 200': 0.64,
            'URJA 300': 0.96,
            'URJA 400': 1.18,
            'URJA 500': 1.44,
            'URJA 5000': 6.0
        }
    },
    tempersol: {
        name: 'TEMPERSOL',
        models: {
            'POOL 200': 1.0,
            'POOL 300': 1.5,
            'POOL 400': 2.0
        }
    }
};

function calculateCollectors() {
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const selectedBrand = document.getElementById('brand').value;
    const additionalHeating = document.getElementById('additionalHeating').checked;

    if (!length || !width || length <= 0 || width <= 0) {
        alert('POR FAVOR, INSIRA DIMENSÕES VÁLIDAS.');
        return;
    }

    let area = length * width;
    const volumeInLiters = area * 1000; // Considerando profundidade média de 1m

    // Aplica 30% de aquecimento adicional se marcado
    if (additionalHeating) {
        area = area * 1.3;
    }

    document.getElementById('areaResult').textContent = `ÁREA DA PISCINA: ${length}M X ${width}M = ${area.toFixed(2)}M²`;
    document.getElementById('brandResults').classList.add('visible');
    
    const brand = brands[selectedBrand];
    document.getElementById('selectedBrandTitle').textContent = brand.name;

    let results = '';
    if (brand.models) {
        for (const [model, collectorArea] of Object.entries(brand.models)) {
            const collectors = Math.ceil(area / collectorArea);
            results += `<p class="result-item">${model}: ${collectors} COLETORES</p>`;
        }
    } else if (brand.litersPerCollector) {
        const collectors = Math.ceil(volumeInLiters / brand.litersPerCollector);
        results = `<p class="result-item">${collectors} COLETORES</p>`;
    }

    document.getElementById('calculationResults').innerHTML = results;
}