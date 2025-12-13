/*
========================================
PESTICIDES.JS - Krishi Sathi Application
Pesticides & Fertilizers Page Functionality
========================================
*/

let allPesticidesData = [];
let filteredData = [];
let currentLanguage = 'en';

// API endpoint
const API_BASE_URL = '/api';

// DOM elements
let pesticidesData;
let filterButtons;
let loadingSpinner;
let errorMessage;
let noDataMessage;

// Voice assistant integration
let voiceAssistantActive = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Pesticides page initialized');
    initializeElements();
    initializeEventListeners();
    loadPesticidesData();

    // Listen for language changes
    window.addEventListener('languageChanged', function(e) {
        currentLanguage = e.detail.language;
        console.log('Language changed to:', currentLanguage);
        renderPesticides();
        updateLanguageIndicator();
    });

    // Initialize voice assistant integration
    initializeVoiceIntegration();
});

/**
 * Initialize DOM elements
 */
function initializeElements() {
    pesticidesData = document.getElementById('pesticidesData');
    filterButtons = document.querySelectorAll('.tab-btn');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    noDataMessage = document.getElementById('noDataMessage');

    console.log('Elements initialized:', {
        pesticidesData: !!pesticidesData,
        filterButtons: filterButtons.length,
        loadingSpinner: !!loadingSpinner
    });
}

/**
 * Initialize voice integration
 */
function initializeVoiceIntegration() {
    // Listen for voice assistant language changes
    window.addEventListener('voiceLanguageChanged', function(e) {
        currentLanguage = e.detail.language;
        updateLanguageIndicator();
        renderPesticides();
    });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('onclick').match(/filterByType\('(\w+)'\)/)[1];
            filterByType(filterType);
        });
    });

    // Language selector
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            changeLanguage();
        });
    }
}

/**
 * Load pesticides data from API or JSON
 */
async function loadPesticidesData() {
    console.log('Loading pesticides data...');
    showLoading();
    hideError();
    hideNoData();
    
    // Try local JSON first
    try {
        console.log('Attempting to load from local JSON...');
        const response = await fetch('./data/pesticides_data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded from JSON:', data);

        if (Array.isArray(data)) {
            allPesticidesData = data;
            filteredData = [...allPesticidesData];
            console.log('Total pesticides loaded:', allPesticidesData.length);
            renderPesticides();
            hideLoading();
            return;
        } else if (data && data.pesticides_fertilizers) {
            allPesticidesData = data.pesticides_fertilizers;
            filteredData = [...allPesticidesData];
            console.log('Total pesticides loaded:', allPesticidesData.length);
            renderPesticides();
            hideLoading();
            return;
        } else {
            throw new Error('Invalid data format in JSON file');
        }
        
    } catch (jsonError) {
        console.error('Error loading from local JSON:', jsonError);
        
        // If local JSON fails, try API
        try {
            console.log('Attempting to load from API...');
            const apiResponse = await fetch(`${API_BASE_URL}/pesticides/${currentLanguage}`);
            
            if (!apiResponse.ok) {
                throw new Error(`API error! status: ${apiResponse.status}`);
            }
            
            const result = await apiResponse.json();
            console.log('Data loaded from API:', result);
            
            if (result.success && result.data) {
                allPesticidesData = result.data;
                filteredData = [...allPesticidesData];
                console.log('Total pesticides loaded from API:', allPesticidesData.length);
                renderPesticides();
            } else {
                throw new Error('Invalid API response format');
            }
            
        } catch (apiError) {
            console.error('Error loading from API:', apiError);
            
            // If both fail, use sample data
            console.warn('Using sample data as fallback');
            useSampleData();
        }
    } finally {
        hideLoading();
    }
}

/**
 * Use sample data as fallback
 */
