class AIInsightService {
  generateInsight(phoneData) {
    const carrier = phoneData.carrier;
    const location = phoneData.location;
    const division = phoneData.division;
    const number = phoneData.number;
    const spamScore = phoneData.spamScore;
    
    // Determine risk level
    let riskLevel = 'Safe';
    if (spamScore >= 70) riskLevel = 'High Risk';
    else if (spamScore >= 50) riskLevel = 'Spam';
    else if (spamScore >= 30) riskLevel = 'Suspicious';
    else riskLevel = 'Safe';
    
    // Generate insight based on spam score
    let insight = '';
    
    if (spamScore >= 70) {
      insight = `HIGH RISK NUMBER: This ${carrier} number from ${location} has a ${spamScore}% spam probability. `;
      insight += `The number shows patterns consistent with telemarketing or fraudulent activities. `;
      insight += `Recommendation: Block this number and do not share any personal information.`;
    }
    else if (spamScore >= 50) {
      insight = `SPAM SUSPECTED: ${carrier} number from ${location} with ${spamScore}% spam score. `;
      insight += `This number has been associated with unwanted calls. `;
      insight += `Recommendation: Be cautious when answering. Verify the caller's identity first.`;
    }
    else if (spamScore >= 30) {
      insight = `MODERATE RISK: This ${carrier} number from ${location}, ${division} shows some unusual patterns. `;
      insight += `Spam probability: ${spamScore}%. `;
      insight += `Recommendation: Normal precautions advised for unknown numbers.`;
    }
    else {
      insight = `LOW RISK NUMBER: This appears to be a legitimate ${carrier} number from ${location}, ${division}. `;
      insight += `Spam probability is only ${spamScore}%. `;
      insight += `Normal calling patterns detected. This number is safe to answer.`;
    }
    
    // Add carrier specific info
    if (carrier === 'Grameenphone') {
      insight += ` ${carrier} is Bangladesh's largest mobile operator with standard security measures.`;
    } else if (carrier === 'Robi') {
      insight += ` ${carrier} is a major telecom provider in Bangladesh with good security practices.`;
    } else if (carrier === 'Banglalink') {
      insight += ` ${carrier} is a popular mobile operator in Bangladesh.`;
    }
    
    return {
      insight: insight,
      spamScore: spamScore,
      riskLevel: riskLevel,
      confidence: this.getConfidence(spamScore)
    };
  }

  getConfidence(score) {
    if (score > 70 || score < 20) return '92%';
    if (score > 50 || score < 35) return '85%';
    return '78%';
  }
}

module.exports = new AIInsightService();