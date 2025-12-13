/*
========================================
SCHEMES.JS - Krishi Sathi Application
Government Schemes Page Functionality
========================================
*/

let allSchemesData = [];
let filteredData = [];
let currentLanguage = 'en';

// API endpoint
const API_BASE_URL = 'http://127.0.0.1:5000/api';

// DOM elements
let schemesList;
let filterSchemeType;
let searchInput;
let refreshBtn;
let loadingSpinner;
let errorMessage;
let noDataMessage;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Schemes page initialized');
    initializeElements();
    initializeEventListeners();
    loadSchemesData();
    
    // Listen for language changes
    window.addEventListener('languageChanged', function(e) {
        currentLanguage = e.detail.language;
        console.log('Language changed to:', currentLanguage);
        renderSchemes();
    });
});

/**
 * Initialize DOM elements
 */
function initializeElements() {
    schemesList = document.getElementById('schemesData');
    filterSchemeType = document.getElementById('schemeTypeFilter');
    stateFilter = document.getElementById('stateFilter');
    searchInput = document.getElementById('searchInput');
    refreshBtn = document.getElementById('refreshBtn');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    noDataMessage = document.getElementById('noDataMessage');

    console.log('Elements initialized:', {
        schemesList: !!schemesList,
        filterSchemeType: !!filterSchemeType,
        stateFilter: !!stateFilter,
        searchInput: !!searchInput
    });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    if (filterSchemeType) {
        filterSchemeType.addEventListener('change', applyFilters);
    }

    if (stateFilter) {
        stateFilter.addEventListener('change', applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadSchemesData();
            resetFilters();
        });
    }
}

/**
 * Load schemes data from API or JSON
 */