function useSampleData() {
    allPesticidesData = [
        {
            id: 1,
            product_type: "fertilizer",
            composition: "NPK 19:19:19",
            usage_per_acre: "25-30 kg",
            price_range: "₹800-1200 per 50kg",
            organic: false,
            translations: {
                en: {
                    product_name: "NPK Complex Fertilizer",
                    description: "Balanced NPK fertilizer for overall plant growth and development. Suitable for all crops.",
                    usage_instructions: "Apply 25-30 kg per acre during soil preparation or as top dressing. Mix well with soil. Water immediately after application.",
                    precautions: "Wear gloves while handling. Store in cool, dry place. Keep away from children and animals. Wash hands thoroughly after use."
                },
                hi: {
                    product_name: "एनपीके कॉम्प्लेक्स उर्वरक",
                    description: "समग्र पौधे की वृद्धि और विकास के लिए संतुलित एनपीके उर्वरक। सभी फसलों के लिए उपयुक्त।",
                    usage_instructions: "मिट्टी की तैयारी के दौरान या टॉप ड्रेसिंग के रूप में प्रति एकड़ 25-30 किलोग्राम लगाएं। मिट्टी के साथ अच्छी तरह मिलाएं।",
                    precautions: "संभालते समय दस्ताने पहनें। ठंडी, सूखी जगह में स्टोर करें। बच्चों और जानवरों से दूर रखें।"
                }
            }
        },
        {
            id: 2,
            product_type: "insecticide",
            composition: "Chlorpyrifos 20% EC",
            usage_per_acre: "400-500 ml in 200L water",
            price_range: "₹350-500 per liter",
            organic: false,
            translations: {
                en: {
                    product_name: "Chlorpyrifos Insecticide",
                    description: "Broad-spectrum insecticide effective against termites, aphids, and other soil insects.",
                    usage_instructions: "Mix 400-500 ml in 200 liters of water and spray on affected crops. Best applied in early morning or evening.",
                    precautions: "HIGHLY TOXIC. Wear protective clothing and mask. Do not eat, drink or smoke during application. Wash hands thoroughly after use."
                },
                hi: {
                    product_name: "क्लोरपाइरीफॉस कीटनाशक",
                    description: "दीमक, एफिड्स और अन्य मृदा कीड़ों के खिलाफ प्रभावी व्यापक-स्पेक्ट्रम कीटनाशक।",
                    usage_instructions: "200 लीटर पानी में 400-500 मिली मिलाएं और प्रभावित फसलों पर स्प्रे करें।",
                    precautions: "अत्यधिक विषैला। सुरक्षात्मक कपड़े और मास्क पहनें। उपयोग के बाद हाथ अच्छी तरह धोएं।"
                }
            }
        }
    ];
    
    filteredData = [...allPesticidesData];
    console.log('Sample data loaded:', allPesticidesData.length, 'items');
    renderPesticides();
}

/**
 * Render pesticides list
 */
function renderPesticides() {
    if (!pesticidesData) {
        console.error('Pesticides data element not found!');
        return;
    }

    pesticidesData.innerHTML = '';
    
    if (filteredData.length === 0) {
        showNoData();
        return;
    }
    
    hideNoData();
    
    console.log('Rendering', filteredData.length, 'pesticides');
    
    filteredData.forEach((pesticide, index) => {
        const card = createPesticideCard(pesticide, index);
        pesticidesData.appendChild(card);
    });
}

/**
 * Create pesticide card element
 */
