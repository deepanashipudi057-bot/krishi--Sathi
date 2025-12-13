/*
========================================
WEATHER.JS - Krishi Sathi Application
Weather Forecast Page Functionality
========================================
*/

let allWeatherData = [];
let filteredData = [];
let currentLanguage = 'en';

// API endpoint
const API_BASE_URL = 'http://127.0.0.1:5000/api/v1';

// DOM elements
let weatherList;
let filterLocation;
let searchInput;
let refreshBtn;
let loadingSpinner;
let errorMessage;
let noDataMessage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Weather page initialized');
    initializeElements();
    initializeEventListeners();
    loadWeatherData();
    
    // Listen for language changes
    window.addEventListener('languageChanged', function(e) {
        currentLanguage = e.detail.language;
        console.log('Language changed to:', currentLanguage);
        renderWeather();
    });
});

/**
 * Initialize DOM elements
 */
function initializeElements() {
    weatherList = document.getElementById('weatherList');
    filterLocation = document.getElementById('filterLocation');
    searchInput = document.getElementById('searchInput');
    refreshBtn = document.getElementById('refreshBtn');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    noDataMessage = document.getElementById('noDataMessage');
    
    console.log('Elements initialized:', {
        weatherList: !!weatherList,
        filterLocation: !!filterLocation,
        searchInput: !!searchInput
    });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    if (filterLocation) {
        filterLocation.addEventListener('change', applyFilters);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadWeatherData();
            resetFilters();
        });
    }
}

/**
 * Load weather data from API or JSON
 */