async function loadSchemesData() {
    console.log('Loading schemes data...');
    showLoading();
    hideError();
    hideNoData();
    
    // Try local JSON first
    try {
        console.log('Attempting to load from local JSON...');
        const response = await fetch('./data/schemes_data.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded from JSON:', data);
        
        if (data && data.government_schemes) {
            allSchemesData = data.government_schemes;
            filteredData = [...allSchemesData];
            console.log('Total schemes loaded:', allSchemesData.length);
            renderSchemes();
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
            const apiResponse = await fetch(`${API_BASE_URL}/schemes?lang=${currentLanguage}`);
            
            if (!apiResponse.ok) {
                throw new Error(`API error! status: ${apiResponse.status}`);
            }
            
            const result = await apiResponse.json();
            console.log('Data loaded from API:', result);
            
            if (result.success && result.data) {
                allSchemesData = result.data;
                filteredData = [...allSchemesData];
                console.log('Total schemes loaded from API:', allSchemesData.length);
                renderSchemes();
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
    allSchemesData = [
        {
            id: 1,
            scheme_type: "subsidy",
            eligibility: "All landholding farmers",
            amount_range: "₹6,000 per year",
            installments: "3 equal installments of ₹2,000",
            contact_info: "155261 (Toll-free)",
            website: "https://pmkisan.gov.in",
            active: true,
            state: "national",
            translations: {
                en: {
                    scheme_name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
                    description: "Income support scheme providing direct cash transfer to landholding farmers to supplement their financial needs for procuring various inputs.",
                    benefits: "Financial assistance of ₹6,000 per year in three equal installments of ₹2,000 each, directly transferred to farmers' bank accounts.",
                    application_process: "Visit pmkisan.gov.in and register with Aadhaar number. Contact local agriculture office or fill online form. Documents required: Land records, Aadhaar, Bank details.",
                    required_documents: "Land ownership papers, Aadhaar card, Bank account details, Mobile number",
                    eligibility_details: "All landholding farmers with cultivable land up to 2 hectares",
                    timeline: "Applications processed within 7-10 days",
                    support_contact: "Helpline: 155261, Email: pmkisan-ict@gov.in"
                },
                hi: {
                    scheme_name: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
                    description: "विभिन्न इनपुट खरीदने के लिए किसानों की वित्तीय आवश्यकताओं को पूरा करने के लिए सीधे नकद हस्तांतरण प्रदान करने वाली आय सहायता योजना।",
                    benefits: "प्रति वर्ष ₹6,000 की वित्तीय सहायता तीन समान किस्तों में ₹2,000 प्रत्येक, सीधे किसानों के बैंक खातों में स्थानांतरित।",
                    application_process: "pmkisan.gov.in पर जाएं और आधार नंबर के साथ पंजीकरण करें। स्थानीय कृषि कार्यालय से संपर्क करें या ऑनलाइन फॉर्म भरें।",
                    required_documents: "भूमि स्वामित्व पत्र, आधार कार्ड, बैंक खाता विवरण, मोबाइल नंबर",
                    eligibility_details: "2 हेक्टेयर तक की कृषि योग्य भूमि वाले सभी भूमिधारक किसान",
                    timeline: "आवेदनों को 7-10 दिनों के भीतर संसाधित किया जाता है",
                    support_contact: "हेल्पलाइन: 155261, ईमेल: pmkisan-ict@gov.in"
                },
                mr: {
                    scheme_name: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
                    description: "विविध इनपुट खरेदी करण्यासाठी शेतकऱ्यांच्या आर्थिक गरजांना पूरक करण्यासाठी थेट रोख हस्तांतरण प्रदान करणारी उत्पन्न सहायता योजना.",
                    benefits: "प्रति वर्ष ₹6,000 ची आर्थिक सहायता तीन समान हप्त्यांमध्ये ₹2,000 प्रत्येक, थेट शेतकऱ्यांच्या बँक खात्यांमध्ये हस्तांतरित.",
                    application_process: "pmkisan.gov.in ला भेट द्या आणि आधार क्रमांकासह नोंदणी करा. स्थानिक कृषी कार्यालयाशी संपर्क साधा किंवा ऑनलाइन फॉर्म भरा.",
                    required_documents: "जमीन मालकीचे कागदपत्रे, आधार कार्ड, बँक खाते तपशील, मोबाइल नंबर",
                    eligibility_details: "2 हेक्टरपर्यंत कृषीयोग्य जमीन असलेले सर्व जमीनधारक शेतकरी",
                    timeline: "अर्ज 7-10 दिवसांच्या आत प्रक्रिया केले जातात",
                    support_contact: "हेल्पलाइन: 155261, ईमेल: pmkisan-ict@gov.in"
                },
                kn: {
                    scheme_name: "ಪಿಎಂ-ಕಿಸಾನ್ (ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ)",
                    description: "ವಿವಿಧ ಇನ್‌ಪುಟ್‌ಗಳನ್ನು ಖರೀದಿಸಲು ರೈತರ ಆರ್ಥಿಕ ಅಗತ್ಯಗಳನ್ನು ಪೂರೈಸಲು ನೇರ ನಗದ್ಯ ಹಸ್ತಾಂತರವನ್ನು ಒದಗಿಸುವ ಆದಾಯ ಬೆಂಬಲ ಯೋಜನೆ.",
                    benefits: "ಪ್ರತಿ ವರ್ಷ ₹6,000 ಆರ್ಥಿಕ ನೆರವು ಮೂರು ಸಮಾನ ಕಂತುಗಳಲ್ಲಿ ₹2,000 ಪ್ರತಿ, ನೇರವಾಗಿ ರೈತರ ಬ್ಯಾಂಕ್ ಖಾತೆಗಳಿಗೆ ಹಸ್ತಾಂತರಿಸಲಾಗುತ್ತದೆ.",
                    application_process: "pmkisan.gov.in ಗೆ ಭೇಟಿ ನೀಡಿ ಮತ್ತು ಆಧಾರ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ನೋಂದಣಿ ಮಾಡಿ. ಸ್ಥಳೀಯ ಕೃಷಿ ಕಛೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಆನ್‌ಲೈನ್ ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ.",
                    required_documents: "ಭೂಮಿ ಮಾಲೀಕತ್ವದ ಪತ್ರಗಳು, ಆಧಾರ್ ಕಾರ್ಡ್, ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
                    eligibility_details: "2 ಹೆಕ್ಟೇರ್‌ಗಳವರೆಗೆ ಕೃಷಿ ಯೋಗ್ಯ ಭೂಮಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ಭೂಮಿಧಾರಕ ರೈತರು",
                    timeline: "ಅರ್ಜಿಗಳನ್ನು 7-10 ದಿನಗಳಲ್ಲಿ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತದೆ",
                    support_contact: "ಹೆಲ್ಪ್‌ಲೈನ್: 155261, ಇಮೇಲ್: pmkisan-ict@gov.in"
                }
            }
        },
        {
            id: 2,
            scheme_type: "insurance",
            eligibility: "All farmers with insurable crops",
            amount_range: "Premium: 2% for Kharif, 1.5% for Rabi",
            installments: "N/A",
            contact_info: "1800-180-1551",
            website: "https://pmfby.gov.in",
            active: true,
            state: "national",
            translations: {
                en: {
                    scheme_name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
                    description: "Crop insurance scheme providing financial support to farmers suffering crop loss/damage arising from unforeseen events.",
                    benefits: "Comprehensive risk insurance at low premium. Coverage for pre-sowing to post-harvest risks. Quick claim settlement within 2 months.",
                    application_process: "Apply through banks, agriculture offices, or online at pmfby.gov.in. Premium: 2% for Kharif crops, 1.5% for Rabi crops.",
                    required_documents: "Land records, Crop sowing certificate, Bank account details, Aadhaar card"
                },
                hi: {
                    scheme_name: "पीएमएफबीवाई (प्रधानमंत्री फसल बीमा योजना)",
                    description: "अप्रत्याशित घटनाओं से उत्पन्न फसल हानि/क्षति से पीड़ित किसानों को वित्तीय सहायता प्रदान करने वाली फसल बीमा योजना।",
                    benefits: "कम प्रीमियम पर व्यापक जोखिम बीमा। बुवाई पूर्व से कटाई पश्चात जोखिमों के लिए कवरेज। 2 महीने के भीतर त्वरित दावा निपटान।",
                    application_process: "बैंकों, कृषि कार्यालयों के माध्यम से या pmfby.gov.in पर ऑनलाइन आवेदन करें। प्रीमियम: खरीफ के लिए 2%, रबी के लिए 1.5%।",
                    required_documents: "भूमि रिकॉर्ड, फसल बुवाई प्रमाण पत्र, बैंक खाता विवरण, आधार कार्ड"
                }
            }
        }
    ];
    
    filteredData = [...allSchemesData];
    console.log('Sample data loaded:', allSchemesData.length, 'items');
    renderSchemes();
}

/**
 * Render schemes list
 */
function renderSchemes() {
    if (!schemesList) {
        console.error('Schemes list element not found!');
        return;
    }
    
    schemesList.innerHTML = '';
    
    if (filteredData.length === 0) {
        showNoData();
        return;
    }
    
    hideNoData();
    
    console.log('Rendering', filteredData.length, 'schemes');
    
    filteredData.forEach((scheme, index) => {
        const card = createSchemeCard(scheme, index);
        schemesList.appendChild(card);
    });
}

/**
 * Create scheme card element
 */
function createSchemeCard(scheme, index) {
    const card = document.createElement('div');
    card.className = 'data-card scheme-card';
    card.setAttribute('data-index', index);
    
    const schemeName = getTranslatedField(scheme, 'scheme_name');
    const description = getTranslatedField(scheme, 'description');
    const benefits = getTranslatedField(scheme, 'benefits');
    const applicationProcess = getTranslatedField(scheme, 'application_process');
    const requiredDocuments = getTranslatedField(scheme, 'required_documents');
    
    const typeColors = {
        'subsidy': '#e3f2fd',
        'loan': '#f3e5f5',
        'insurance': '#e8f5e9',
        'grant': '#fff3e0'
    };
    const typeBgColor = typeColors[scheme.scheme_type] || '#f5f5f5';
    
    card.innerHTML = `
        ${scheme.active ? '<span class="scheme-badge">Active</span>' : ''}
        
        <div class="card-header">
            <h3>${schemeName}</h3>
            <span class="scheme-type" style="background-color: ${typeBgColor};">
                ${formatSchemeType(scheme.scheme_type)}
            </span>
        </div>
        
        <div class="card-body">
            <div class="scheme-highlight">
                <div class="amount">${scheme.amount_range}</div>
                ${scheme.installments !== 'N/A' ? `<div class="installments">${scheme.installments}</div>` : ''}
            </div>
            
            <div class="scheme-section">
                <h4>📋 ${getLabel('description')}</h4>
                <p>${description}</p>
            </div>
            
            <div class="scheme-section">
                <h4>✅ ${getLabel('benefits')}</h4>
                <p>${benefits}</p>
            </div>
            
            <div class="scheme-section">
                <h4>👥 ${getLabel('eligibility')}</h4>
                <p>${scheme.eligibility}</p>
            </div>

            <div class="scheme-section">
                <h4>📋 ${getLabel('eligibility_details')}</h4>
                <p>${getTranslatedField(scheme, 'eligibility_details')}</p>
            </div>

            <div class="scheme-section">
                <h4>⏰ ${getLabel('timeline')}</h4>
                <p>${getTranslatedField(scheme, 'timeline')}</p>
            </div>

            <div class="scheme-section">
                <h4>📝 ${getLabel('how_to_apply')}</h4>
                <p>${applicationProcess}</p>
            </div>

            ${requiredDocuments ? `
                <div class="scheme-section">
                    <h4>📄 ${getLabel('required_documents')}</h4>
                    <p>${requiredDocuments}</p>
                </div>
            ` : ''}

            <div class="scheme-contact">
                <h4>📞 ${getLabel('contact_information')}</h4>
                <p><strong>${getLabel('helpline')}:</strong> ${scheme.contact_info}</p>
                <p><strong>${getLabel('website')}:</strong> <a href="${scheme.website}" target="_blank">${scheme.website}</a></p>
                <p><strong>${getLabel('support_contact')}:</strong> ${getTranslatedField(scheme, 'support_contact')}</p>
            </div>
        </div>
        
        <div class="card-footer">
            <button class="btn btn-primary" onclick="applyScheme(${index})">
                ${getLabel('apply_now')} 📝
            </button>
            <button class="btn btn-secondary" onclick="shareScheme(${index})">
                ${getLabel('share')} 📤
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Format scheme type for display
 */
function formatSchemeType(type) {
    const typeLabels = {
        'en': {
            'subsidy': 'Subsidy',
            'loan': 'Loan',
            'insurance': 'Insurance',
            'grant': 'Grant'
        },
        'hi': {
            'subsidy': 'सब्सिडी',
            'loan': 'ऋण',
            'insurance': 'बीमा',
            'grant': 'अनुदान'
        },
        'mr': {
            'subsidy': 'सबसिडी',
            'loan': 'कर्ज',
            'insurance': 'विमा',
            'grant': 'अनुदान'
        },
        'kn': {
            'subsidy': 'ಸಬ್‌ಸಿಡಿ',
            'loan': 'ಸಾಲ',
            'insurance': 'ವಿಮೆ',
            'grant': 'ಅನುದಾನ'
        }
    };

    return typeLabels[currentLanguage]?.[type] || type;
}

/**
 * Apply filters
 */
function applyFilters() {
    let filtered = [...allSchemesData];

    // Filter by scheme type
    const selectedType = filterSchemeType?.value;
    if (selectedType && selectedType !== 'all') {
        filtered = filtered.filter(item => item.scheme_type === selectedType);
    }

    // Filter by state
    const selectedState = stateFilter?.value;
    if (selectedState && selectedState !== 'all') {
        filtered = filtered.filter(item => item.state === selectedState);
    }

    // Apply search filter
    const searchTerm = searchInput?.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(item => {
            const schemeName = getTranslatedField(item, 'scheme_name').toLowerCase();
            const description = getTranslatedField(item, 'description').toLowerCase();

            return schemeName.includes(searchTerm) || description.includes(searchTerm);
        });
    }

    filteredData = filtered;
    console.log('Filtered results:', filteredData.length);
    renderSchemes();
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
    if (filterSchemeType) filterSchemeType.value = 'all';
    if (stateFilter) stateFilter.value = 'all';
    if (searchInput) searchInput.value = '';

    filteredData = [...allSchemesData];
    renderSchemes();
}

/**
 * Apply for scheme
 */
function applyScheme(index) {
    const scheme = filteredData[index];
    if (!scheme) return;
    
    const schemeName = getTranslatedField(scheme, 'scheme_name');
    
    if (scheme.website) {
        const confirmApply = confirm(`Open ${schemeName} application website?\n\n${scheme.website}`);
        if (confirmApply) {
            window.open(scheme.website, '_blank');
        }
    } else {
        alert(`Contact: ${scheme.contact_info}\n\nPlease call or visit your local agriculture office to apply.`);
    }
}

/**
 * Share scheme
 */
function shareScheme(index) {
    const scheme = filteredData[index];
    if (!scheme) return;
    
    const schemeName = getTranslatedField(scheme, 'scheme_name');
    const shareText = `${schemeName}\n\nBenefit: ${scheme.amount_range}\nContact: ${scheme.contact_info}\nWebsite: ${scheme.website}`;
    
    if (navigator.share) {
        navigator.share({
            title: schemeName,
            text: shareText,
            url: scheme.website
        }).catch(err => console.log('Error sharing:', err));
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Scheme info copied to clipboard!');
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
            'description': 'Description',
            'benefits': 'Benefits',
            'eligibility': 'Eligibility',
            'how_to_apply': 'How to Apply',
            'required_documents': 'Required Documents',
            'contact_information': 'Contact Information',
            'helpline': 'Helpline',
            'website': 'Website',
            'apply_now': 'Apply Now',
            'share': 'Share',
            'eligibility_details': 'Eligibility Details',
            'timeline': 'Timeline',
            'support_contact': 'Support Contact'
        },
        'hi': {
            'description': 'विवरण',
            'benefits': 'लाभ',
            'eligibility': 'पात्रता',
            'how_to_apply': 'आवेदन कैसे करें',
            'required_documents': 'आवश्यक दस्तावेज',
            'contact_information': 'संपर्क जानकारी',
            'helpline': 'हेल्पलाइन',
            'website': 'वेबसाइट',
            'apply_now': 'अभी आवेदन करें',
            'share': 'साझा करें',
            'eligibility_details': 'पात्रता विवरण',
            'timeline': 'समय सीमा',
            'support_contact': 'सहायता संपर्क'
        },
        'mr': {
            'description': 'वर्णन',
            'benefits': 'लाभ',
            'eligibility': 'पात्रता',
            'how_to_apply': 'अर्ज कसा करावा',
            'required_documents': 'आवश्यक कागदपत्रे',
            'contact_information': 'संपर्क माहिती',
            'helpline': 'हेल्पलाइन',
            'website': 'वेबसाइट',
            'apply_now': 'आता अर्ज करा',
            'share': 'सामायिक करा',
            'eligibility_details': 'पात्रता तपशील',
            'timeline': 'वेळापत्रक',
            'support_contact': 'सहाय्य संपर्क'
        },
        'kn': {
            'description': 'ವಿವರಣೆ',
            'benefits': 'ಲಾಭ',
            'eligibility': 'ಅರ್ಹತೆ',
            'how_to_apply': 'ಅರ್ಜಿ ಮಾಡುವುದು ಹೇಗೆ',
            'required_documents': 'ಅಗತ್ಯ ದಾಖಲೆಗಳು',
            'contact_information': 'ಸಂಪರ್ಕ ಮಾಹಿತಿ',
            'helpline': 'ಹೆಲ್ಪ್‌ಲೈನ್',
            'website': 'ವೆಬ್‌ಸೈಟ್',
            'apply_now': 'ಈಗ ಅರ್ಜಿ ಮಾಡಿ',
            'share': 'ಹಂಚಿಕೊಳ್ಳಿ',
            'eligibility_details': 'ಅರ್ಹತೆ ವಿವರಗಳು',
            'timeline': 'ಸಮಯಸೀಮೆ',
            'support_contact': 'ಬೆಂಬಲ ಸಂಪರ್ಕ'
        }
    };

    return labels[currentLanguage]?.[key] || labels['en'][key] || key;
}

/**
 * Show/Hide elements
 */
function showLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (schemesList) schemesList.style.display = 'none';
}

function hideLoading() {
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (schemesList) schemesList.style.display = 'grid';
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
window.applyScheme = applyScheme;
window.shareScheme = shareScheme;

console.log('Schemes.js loaded successfully');