function createPesticideCard(pesticide, index) {
    const card = document.createElement('div');
    card.className = 'data-card pesticide-card';
    card.setAttribute('data-index', index);
    
    const productName = getTranslatedField(pesticide, 'product_name');
    const description = getTranslatedField(pesticide, 'description');
    const usageInstructions = getTranslatedField(pesticide, 'usage_instructions');
    const precautions = getTranslatedField(pesticide, 'precautions');
    
    const typeColors = {
        'fertilizer': '#4a7c2c',
        'pesticide': '#c7511f',
        'insecticide': '#d84315',
        'fungicide': '#7b1fa2',
        'herbicide': '#689f38'
    };
    const typeColor = typeColors[pesticide.product_type] || '#666';
    
    card.innerHTML = `
        ${pesticide.organic ? '<div class="card-ribbon organic">🌿 Organic</div>' : ''}
        
        <div class="card-header">
            <h3>${productName}</h3>
            <span class="product-type" style="background-color: ${typeColor};">
                ${formatProductType(pesticide.product_type)}
            </span>
        </div>
        
        <div class="card-body">
            <p class="description">${description}</p>
            
            <div class="product-info">
                <div class="info-row">
                    <span class="label">📦 ${getLabel('composition')}:</span>
                    <span class="value">${pesticide.composition}</span>
                </div>
                <div class="info-row">
                    <span class="label">📏 ${getLabel('usage_per_acre')}:</span>
                    <span class="value">${pesticide.usage_per_acre}</span>
                </div>
                <div class="info-row">
                    <span class="label">💰 ${getLabel('price_range')}:</span>
                    <span class="value">${pesticide.price_range}</span>
                </div>
                <div class="info-row">
                    <span class="label">🌿 ${getLabel('organic')}:</span>
                    <span class="value">${pesticide.organic ? getLabel('yes') : getLabel('no')}</span>
                </div>
            </div>
            
            <details class="more-info">
                <summary>${getLabel('view_details')}</summary>
                
                <div class="usage-section">
                    <h4>📋 ${getLabel('usage_instructions_title')}</h4>
                    <p>${usageInstructions}</p>
                </div>
                
                <div class="precautions-section">
                    <h4>⚠️ ${getLabel('precautions_title')}</h4>
                    <p>${precautions}</p>
                </div>
            </details>
            
            <div class="emergency-contact">
                <h3>🚨 ${getLabel('emergency_contact')}</h3>
                <p>${getLabel('poison_control')}: <strong>1800-180-1551</strong></p>
                <p>${getLabel('emergency_helpline')}: <strong>108</strong></p>
            </div>
        </div>
        
        <div class="card-footer">
            <button class="btn btn-primary" onclick="viewProductDetails(${index})">
                ${getLabel('view_full_details')}
            </button>
            <button class="btn btn-secondary" onclick="shareProduct(${index})">
                ${getLabel('share')} 📤
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Format product type for display
 */
function formatProductType(type) {
    const typeLabels = {
        'en': {
            'fertilizer': 'Fertilizer',
            'pesticide': 'Pesticide',
            'insecticide': 'Insecticide',
            'fungicide': 'Fungicide',
            'herbicide': 'Herbicide'
        },
        'hi': {
            'fertilizer': 'उर्वरक',
            'pesticide': 'कीटनाशक',
            'insecticide': 'कीटनाशक',
            'fungicide': 'फफूंदनाशक',
            'herbicide': 'खरपतवारनाशी'
        }
    };
    
    return typeLabels[currentLanguage]?.[type] || type;
}

/**
 * Apply filters
 */
function applyFilters() {
    let filtered = [...allPesticidesData];
    
    // Filter by type
    const selectedType = filterType?.value;
    if (selectedType && selectedType !== 'all') {
        filtered = filtered.filter(item => item.product_type === selectedType);
    }
    
    // Filter by organic
    const selectedOrganic = filterOrganic?.value;
    if (selectedOrganic && selectedOrganic !== 'all') {
        const isOrganic = selectedOrganic === 'true';
        filtered = filtered.filter(item => item.organic === isOrganic);
    }
    
    // Apply search filter
    const searchTerm = searchInput?.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(item => {
            const productName = getTranslatedField(item, 'product_name').toLowerCase();
            const description = getTranslatedField(item, 'description').toLowerCase();
            const composition = (item.composition || '').toLowerCase();
            
            return productName.includes(searchTerm) || 
                   description.includes(searchTerm) ||
                   composition.includes(searchTerm);
        });
    }
    
    filteredData = filtered;
    console.log('Filtered results:', filteredData.length);
    renderPesticides();
}

/**
 * Handle search input
 */
function handleSearch() {
    applyFilters();
}

/**
 * Reset all filters
 */
function resetFilters() {
    if (filterType) filterType.value = 'all';
    if (filterOrganic) filterOrganic.value = 'all';
    if (searchInput) searchInput.value = '';
    
    filteredData = [...allPesticidesData];
    renderPesticides();
}

/**
 * View product details
 */
function viewProductDetails(index) {
    const product = filteredData[index];
    if (!product) return;
    
    const productName = getTranslatedField(product, 'product_name');
    const description = getTranslatedField(product, 'description');
    
    alert(`${productName}\n\n${description}\n\nComposition: ${product.composition}\nUsage: ${product.usage_per_acre}\nPrice: ${product.price_range}`);
}

/**
 * Share product
 */
function shareProduct(index) {
    const product = filteredData[index];
    if (!product) return;
    
    const productName = getTranslatedField(product, 'product_name');
    const shareText = `${productName}\nComposition: ${product.composition}\nPrice: ${product.price_range}`;
    
    if (navigator.share) {
        navigator.share({
            title: productName,
            text: shareText
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Product info copied to clipboard!');
        });
    }
}

/**
 * Get translated field from data
 */
function getTranslatedField(item, fieldName) {
    if (item.translations && item.translations[currentLanguage]) {
        return item.translations[currentLanguage][fieldName] || '';
    }
    return item[fieldName] || '';
}

/**
 * Get label in current language
 */
function getLabel(key) {
    const labels = {
        'en': {
            'composition': 'Composition',
            'usage_per_acre': 'Usage per Acre',
            'price_range': 'Price Range',
            'organic': 'Organic',
            'yes': 'Yes',
            'no': 'No',
            'view_details': 'View Details',
            'usage_instructions_title': 'Usage Instructions',
            'precautions_title': 'Safety Precautions',
            'emergency_contact': 'Emergency Contact',
            'poison_control': 'Poison Control',
            'emergency_helpline': 'Emergency Helpline',
            'view_full_details': 'View Full Details',
            'share': 'Share'
        },
        'hi': {
            'composition': 'संरचना',
            'usage_per_acre': 'प्रति एकड़ उपयोग',
            'price_range': 'मूल्य सीमा',
            'organic': 'जैविक',
            'yes': 'हाँ',
            'no': 'नहीं',
            'view_details': 'विवरण देखें',
            'usage_instructions_title': 'उपयोग निर्देश',
            'precautions_title': 'सुरक्षा सावधानियां',
            'emergency_contact': 'आपातकालीन संपर्क',
            'poison_control': 'विष नियंत्रण',
            'emergency_helpline': 'आपातकालीन हेल्पलाइन',
            'view_full_details': 'पूर्ण विवरण देखें',
            'share': 'साझा करें'
        }
    };
    
    return labels[currentLanguage]?.[key] || labels['en'][key] || key;
}

/**
 * Show/Hide elements
 */
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (pesticidesData) pesticidesData.style.display = 'none';
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (pesticidesData) pesticidesData.style.display = 'grid';
}

function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideError() {
    if (errorMessage) errorMessage.style.display = 'none';
}

function showNoData() {
    if (noDataMessage) noDataMessage.style.display = 'block';
}

function hideNoData() {
    if (noDataMessage) noDataMessage.style.display = 'none';
}

/**
 * Filter products by type
 */
function filterByType(type) {
    // Update active button
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(filterButtons).find(btn =>
        btn.getAttribute('onclick')?.includes(`'${type}'`)
    );
    if (activeBtn) activeBtn.classList.add('active');

    // Filter data
    if (type === 'all') {
        filteredData = [...allPesticidesData];
    } else {
        filteredData = allPesticidesData.filter(item => {
            if (type === 'pesticide') {
                return ['pesticide', 'insecticide', 'fungicide', 'herbicide'].includes(item.product_type);
            } else if (type === 'fertilizer') {
                return item.product_type === 'fertilizer';
            } else if (type === 'organic') {
                return item.organic === true;
            }
            return item.product_type === type;
        });
    }

    console.log(`Filtered by ${type}:`, filteredData.length, 'items');
    renderPesticides();
}

/**
 * Change language
 */
function changeLanguage() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        currentLanguage = languageSelect.value;
        console.log('Language changed to:', currentLanguage);

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: currentLanguage }
        }));

        // Update language indicator
        updateLanguageIndicator();

        // Re-render content
        renderPesticides();
    }
}

/**
 * Update language indicator
 */
function updateLanguageIndicator() {
    const indicator = document.getElementById('languageIndicator');
    if (indicator) {
        const languageNames = {
            'en': 'English',
            'hi': 'हिन्दी',
            'mr': 'मराठी',
            'kn': 'ಕನ್ನಡ'
        };
        indicator.textContent = `Language: ${languageNames[currentLanguage] || 'English'}`;
    }
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for global access
window.viewProductDetails = viewProductDetails;
window.shareProduct = shareProduct;
window.filterByType = filterByType;
window.changeLanguage = changeLanguage;

console.log('Pesticides.js loaded successfully');