async function loadWeatherData() {
    console.log('Loading weather data...');
    showLoading();
    hideError();
    hideNoData();
    
    // Try local JSON first (more reliable during development)
    try {
        console.log('Attempting to load from local JSON...');
        const response = await fetch('./data/weather_data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded from JSON:', data);
        
        if (data && data.weather_forecasts) {
            allWeatherData = data.weather_forecasts;
            filteredData = [...allWeatherData];
            console.log('Total weather items loaded:', allWeatherData.length);
            renderWeather();
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
            const apiResponse = await fetch(`${API_BASE_URL}/weather?lang=${currentLanguage}`);
            
            if (!apiResponse.ok) {
                throw new Error(`API error! status: ${apiResponse.status}`);
            }
            
            const result = await apiResponse.json();
            console.log('Data loaded from API:', result);
            
            if (result.success && result.data) {
                allWeatherData = result.data;
                filteredData = [...allWeatherData];
                console.log('Total weather items loaded from API:', allWeatherData.length);
                renderWeather();
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
    allWeatherData = [
        {
            id: 1,
            location: "Mumbai",
            date: "2025-11-05",
            temperature: 32,
            condition: "Partly Cloudy",
            humidity: 75,
            rainfall: 5,
            wind_speed: 15,
            translations: {
                en: {
                    advice: "Good conditions for farming. Moderate humidity levels favorable for most crops."
                },
                hi: {
                    advice: "खेती के लिए अच्छी स्थितियां। अधिकांश फसलों के लिए अनुकूल मध्यम आर्द्रता स्तर।"
                }
            }
        },
        {
            id: 2,
            location: "Pune",
            date: "2025-11-05",
            temperature: 28,
            condition: "Sunny",
            humidity: 60,
            rainfall: 0,
            wind_speed: 12,
            translations: {
                en: {
                    advice: "Perfect weather for outdoor activities and farming operations."
                },
                hi: {
                    advice: "बाहरी गतिविधियों और खेती के कार्यों के लिए उत्तम मौसम।"
                }
            }
        },
        {
            id: 3,
            location: "Bangalore",
            date: "2025-11-05",
            temperature: 26,
            condition: "Cloudy",
            humidity: 70,
            rainfall: 2,
            wind_speed: 10,
            translations: {
                en: {
                    advice: "Light rain expected. Good for irrigation-dependent crops."
                },
                hi: {
                    advice: "हल्की बारिश की उम्मीद। सिंचाई पर निर्भर फसलों के लिए अच्छा।"
                }
            }
        }
    ];
    
    filteredData = [...allWeatherData];
    console.log('Sample data loaded:', allWeatherData.length, 'items');
    renderWeather();
}

/**
 * Render weather list
 */
function renderWeather() {
    if (!weatherList) {
        console.error('Weather list element not found!');
        return;
    }
    
    weatherList.innerHTML = '';
    
    if (filteredData.length === 0) {
        showNoData();
        return;
    }
    
    hideNoData();
    
    console.log('Rendering', filteredData.length, 'weather items');
    
    filteredData.forEach((weather, index) => {
        const card = createWeatherCard(weather, index);
        weatherList.appendChild(card);
    });
}

/**
 * Create weather card element
 */
function createWeatherCard(weather, index) {
    const card = document.createElement('div');
    card.className = 'data-card weather-card';
    card.setAttribute('data-index', index);
    
    const advice = getTranslatedField(weather, 'advice');
    const weatherIcon = getWeatherIcon(weather.condition);
    
    card.innerHTML = `
        <div class="card-header">
            <h3>📍 ${weather.location}</h3>
            <p style="opacity: 0.8;">${formatDate(weather.date)}</p>
        </div>
        
        <div class="card-body">
            <div class="weather-main">
                <div class="weather-icon">${weatherIcon}</div>
                <div>
                    <div class="temperature">${weather.temperature}°C</div>
                    <div class="weather-condition">${weather.condition}</div>
                </div>
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <div class="label">💧 ${getLabel('humidity')}</div>
                    <div class="value">${weather.humidity}%</div>
                </div>
                <div class="detail-item">
                    <div class="label">🌧️ ${getLabel('rainfall')}</div>
                    <div class="value">${weather.rainfall}mm</div>
                </div>
                <div class="detail-item">
                    <div class="label">💨 ${getLabel('wind_speed')}</div>
                    <div class="value">${weather.wind_speed} km/h</div>
                </div>
            </div>
            
            <div class="advice">
                <h4>💡 ${getLabel('farming_advice')}</h4>
                <p>${advice}</p>
            </div>
        </div>
        
        <div class="card-footer">
            <button class="btn btn-primary" onclick="viewWeatherDetails(${index})">
                ${getLabel('view_forecast')} 📊
            </button>
            <button class="btn btn-secondary" onclick="shareWeather(${index})">
                ${getLabel('share')} 📤
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Get weather icon based on condition
 */
function getWeatherIcon(condition) {
    const icons = {
        'sunny': '☀️',
        'cloudy': '☁️',
        'partly cloudy': '⛅',
        'rainy': '🌧️',
        'stormy': '⛈️',
        'windy': '💨',
        'foggy': '🌫️'
    };
    
    return icons[condition.toLowerCase()] || '🌤️';
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Apply filters
 */
function applyFilters() {
    let filtered = [...allWeatherData];
    
    // Filter by location
    const selectedLocation = filterLocation?.value;
    if (selectedLocation && selectedLocation !== 'all') {
        filtered = filtered.filter(item => item.location === selectedLocation);
    }
    
    // Apply search filter
    const searchTerm = searchInput?.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(item => {
            const location = item.location.toLowerCase();
            const condition = item.condition.toLowerCase();
            
            return location.includes(searchTerm) || condition.includes(searchTerm);
        });
    }
    
    filteredData = filtered;
    console.log('Filtered results:', filteredData.length);
    renderWeather();
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
    if (filterLocation) filterLocation.value = 'all';
    if (searchInput) searchInput.value = '';
    
    filteredData = [...allWeatherData];
    renderWeather();
}

/**
 * View weather details
 */
function viewWeatherDetails(index) {
    const weather = filteredData[index];
    if (!weather) return;
    
    alert(`Detailed forecast for ${weather.location}\n\nTemperature: ${weather.temperature}°C\nCondition: ${weather.condition}\nHumidity: ${weather.humidity}%\nRainfall: ${weather.rainfall}mm\nWind Speed: ${weather.wind_speed} km/h`);
}

/**
 * Share weather
 */
function shareWeather(index) {
    const weather = filteredData[index];
    if (!weather) return;
    
    const shareText = `Weather for ${weather.location}\n${weather.condition}, ${weather.temperature}°C\nHumidity: ${weather.humidity}%`;
    
    if (navigator.share) {
        navigator.share({
            title: `Weather - ${weather.location}`,
            text: shareText
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Weather info copied to clipboard!');
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
            'humidity': 'Humidity',
            'rainfall': 'Rainfall',
            'wind_speed': 'Wind Speed',
            'farming_advice': 'Farming Advice',
            'view_forecast': 'View 7-Day Forecast',
            'share': 'Share'
        },
        'hi': {
            'humidity': 'आर्द्रता',
            'rainfall': 'वर्षा',
            'wind_speed': 'हवा की गति',
            'farming_advice': 'खेती सलाह',
            'view_forecast': '7-दिन पूर्वानुमान देखें',
            'share': 'साझा करें'
        }
    };
    
    return labels[currentLanguage]?.[key] || labels['en'][key] || key;
}

/**
 * Show/Hide loading spinner
 */
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (weatherList) weatherList.style.display = 'none';
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (weatherList) weatherList.style.display = 'grid';
}

/**
 * Show/Hide error message
 */
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

function hideError() {
    if (errorMessage) errorMessage.style.display = 'none';
}

/**
 * Show/Hide no data message
 */
function showNoData() {
    if (noDataMessage) noDataMessage.style.display = 'block';
}

function hideNoData() {
    if (noDataMessage) noDataMessage.style.display = 'none';
}

/**
 * Debounce function for search input
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
window.viewWeatherDetails = viewWeatherDetails;
window.shareWeather = shareWeather;

console.log('Weather.js loaded successfully');
