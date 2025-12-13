// Seeds & Crops JavaScript
const API_BASE_URL = window.location.origin;
let currentLanguage = 'en';
let allCropsData = [];
let filteredCropsData = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadCropsData();
    setupLanguageSwitcher();
});

// Setup language switcher
function setupLanguageSwitcher() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', function() {
            currentLanguage = this.value;
            updateLanguageIndicator();
            loadCropsData();
        });
    }
}

// Update language indicator
function updateLanguageIndicator() {
    const indicator = document.getElementById('languageIndicator');
    const languages = {
        'en': 'English',
        'hi': 'हिन्दी',
        'mr': 'मराठी',
        'kn': 'ಕನ್ನಡ'
    };
    if (indicator) {
        indicator.textContent = `Language: ${languages[currentLanguage] || 'English'}`;
    }
}

// Load crops data from API
async function loadCropsData() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const errorMessage = document.getElementById('errorMessage');
    const seedsCropsData = document.getElementById('seedsCropsData');

    // Show loading spinner
    if (loadingSpinner) loadingSpinner.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
    if (seedsCropsData) seedsCropsData.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/seeds-crops/${currentLanguage}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        allCropsData = Array.isArray(data) ? data : [];
        filteredCropsData = [...allCropsData];

        displayCropsData();
        updateStats();

    } catch (error) {
        console.error('Error loading crops data:', error);
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'block';
    }
}

// Display crops data in cards
function displayCropsData() {
    const seedsCropsData = document.getElementById('seedsCropsData');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const noDataMessage = document.getElementById('noDataMessage');

    if (loadingSpinner) loadingSpinner.style.display = 'none';

    if (!seedsCropsData) return;

    if (filteredCropsData.length === 0) {
        if (noDataMessage) noDataMessage.style.display = 'block';
        seedsCropsData.innerHTML = '';
        return;
    }

    if (noDataMessage) noDataMessage.style.display = 'none';

    seedsCropsData.innerHTML = filteredCropsData.map(crop => createCropCard(crop)).join('');
}

// Create crop card HTML
function createCropCard(crop) {
    const cropIcon = getCropIcon(crop.crop_type);
    const seasonClass = `season-${crop.season}`;

    return `
        <div class="crop-card animate-fade-in" onclick="showCropDetails(${crop.id})">
            <div class="crop-header">
                <div class="crop-icon">${cropIcon}</div>
                <div class="crop-season ${seasonClass}">${crop.season.toUpperCase()}</div>
            </div>
            <div class="crop-content">
                <h3 class="crop-name">${crop.crop_name || crop.translations?.[currentLanguage]?.crop_name || 'Unknown Crop'}</h3>
                <div class="crop-meta">
                    <span class="crop-type">${crop.crop_type}</span>
                    <span class="planting-time">🌱 ${crop.planting_time}</span>
                </div>
                <p class="crop-description">${crop.description || crop.translations?.[currentLanguage]?.description || 'No description available'}</p>
                <div class="crop-stats">
                    <div class="stat">
                        <span class="stat-value">${crop.yield_per_acre}</span>
                        <span class="stat-label">Yield/Acre</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${crop.water_requirement}</span>
                        <span class="stat-label">Water</span>
                    </div>
                </div>
            </div>
            <div class="crop-actions">
                <button class="btn btn-secondary" onclick="event.stopPropagation(); showCropDetails(${crop.id})">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// Get crop icon based on type
function getCropIcon(cropType) {
    const icons = {
        'cereal': '🌾',
        'pulse': '🫘',
        'vegetable': '🥕',
        'fruit': '🍎',
        'oilseed': '🌻',
        'fiber': '🌿'
    };
    return icons[cropType] || '🌱';
}

// Filter crops by season
function filterBySeason(season) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const activeButton = Array.from(tabButtons).find(btn =>
        btn.textContent.toLowerCase().includes(season) ||
        (season === 'all' && btn.textContent.toLowerCase().includes('all'))
    );
    if (activeButton) activeButton.classList.add('active');

    if (season === 'all') {
        filteredCropsData = [...allCropsData];
    } else {
        filteredCropsData = allCropsData.filter(crop => crop.season === season);
    }

    displayCropsData();
}

// Update statistics in hero section
function updateStats() {
    const totalCrops = document.getElementById('totalCrops');
    const kharifCount = document.getElementById('kharifCount');
    const rabiCount = document.getElementById('rabiCount');

    if (totalCrops) totalCrops.textContent = allCropsData.length;
    if (kharifCount) kharifCount.textContent = allCropsData.filter(crop => crop.season === 'kharif').length;
    if (rabiCount) rabiCount.textContent = allCropsData.filter(crop => crop.season === 'rabi').length;
}

// Show crop details in modal
function showCropDetails(cropId) {
    const crop = allCropsData.find(c => c.id === cropId);
    if (!crop) return;

    const modal = document.getElementById('cropModal');
    const cropDetails = document.getElementById('cropDetails');

    if (!modal || !cropDetails) return;

    const translations = crop.translations?.[currentLanguage] || {};

    cropDetails.innerHTML = `
        <div class="crop-detail-header">
            <h2>${translations.crop_name || crop.crop_name || 'Unknown Crop'}</h2>
            <div class="crop-badges">
                <span class="badge season-${crop.season}">${crop.season.toUpperCase()}</span>
                <span class="badge type-${crop.crop_type}">${crop.crop_type}</span>
            </div>
        </div>

        <div class="crop-detail-content">
            <div class="detail-section">
                <h3>Description</h3>
                <p>${translations.description || crop.description || 'No description available'}</p>
            </div>

            <div class="detail-grid">
                <div class="detail-item">
                    <h4>Planting Time</h4>
                    <p>${crop.planting_time}</p>
                </div>
                <div class="detail-item">
                    <h4>Harvesting Time</h4>
                    <p>${crop.harvesting_time}</p>
                </div>
                <div class="detail-item">
                    <h4>Yield per Acre</h4>
                    <p>${crop.yield_per_acre}</p>
                </div>
                <div class="detail-item">
                    <h4>Water Requirement</h4>
                    <p>${crop.water_requirement}</p>
                </div>
                <div class="detail-item">
                    <h4>Soil Type</h4>
                    <p>${crop.soil_type}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3>Care Instructions</h3>
                <p>${translations.care_instructions || crop.care_instructions || 'No care instructions available'}</p>
            </div>

            <div class="detail-section">
                <h3>Benefits</h3>
                <p>${translations.benefits || crop.benefits || 'No benefits information available'}</p>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('cropModal');
    if (modal) modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('cropModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize language on page load
updateLanguageIndicator();
