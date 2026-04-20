// DOM Elements
const phoneInput = document.getElementById('phoneInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');
const darkModeBtn = document.getElementById('darkModeBtn');

// State
let darkMode = localStorage.getItem('darkMode') === 'true';

// Initialize dark mode
if (darkMode) {
    document.body.classList.add('dark');
}

// Toast Function
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-2 flex items-center space-x-3 transform transition-all duration-300`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading Skeleton
function showSkeleton() {
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = `
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 animate-pulse">
            <div class="flex items-center space-x-6 mb-6">
                <div class="w-24 h-24 bg-white/20 rounded-full"></div>
                <div class="flex-1">
                    <div class="h-8 bg-white/20 rounded w-48 mb-2"></div>
                    <div class="h-4 bg-white/20 rounded w-64"></div>
                </div>
            </div>
            <div class="space-y-4">
                <div class="h-6 bg-white/20 rounded w-full"></div>
                <div class="h-6 bg-white/20 rounded w-3/4"></div>
                <div class="h-6 bg-white/20 rounded w-1/2"></div>
            </div>
        </div>
    `;
}

// Search Function
async function searchNumber() {
    const phoneNumber = phoneInput.value.trim();
    
    if (!phoneNumber) {
        showToast('Please enter a phone number', 'warning');
        return;
    }
    
    // Show loading
    searchBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');
    showSkeleton();
    
    try {
        const response = await fetch('/api/lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        displayResult(result.data);
        showToast(`Analysis complete! ${result.cached ? '(Cached result)' : '(Real-time lookup)'}`, 'success');
        
    } catch (error) {
        showToast(error.message, 'error');
        resultsDiv.classList.add('hidden');
    } finally {
        searchBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Display Result
function displayResult(data) {
    const riskClass = `risk-${data.riskLevel.toLowerCase().replace(' ', '-')}`;
    const riskIcon = {
        'Safe': 'fa-shield-alt',
        'Suspicious': 'fa-exclamation-triangle',
        'Spam': 'fa-ban',
        'High Risk': 'fa-skull-crosswalk'
    }[data.riskLevel] || 'fa-question';
    
    // Platform badges
    const platformBadges = [];
    if (data.platforms?.whatsapp) platformBadges.push('<span class="inline-flex items-center px-2 py-1 rounded text-xs bg-green-500/20 text-green-300"><i class="fab fa-whatsapp mr-1"></i>WhatsApp</span>');
    if (data.platforms?.telegram) platformBadges.push('<span class="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300"><i class="fab fa-telegram mr-1"></i>Telegram</span>');
    
    const html = `
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 result-card">
            <!-- Header with Profile -->
            <div class="flex flex-col md:flex-row items-center gap-6 mb-8">
                <img src="${data.profileImage}" class="w-24 h-24 rounded-full border-4 border-purple-500 shadow-lg" alt="Profile">
                <div class="text-center md:text-left">
                    <h2 class="text-2xl font-bold text-white">${data.fakeName}</h2>
                    <p class="text-white/80 text-lg">${data.formattedNumber}</p>
                    <div class="flex gap-2 mt-2 justify-center md:justify-start">
                        ${platformBadges.join('')}
                    </div>
                </div>
                <div class="ml-auto">
                    <span class="px-6 py-2 rounded-full text-white font-semibold ${riskClass}">
                        <i class="fas ${riskIcon} mr-2"></i>
                        ${data.riskLevel}
                    </span>
                </div>
            </div>
            
            <!-- Details Grid - Enhanced -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="space-y-4">
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-flag w-5 text-purple-400"></i>
                        <div>
                            <p class="text-white/60 text-sm">Country</p>
                            <p class="font-semibold">${data.countryName || data.country} (${data.countryCode})</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-tower-cell w-5 text-purple-400"></i>
                        <div>
                            <p class="text-white/60 text-sm">Carrier / ISP</p>
                            <p class="font-semibold">${data.carrier}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-map-marker-alt w-5 text-purple-400"></i>
                        <div>
                            <p class="text-white/60 text-sm">Location / Area</p>
                            <p class="font-semibold">${data.location?.city || 'Unknown'} ${data.areaCode ? `(Area: ${data.areaCode})` : ''}</p>
                        </div>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-chart-line w-5 text-purple-400"></i>
                        <div>
                            <p class="text-white/60 text-sm">Spam Score</p>
                            <div class="flex items-center space-x-2">
                                <div class="w-32 bg-white/20 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-red-500 to-yellow-500 rounded-full h-2" style="width: ${data.spamScore}%"></div>
                                </div>
                                <span class="font-semibold">${data.spamScore}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-mobile-alt w-5 text-purple-400"></i>
                        <div>
                            <p class="text-white/60 text-sm">Line Type</p>
                            <p class="font-semibold">${data.lineType}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-clock w-5 text-purple-400"></i>
                        <div>
                            <p class="text-white/60 text-sm">Timezone</p>
                            <p class="font-semibold">${data.timezone?.timezone || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- AI Insight Card -->
            <div class="bg-purple-900/30 backdrop-blur rounded-xl p-6 mb-8 border border-purple-500/30">
                <div class="flex items-start space-x-3">
                    <i class="fas fa-robot text-purple-400 text-2xl animate-pulse"></i>
                    <div class="flex-1">
                        <p class="text-purple-300 text-sm font-semibold mb-2">
                            <i class="fas fa-microchip mr-1"></i> AI ANALYSIS
                            <span class="text-white/40 text-xs ml-2">Confidence: ${Math.round(data.confidence * 100)}%</span>
                        </p>
                        <p class="text-white leading-relaxed" id="aiText">${data.aiInsight}</p>
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button onclick="window.open('https://wa.me/${data.number}', '_blank')" 
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                    <i class="fab fa-whatsapp text-xl"></i>
                    <span>WhatsApp</span>
                </button>
                <button onclick="window.open('https://t.me/${data.number.replace('+', '')}', '_blank')"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                    <i class="fab fa-telegram text-xl"></i>
                    <span>Telegram</span>
                </button>
                <button onclick="window.open('https://www.google.com/search?q=${data.number}', '_blank')"
                        class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                    <i class="fab fa-google text-xl"></i>
                    <span>Search</span>
                </button>
                <button onclick="copyToClipboard('${data.formattedNumber}')"
                        class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                    <i class="fas fa-copy text-xl"></i>
                    <span>Copy</span>
                </button>
            </div>
            
            <!-- Report Spam -->
            <div class="border-t border-white/20 pt-4 text-center">
                <button onclick="reportSpam('${data.number}')" class="text-red-400 hover:text-red-300 text-sm transition">
                    <i class="fas fa-flag mr-1"></i> Report this number as spam
                </button>
                ${data.spamReports > 0 ? `<p class="text-white/40 text-xs mt-2"><i class="fas fa-users"></i> Reported by ${data.spamReports} users</p>` : ''}
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
    
    // Animate AI text
    animateText('aiText', data.aiInsight);
}

// Animate text typing effect
async function animateText(elementId, text) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, 20));
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
}

// Report spam
async function reportSpam(phoneNumber) {
    if (!confirm('Are you sure you want to report this number as spam?')) return;
    
    try {
        const response = await fetch('/api/report-spam', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, reason: 'Spam' })
        });
        
        const result = await response.json();
        if (result.success) {
            showToast(result.message, 'success');
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        showToast('Failed to report', 'error');
    }
}

// Dark mode toggle
darkModeBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', darkMode);
    showToast(`${darkMode ? 'Dark' : 'Light'} mode activated`, 'info');
});

// Event listeners
searchBtn.addEventListener('click', searchNumber);
phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchNumber();
});

// Welcome toast
showToast('Welcome to TorNumber! Enter any phone number to analyze', 'info');