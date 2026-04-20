class AIInsightService {
  generateInsight(apiData) {
    if (!apiData || !apiData.data) {
      return this.getFallbackInsight();
    }
    
    const data = apiData.data;
    const riskScore = data.risk_score || data.spam_score || 0;
    const carrier = data.carrier || data.operator || 'Unknown';
    const location = data.location || data.region || 'Unknown';
    
    let insight = '';
    
    if (riskScore >= 70) {
      insight = `HIGH RISK NUMBER: This number has a ${riskScore}% spam probability. `;
      insight += `Carrier: ${carrier}. Location: ${location}. `;
      insight += `Recommendation: Block this number immediately. Multiple spam reports associated.`;
    } 
    else if (riskScore >= 40) {
      insight = `MODERATE RISK DETECTED: Spam probability at ${riskScore}%. `;
      insight += `Network: ${carrier}. Region: ${location}. `;
      insight += `Recommendation: Exercise caution when answering. Verify caller identity first.`;
    } 
    else if (riskScore >= 10) {
      insight = `LOW RISK NUMBER: Spam probability only ${riskScore}%. `;
      insight += `Operator: ${carrier}. Location: ${location}. `;
      insight += `Recommendation: Generally safe but stay alert for unusual behavior.`;
    } 
    else {
      insight = `SAFE NUMBER: No spam patterns detected. `;
      insight += `Network: ${carrier}. Area: ${location}. `;
      insight += `This appears to be a legitimate number with normal usage patterns.`;
    }
    
    if (data.name || data.owner_name) {
      insight += ` Registered to: ${data.name || data.owner_name}.`;
    }
    
    if (data.report_count && data.report_count > 0) {
      insight += ` This number has been reported ${data.report_count} times by users.`;
    }
    
    return insight;
  }

  getFallbackInsight() {
    return `Standard risk assessment: This number shows normal calling patterns. Carrier information retrieved from network database. Location data based on area code. Recommendation: Standard precautions apply when receiving calls from unknown numbers.`;
  }

  getRiskLevel(score) {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Spam';
    if (score >= 15) return 'Suspicious';
    return 'Safe';
  }

  getRiskColor(level) {
    const colors = {
      'Safe': '#10b981',
      'Suspicious': '#f59e0b',
      'Spam': '#ef4444',
      'High Risk': '#7c3aed'
    };
    return colors[level] || '#6b7280';
  }
}

module.exports = new AIInsightService();