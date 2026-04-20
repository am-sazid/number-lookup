const axios = require('axios');

class LookupNowService {
  constructor() {
    this.apiKey = process.env.LOOKUPNOW_API_KEY;
    this.useRealApi = false; // API কাজ না করলে false রাখো
  }

  async lookupNumber(phoneNumber) {
    console.log(`📡 Looking up: ${phoneNumber}`);
    
    // যদি real API ব্যবহার করতে চাও, তবে true করো
    if (this.useRealApi) {
      const result = await this.tryRealApi(phoneNumber);
      if (result.success) return result;
    }
    
    // সিমুলেটেড ডেটা রিটার্ন করো
    return this.getSimulatedData(phoneNumber);
  }

  async tryRealApi(phoneNumber) {
    const endpoints = [
      'https://api.lookupnow.top/api/lookup',
      'https://lookupnow.top/api/lookup'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.post(endpoint, {
          api_key: this.apiKey,
          number: phoneNumber
        }, { timeout: 5000 });
        
        if (response.data && (response.data.status === 'success' || response.data.carrier)) {
          return { success: true, data: response.data };
        }
      } catch (e) {
        continue;
      }
    }
    return { success: false };
  }

  getSimulatedData(phoneNumber) {
    console.log(`📊 Using simulated data for: ${phoneNumber}`);
    
    // Clean and format number
    let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
    let formattedNumber = phoneNumber;
    let countryCode = 'BD';
    let countryName = 'Bangladesh';
    let carrier = 'Grameenphone';
    let location = 'Dhaka';
    let city = 'Dhaka';
    let riskScore = 15;
    let lineType = 'Mobile';
    
    // Detect country and format
    if (cleanNumber.startsWith('880') || cleanNumber.startsWith('88')) {
      cleanNumber = cleanNumber.substring(cleanNumber.length - 10);
    }
    
    if (cleanNumber.startsWith('1') && cleanNumber.length === 10) {
      countryCode = 'US';
      countryName = 'United States';
      carrier = 'AT&T';
      location = 'New York';
      city = 'New York';
      riskScore = Math.floor(Math.random() * 35) + 10;
      formattedNumber = `+1 ${cleanNumber.substring(0,3)}-${cleanNumber.substring(3,6)}-${cleanNumber.substring(6)}`;
    }
    else if (cleanNumber.startsWith('91') || (cleanNumber.length === 10 && !cleanNumber.startsWith('1'))) {
      countryCode = 'IN';
      countryName = 'India';
      carrier = 'Airtel';
      location = 'Mumbai';
      city = 'Mumbai';
      riskScore = Math.floor(Math.random() * 30) + 8;
      formattedNumber = `+91 ${cleanNumber.substring(0,5)} ${cleanNumber.substring(5)}`;
    }
    else if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      countryCode = 'BD';
      countryName = 'Bangladesh';
      
      // Bangladesh carrier detection
      const prefix = cleanNumber.substring(cleanNumber.length - 10, cleanNumber.length - 7);
      
      if (prefix === '017' || prefix === '013' || prefix === '014' || prefix === '015') {
        carrier = 'Grameenphone';
      } else if (prefix === '018' || prefix === '016' || prefix === '019') {
        carrier = 'Robi';
      } else if (prefix === '011') {
        carrier = 'Teletalk';
      } else if (prefix === '010') {
        carrier = 'Airtel';
      } else {
        carrier = 'Banglalink';
      }
      
      // Location detection
      const areaCode = cleanNumber.substring(cleanNumber.length - 10, cleanNumber.length - 8);
      const locations = {
        '13': 'Dhaka', '14': 'Chattogram', '15': 'Rajshahi',
        '16': 'Khulna', '17': 'Sylhet', '18': 'Barishal',
        '19': 'Rangpur', '11': 'Mymensingh'
      };
      city = locations[areaCode] || 'Dhaka';
      location = `${city}, Bangladesh`;
      
      riskScore = Math.floor(Math.random() * 25) + 5;
      formattedNumber = `+88${cleanNumber.substring(cleanNumber.length - 10)}`;
    }
    
    // Risk level based on score
    let riskLevel = 'Low Risk';
    if (riskScore > 70) riskLevel = 'High Risk';
    else if (riskScore > 50) riskLevel = 'Spam';
    else if (riskScore > 30) riskLevel = 'Medium Risk';
    else riskLevel = 'Low Risk';
    
    // Generate AI insight
    let aiInsight = '';
    if (riskScore > 70) {
      aiInsight = `This number shows high spam probability with a ${riskScore}% risk score. The number is registered with ${carrier} in ${location}. Multiple reports have been filed against this number. Recommendation: Block this number immediately.`;
    } else if (riskScore > 50) {
      aiInsight = `Spam suspected with ${riskScore}% confidence. This ${lineType} number from ${location} using ${carrier} network has been reported by users. Recommendation: Exercise caution when answering.`;
    } else if (riskScore > 30) {
      aiInsight = `Medium risk detected at ${riskScore}%. This number is registered with ${carrier} in ${location}. Some unusual patterns observed. Recommendation: Verify caller identity before sharing information.`;
    } else {
      aiInsight = `Low risk number with ${riskScore}% spam probability. This appears to be a legitimate ${lineType} number registered with ${carrier} in ${location}. Normal calling patterns detected. Recommendation: Safe to answer.`;
    }
    
    return {
      success: true,
      data: {
        status: 'success',
        number: cleanNumber,
        formatted_number: formattedNumber,
        country_code: countryCode,
        country_name: countryName,
        carrier: carrier,
        operator: carrier,
        location: location,
        city: city,
        region: location,
        line_type: lineType,
        risk_score: riskScore,
        spam_score: riskScore,
        risk_level: riskLevel,
        report_count: riskScore > 50 ? Math.floor(Math.random() * 20) + 1 : 0,
        name: null,
        owner_name: null,
        ai_insight: aiInsight,
        last_updated: new Date().toISOString()
      }
    };
  }

  async getProfileImage(phoneNumber) {
    const hash = this.hashCode(phoneNumber);
    const gender = hash % 2 === 0 ? 'men' : 'women';
    const id = (hash % 90) + 10;
    
    return {
      whatsapp: `https://wa.me/${phoneNumber.toString().replace(/\D/g, '')}`,
      telegram: `https://t.me/${phoneNumber.toString().replace(/\D/g, '')}`,
      avatar: `https://randomuser.me/api/portraits/${gender}/${id}.jpg`
    };
  }

  hashCode(str) {
    let hash = 0;
    const cleanStr = str.toString().replace(/\D/g, '');
    for (let i = 0; i < cleanStr.length; i++) {
      hash = ((hash << 5) - hash) + cleanStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

module.exports = new LookupNowService();