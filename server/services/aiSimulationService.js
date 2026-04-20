class AISimulationService {
  async generateIntelligence(phoneData) {
    // Fake processing delay (AI thinking time)
    await this.sleep(1500);
    
    const names = {
      US: ['James Smith', 'Mary Johnson', 'John Williams'],
      GB: ['Oliver Brown', 'Amelia Jones', 'Harry Davis'],
      IN: ['Aarav Sharma', 'Sanya Patel', 'Vihaan Kumar']
    };
    
    const nameList = names[phoneData.country] || names.US;
    const fakeName = nameList[Math.floor(Math.random() * nameList.length)];
    
    // Generate spam score based on line type
    let spamScore = 30;
    if (phoneData.lineType === 'Toll-Free') spamScore = 75;
    if (phoneData.lineType === 'Mobile') spamScore = 25;
    
    // Add random factor
    spamScore += Math.floor(Math.random() * 20);
    
    let riskLevel = 'Safe';
    if (spamScore > 70) riskLevel = 'High Risk';
    else if (spamScore > 50) riskLevel = 'Spam';
    else if (spamScore > 30) riskLevel = 'Suspicious';
    
    const insights = {
      'Safe': '✅ This number appears legitimate with normal calling patterns.',
      'Suspicious': '⚠️ Unusual patterns detected. Exercise caution.',
      'Spam': '🚫 Multiple reports indicate spam behavior.',
      'High Risk': '🔴 High probability of fraudulent activity!'
    };
    
    return {
      fakeName,
      spamScore,
      riskLevel,
      aiInsight: insights[riskLevel],
      profileImage: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`
    };
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AISimulationService();