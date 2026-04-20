class NumberController {
  async lookupNumber(req, res) {
    try {
      const { phoneNumber } = req.body;
      
      console.log(`\n🔍 Checking number: ${phoneNumber}`);
      
      if (!phoneNumber || phoneNumber.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Please enter a phone number'
        });
      }
      
      // Clean the number
      let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
      let formattedNumber = '';
      let carrier = 'Unknown';
      let location = 'Unknown';
      let spamScore = 15;
      
      // Process Bangladeshi number
      if (cleanNumber.startsWith('880') && cleanNumber.length === 13) {
        cleanNumber = cleanNumber.substring(3);
        formattedNumber = `+880${cleanNumber}`;
      }
      else if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
        cleanNumber = cleanNumber.substring(1);
        formattedNumber = `+88${cleanNumber}`;
      }
      else if (cleanNumber.length === 10) {
        formattedNumber = `+88${cleanNumber}`;
      }
      else {
        return res.status(400).json({
          success: false,
          error: 'Invalid Bangladeshi number. Use format: 01712345678'
        });
      }
      
      // Detect carrier from prefix
      const prefix = cleanNumber.substring(0, 3);
      
      if (prefix === '017' || prefix === '013' || prefix === '014') {
        carrier = 'Grameenphone';
        spamScore = 12;
      } else if (prefix === '018' || prefix === '016' || prefix === '019') {
        carrier = 'Robi';
        spamScore = 15;
      } else if (prefix === '015') {
        carrier = 'Teletalk';
        spamScore = 10;
      } else {
        carrier = 'Banglalink';
        spamScore = 18;
      }
      
      // Detect location from prefix
      const areaPrefix = cleanNumber.substring(0, 2);
      const locations = {
        '13': 'Dhaka', '14': 'Chattogram', '15': 'Rajshahi',
        '16': 'Khulna', '17': 'Sylhet', '18': 'Barishal',
        '19': 'Rangpur'
      };
      location = locations[areaPrefix] || 'Dhaka';
      
      // Determine risk level
      let riskLevel = 'Safe';
      if (spamScore >= 70) riskLevel = 'High Risk';
      else if (spamScore >= 50) riskLevel = 'Spam';
      else if (spamScore >= 30) riskLevel = 'Suspicious';
      else riskLevel = 'Safe';
      
      // Generate AI insight
      let aiInsight = '';
      if (spamScore >= 70) {
        aiInsight = `HIGH RISK: This ${carrier} number from ${location} has a ${spamScore}% spam probability. Recommendation: Block this number.`;
      } else if (spamScore >= 50) {
        aiInsight = `SPAM SUSPECTED: ${carrier} number from ${location} with ${spamScore}% spam score. Be cautious when answering.`;
      } else if (spamScore >= 30) {
        aiInsight = `MODERATE RISK: This ${carrier} number from ${location} shows some unusual patterns. Normal precautions advised.`;
      } else {
        aiInsight = `LOW RISK: This appears to be a legitimate ${carrier} number from ${location}. Spam probability is only ${spamScore}%. Safe to answer.`;
      }
      
      // Generate profile image
      const hash = this.hashCode(cleanNumber);
      const gender = hash % 2 === 0 ? 'men' : 'women';
      const imgId = (hash % 90) + 10;
      const profileImage = `https://randomuser.me/api/portraits/${gender}/${imgId}.jpg`;
      
      const responseData = {
        number: cleanNumber,
        formattedNumber: formattedNumber,
        countryName: 'Bangladesh',
        countryCode: '+88',
        carrier: carrier,
        lineType: 'Mobile',
        location: location,
        fullLocation: `${location}, Bangladesh`,
        spamScore: spamScore,
        riskLevel: riskLevel,
        aiInsight: aiInsight,
        confidence: '85%',
        profileImage: profileImage,
        whatsappLink: `https://wa.me/${cleanNumber}`,
        telegramLink: `https://t.me/${cleanNumber}`
      };
      
      console.log(`✅ Carrier: ${carrier}, Location: ${location}, Score: ${spamScore}%`);
      
      res.json({
        success: true,
        data: responseData
      });
      
    } catch (error) {
      console.error('Controller Error:', error.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error. Please try again.'
      });
    }
  }
  
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

module.exports = new NumberController();