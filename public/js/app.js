// DOM Elements
const phoneInput = document.getElementById('phoneInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');
const darkModeBtn = document.getElementById('darkModeBtn');

// Toast Function
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg mb-2 toast`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'} mr-2"></i>${message}`;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Loading Skeleton
function showSkeleton() {
    resultsDiv.classList.remove('hidden');
    resultsDiv.innerHTML = `
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8">
            <div class="flex items-center space-x-6 mb-6">
                <div class="skeleton w-24 h-24 rounded-full"></div>
                <div class="flex-1">
                    <div class="skeleton h-8 w-48 mb-2 rounded"></div>
                    <div class="skeleton h-4 w-64 rounded"></div>
                </div>
            </div>
            <div class="space-y-4">
                <div class="skeleton h-6 w-full rounded"></div>
                <div class="skeleton h-6 w-3/4 rounded"></div>
            </div>
        </div>
    `;
}

// Search Function
async function searchNumber() {
    const phoneNumber = phoneInput.value.trim();
    
    if (!phoneNumber) {
        showToast('Please enter a phone number', 'error');
        return;
    }
    
    // Show loading state
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
        showToast('Analysis complete!', 'success');
        
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
    
    const html = `
        <div class="bg-white/10 backdrop-blur-md rounded-2xl p-8 result-card">
            <!-- Header -->
            <div class="flex flex-col md:flex-row items-center gap-6 mb-8">
                <img src="${data.profileImage}" class="w-24 h-24 rounded-full border-4 border-purple-500" alt="Profile">
                <div class="text-center md:text-left">
                    <h2 class="text-2xl font-bold text-white">${data.fakeName}</h2>
                    <p class="text-white/80 text-lg">${data.formattedNumber}</p>
                </div>
                <div class="ml-auto">
                    <span class="px-6 py-2 rounded-full text-white font-semibold ${riskClass}">
                        <i class="fas ${data.riskLevel === 'Safe' ? 'fa-shield-alt' : data.riskLevel === 'High Risk' ? 'fa-skull-crossbones' : 'fa-exclamation-triangle'} mr-2"></i>
                        ${data.riskLevel}
                    </span>
                </div>
            </div>
            
            <!-- Details -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="space-y-3">
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-flag w-5"></i>
                        <div>
                            <p class="text-white/60 text-sm">Country</p>
                            <p class="font-semibold">${data.country} (${data.countryCode})</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-tower-cell w-5"></i>
                        <div>
                            <p class="text-white/60 text-sm">Carrier</p>
                            <p class="font-semibold">${data.carrier}</p>
                        </div>
                    </div>
                </div>
                <div class="space-y-3">
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-chart-line w-5"></i>
                        <div>
                            <p class="text-white/60 text-sm">Spam Score</p>
                            <div class="flex items-center space-x-2">
                                <div class="w-32 bg-white/20 rounded-full h-2">
                                    <div class="bg-yellow-500 rounded-full h-2" style="width: ${data.spamScore}%"></div>
                                </div>
                                <span class="font-semibold">${data.spamScore}%</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-mobile-alt w-5"></i>
                        <div>
                            <p class="text-white/60 text-sm">Line Type</p>
                            <p class="font-semibold">${data.lineType}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- AI Insight -->
            <div class="bg-purple-900/30 rounded-xl p-6 mb-8">
                <div class="flex items-start space-x-3">
                    <i class="fas fa-robot text-purple-400 text-2xl"></i>
                    <div>
                        <p class="text-purple-300 text-sm font-semibold mb-1">🤖 AI INSIGHT</p>
                        <p class="text-white leading-relaxed" id="aiText">${data.aiInsight}</p>
                    </div>
                </div>
            </div>
            
            <!-- Actions -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onclick="window.open('https://wa.me/${data.number}', '_blank')" 
                        class="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </button>
                <button onclick="window.open('https://www.google.com/search?q=${data.number}', '_blank')"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                    <i class="fab fa-google"></i>
                    <span>Google</span>
                </button>
                <button onclick="navigator.clipboard.writeText('${data.formattedNumber}'); showToast('Copied!', 'success')"
                        class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition flex items-center justify-center space-x-2">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

// Dark Mode Toggle
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = darkModeBtn.querySelector('i');
    if (document.body.classList.contains('dark')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// Event Listeners
searchBtn.addEventListener('click', searchNumber);
phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchNumber();
});

// Welcome Toast
showToast('Welcome to TorNumber! Enter a phone number to begin.', 'info');