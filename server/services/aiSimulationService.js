class AISimulationService {
  async generateIntelligence(phoneData, existingData = null) {
    await this.simulateProcessing();
    
    // Smart name generation based on country and area
    const fakeName = this.generateSmartName(phoneData.country, phoneData.location);
    
    // Realistic spam score calculation
    let spamScore = this.calculateSpamScore(phoneData, existingData);
    const riskLevel = this.determineRiskLevel(spamScore);
    const aiInsight = this.generateDetailedInsight(spamScore, phoneData);
    
    return {
      fakeName,
      spamScore,
      riskLevel,
      aiInsight,
      profileImage: await this.getProfileImage(fakeName, phoneData.country),
      confidence: this.calculateConfidence(spamScore, phoneData),
      analysisMetrics: this.getAnalysisMetrics(phoneData)
    };
  }

  generateSmartName(country, location) {
    const namesByCountry = {
      'BD': {
        first: ['Mohammad', 'Rafiq', 'Shahidul', 'Nasrin', 'Farhana', 'Hasan', 'Sumaiya'],
        last: ['Rahman', 'Islam', 'Khan', 'Hossain', 'Ahmed', 'Begum']
      },
      'IN': {
        first: ['Raj', 'Priya', 'Amit', 'Divya', 'Sanjay', 'Neha', 'Vikram'],
        last: ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy']
      },
      'US': {
        first: ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer'],
        last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia']
      }
    };
    
    const countryNames = namesByCountry[country] || namesByCountry['US'];
    const firstName = countryNames.first[Math.floor(Math.random() * countryNames.first.length)];
    const lastName = countryNames.last[Math.floor(Math.random() * countryNames.last.length)];
    
    // Add location context if available
    if (location && location.city && location.city !== 'Unknown') {
      return `${firstName} ${lastName}`;
    }
    return `${firstName} ${lastName}`;
  }

  calculateSpamScore(phoneData, existingData) {
    let score = 40; // Base score
    
    // Line type impact
    if (phoneData.lineType === 'Toll-Free') score += 20;
    else if (phoneData.lineType === 'VoIP') score += 15;
    else if (phoneData.lineType === 'Mobile') score -= 10;
    else if (phoneData.lineType === 'Landline') score -= 5;
    
    // Platform presence impact
    if (phoneData.platforms) {
      if (phoneData.platforms.whatsapp) score -= 5;
      if (phoneData.platforms.telegram) score -= 3;
    }
    
    // Existing reports
    if (existingData) {
      score += existingData.spamReports * 3;
      if (existingData.searchCount > 10) score += 5;
    }
    
    // Number characteristics
    const hasRepeatedDigits = /(.)\1{4,}/.test(phoneData.nationalNumber);
    if (hasRepeatedDigits) score += 15;
    
    // Ensure range 0-100
    return Math.min(100, Math.max(0, score));
  }

  determineRiskLevel(spamScore) {
    if (spamScore >= 75) return 'High Risk';
    if (spamScore >= 55) return 'Spam';
    if (spamScore >= 35) return 'Suspicious';
    return 'Safe';
  }

  generateDetailedInsight(spamScore, phoneData) {
    let insight = '';
    
    if (spamScore >= 75) {
      insight = '🔴 CRITICAL: This number shows strong patterns associated with fraudulent activities. ';
    } else if (spamScore >= 55) {
      insight = '⚠️ WARNING: Multiple red flags detected. This number has been reported by users. ';
    } else if (spamScore >= 35) {
      insight = '⚡ CAUTION: Some unusual patterns observed. Verify before sharing personal information. ';
    } else {
      insight = '✅ SAFE: Normal calling patterns. This appears to be a legitimate number. ';
    }
    
    // Add context
    if (phoneData.location && phoneData.location.city && phoneData.location.city !== 'Unknown') {
      insight += `Geolocated to ${phoneData.location.city}. `;
    }
    
    if (phoneData.carrier) {
      insight += `Carrier: ${phoneData.carrier}. `;
    }
    
    if (phoneData.platforms) {
      const activePlatforms = [];
      if (phoneData.platforms.whatsapp) activePlatforms.push('WhatsApp');
      if (phoneData.platforms.telegram) activePlatforms.push('Telegram');
      if (activePlatforms.length > 0) {
        insight += `Active on: ${activePlatforms.join(', ')}. `;
      }
    }
    
    insight += `Confidence level: ${this.calculateConfidence(spamScore, phoneData) * 100}%.`;
    
    return insight;
  }

  calculateConfidence(spamScore, phoneData) {
    let confidence = 0.75;
    if (spamScore > 80 || spamScore < 20) confidence = 0.92;
    if (phoneData.location && phoneData.location.source !== 'none') confidence += 0.05;
    if (phoneData.carrier && phoneData.carrier !== 'Unknown') confidence += 0.03;
    return Math.min(0.98, confidence);
  }

  getAnalysisMetrics(phoneData) {
    return {
      dataSources: ['Numverify', 'libphonenumber', 'GeoDB'],
      lastUpdated: new Date().toISOString(),
      verificationMethod: phoneData.location?.source === 'libphonenumber' ? 'Real API' : 'Simulated'
    };
  }

  async simulateProcessing() {
    return new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));
  }

  async getProfileImage(name, country) {
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const seed = Math.floor(Math.random() * 100);
    return `https://randomuser.me/api/portraits/${gender}/${seed}.jpg`;
  }
}

module.exports = new AISimulationService();