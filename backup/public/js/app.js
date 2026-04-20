// DOM Elements
const phoneInput = document.getElementById('phoneInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');

// Toast function
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-rose-500',
        info: 'bg-blue-500'
    };
    
    toast.className = `${colors[type]} text-white px-4 py-2.5 rounded-lg shadow-xl mb-2 text-sm flex items-center space-x-2`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading skeleton
function showSkeleton() {
    resultsContainer.classList.remove('hidden');
    resultsContainer.innerHTML = `
        <div class="glass-card p-6">
            <div class="flex items-start space-x-5">
                <div class="skeleton w-16 h-16 rounded-full"></div>
                <div class="flex-1">
                    <div class="skeleton h-5 w-40 rounded mb-2"></div>
                    <div class="skeleton h-3.5 w-56 rounded"></div>
                </div>
            </div>
            <div class="mt-5 space-y-3">
                <div class="skeleton h-4 w-full rounded"></div>
                <div class="skeleton h-4 w-3/4 rounded"></div>
                <div class="skeleton h-4 w-1/2 rounded"></div>
            </div>
        </div>
    `;
}

// Search function
async function searchNumber() {
    const phoneNumber = phoneInput.value.trim();
    
    if (!phoneNumber) {
        showToast('Please enter a phone number', 'error');
        return;
    }
    
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
        showToast('Analysis completed', 'success');
        
    } catch (error) {
        showToast(error.message || 'Lookup failed', 'error');
        resultsContainer.classList.add('hidden');
    } finally {
        searchBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Display result
function displayResult(data) {
    const riskClass = this.getRiskClass(data.riskLevel);
    
    const html = `
        <div class="glass-card p-6 animate-fade">
            <div class="flex flex-col md:flex-row items-start gap-5 pb-5 border-b border-white/10">
                <img src="${data.profileImage}" class="w-16 h-16 rounded-full border border-purple-500/30 object-cover" alt="Profile">
                <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-3 mb-1">
                        <h2 class="text-xl font-semibold">${data.carrier} User</h2>
                        <span class="risk-badge ${riskClass}">${data.riskLevel}</span>
                    </div>
                    <p class="text-gray-300 text-lg font-mono mb-1">${data.formattedNumber}</p>
                    <p class="text-gray-500 text-sm">${data.lineType} · ${data.carrier}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-white/10">
                <div>
                    <p class="text-gray-500 text-xs uppercase tracking-wide">Carrier</p>
                    <p class="text-sm font-medium mt-1">${data.carrier}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-xs uppercase tracking-wide">Location</p>
                    <p class="text-sm font-medium mt-1">${data.location}, ${data.countryName}</p>
                </div>
                <div>
                    <p class="text-gray-500 text-xs uppercase tracking-wide">Spam Score</p>
                    <div class="flex items-center space-x-2 mt-1">
                        <div class="flex-1 bg-gray-700 rounded-full h-1.5 max-w-20">
                            <div class="bg-gradient-to-r from-amber-500 to-rose-500 rounded-full h-1.5" style="width: ${data.spamScore}%"></div>
                        </div>
                        <span class="text-sm font-medium">${data.spamScore}%</span>
                    </div>
                </div>
                <div>
                    <p class="text-gray-500 text-xs uppercase tracking-wide">Confidence</p>
                    <p class="text-sm font-medium mt-1">${data.confidence}</p>
                </div>
            </div>
            
            <div class="py-5 border-b border-white/10">
                <p class="text-gray-500 text-xs uppercase tracking-wide mb-2">AI Analysis</p>
                <div id="aiText" class="text-gray-300 text-sm leading-relaxed">${data.aiInsight}</div>
            </div>
            
            <div class="grid grid-cols-3 gap-3 pt-5">
                <a href="${data.whatsappLink}" target="_blank" class="text-center py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <i class="fab fa-whatsapp mr-1.5"></i> WhatsApp
                </a>
                <a href="${data.telegramLink}" target="_blank" class="text-center py-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition border border-blue-500/20 text-blue-400 text-sm font-medium">
                    <i class="fab fa-telegram mr-1.5"></i> Telegram
                </a>
                <button onclick="copyNumber('${data.formattedNumber}')" class="text-center py-2.5 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 transition border border-gray-500/20 text-gray-400 text-sm font-medium">
                    <i class="fas fa-copy mr-1.5"></i> Copy
                </button>
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    this.typeText('aiText', data.aiInsight);
}

// Helper functions
function getRiskClass(level) {
    const classes = {
        'Safe': 'risk-safe',
        'Suspicious': 'risk-suspicious',
        'Spam': 'risk-spam',
        'High Risk': 'risk-high-risk'
    };
    return classes[level] || 'risk-safe';
}

async function typeText(elementId, text) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        element.textContent += text[i];
        await new Promise(resolve => setTimeout(resolve, 10));
    }
}

window.copyNumber = function(number) {
    navigator.clipboard.writeText(number);
    showToast('Number copied', 'success');
};

// Event listeners
searchBtn.addEventListener('click', searchNumber);
phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchNumber();
});

phoneInput.focus();