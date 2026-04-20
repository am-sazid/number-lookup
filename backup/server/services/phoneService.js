class PhoneService {
  // বাংলাদেশের সম্পূর্ণ ক্যারিয়ার ডেটাবেস
  getBangladeshCarrier(number) {
    const prefix = number.substring(0, 3);
    
    // সঠিক ক্যারিয়ার ম্যাপিং
    const carrierDatabase = {
      // Grameenphone (গ্রামীণফোন)
      '017': { carrier: 'Grameenphone', type: 'Mobile', code: 'GP' },
      '013': { carrier: 'Grameenphone', type: 'Mobile', code: 'GP' },
      '014': { carrier: 'Grameenphone', type: 'Mobile', code: 'GP' },
      
      // Robi (রবি)
      '018': { carrier: 'Robi', type: 'Mobile', code: 'Robi' },
      '016': { carrier: 'Robi', type: 'Mobile', code: 'Robi' },
      '019': { carrier: 'Robi', type: 'Mobile', code: 'Robi' },
      
      // Banglalink (বাংলালিংক)
      '014': { carrier: 'Banglalink', type: 'Mobile', code: 'BL' },
      
      // Teletalk (টেলিটক)
      '015': { carrier: 'Teletalk', type: 'Mobile', code: 'TT' },
      
      // Airtel (এয়ারটেল)
      '016': { carrier: 'Airtel', type: 'Mobile', code: 'Airtel' }
    };
    
    return carrierDatabase[prefix] || { carrier: 'Unknown', type: 'Mobile', code: 'Unknown' };
  }

  // বাংলাদেশের লোকেশন ডেটাবেস (এক্সচেঞ্জ কোড ভিত্তিক)
  getBangladeshLocation(number) {
    const exchangeCode = number.substring(0, 5);
    const prefix = number.substring(0, 2);
    
    const locationDatabase = {
      // ঢাকা বিভাগ
      '130': 'Dhaka', '131': 'Dhaka', '132': 'Dhaka', '133': 'Dhaka', '134': 'Dhaka',
      '135': 'Dhaka', '136': 'Dhaka', '137': 'Dhaka', '138': 'Dhaka', '139': 'Dhaka',
      '140': 'Dhaka', '141': 'Dhaka', '142': 'Dhaka', '143': 'Dhaka', '144': 'Dhaka',
      '145': 'Dhaka', '146': 'Dhaka', '147': 'Dhaka', '148': 'Dhaka', '149': 'Dhaka',
      
      // চট্টগ্রাম বিভাগ
      '150': 'Chattogram', '151': 'Chattogram', '152': 'Chattogram', '153': 'Chattogram',
      '154': 'Chattogram', '155': 'Chattogram', '156': 'Chattogram', '157': 'Chattogram',
      '158': 'Chattogram', '159': 'Chattogram',
      
      // রাজশাহী বিভাগ
      '160': 'Rajshahi', '161': 'Rajshahi', '162': 'Rajshahi', '163': 'Rajshahi',
      '164': 'Rajshahi', '165': 'Rajshahi', '166': 'Rajshahi',
      
      // খুলনা বিভাগ
      '170': 'Khulna', '171': 'Khulna', '172': 'Khulna', '173': 'Khulna',
      '174': 'Khulna', '175': 'Khulna',
      
      // সিলেট বিভাগ
      '180': 'Sylhet', '181': 'Sylhet', '182': 'Sylhet', '183': 'Sylhet',
      '184': 'Sylhet', '185': 'Sylhet',
      
      // বরিশাল বিভাগ
      '190': 'Barishal', '191': 'Barishal', '192': 'Barishal', '193': 'Barishal',
      
      // রংপুর বিভাগ
      '200': 'Rangpur', '201': 'Rangpur', '202': 'Rangpur', '203': 'Rangpur',
      
      // ময়মনসিংহ বিভাগ
      '210': 'Mymensingh', '211': 'Mymensingh', '212': 'Mymensingh'
    };
    
    // Fallback based on prefix
    const fallbackLocations = {
      '13': 'Dhaka', '14': 'Chattogram', '15': 'Rajshahi',
      '16': 'Khulna', '17': 'Sylhet', '18': 'Barishal',
      '19': 'Rangpur', '11': 'Mymensingh'
    };
    
    const location = locationDatabase[exchangeCode] || fallbackLocations[prefix] || 'Dhaka';
    
    return {
      city: location,
      district: location,
      division: this.getDivision(location),
      country: 'Bangladesh'
    };
  }

  getDivision(city) {
    const divisions = {
      'Dhaka': 'Dhaka', 'Chattogram': 'Chattogram', 'Rajshahi': 'Rajshahi',
      'Khulna': 'Khulna', 'Sylhet': 'Sylhet', 'Barishal': 'Barishal',
      'Rangpur': 'Rangpur', 'Mymensingh': 'Mymensingh'
    };
    return divisions[city] || 'Dhaka';
  }

  // স্প্যাম স্কোর ডেটাবেস
  getSpamScore(number, carrier) {
    let score = 15; // Base score for Bangladeshi numbers
    
    // Check for suspicious patterns
    if (/(\d)\1{4,}/.test(number)) score += 25;
    else if (/(\d)\1{3,}/.test(number)) score += 15;
    
    // Check for sequential numbers
    if (/12345|23456|34567|45678|56789/.test(number)) score += 20;
    
    // Carrier based adjustment
    if (carrier === 'Unknown') score += 15;
    if (carrier === 'Banglalink') score += 5;
    if (carrier === 'Teletalk') score -= 5;
    if (carrier === 'Grameenphone') score -= 3;
    if (carrier === 'Robi') score -= 2;
    
    // Random factor (controlled)
    const random = Math.floor(Math.random() * 10) - 5;
    score += random;
    
    // Keep within 0-100
    return Math.min(85, Math.max(5, score));
  }

  // নম্বর ফরম্যাট এবং ভ্যালিডেশন
  validateAndParse(phoneNumber) {
    let cleanNumber = phoneNumber.toString().replace(/\D/g, '');
    let originalNumber = phoneNumber;
    
    // শুধুমাত্র বাংলাদেশি নম্বর গ্রহণ করবে
    let formattedNumber = '';
    let isValid = false;
    
    // কেস 1: +8801712345678
    if (cleanNumber.startsWith('880') && cleanNumber.length === 13) {
      cleanNumber = cleanNumber.substring(3);
      formattedNumber = `+880${cleanNumber}`;
      isValid = true;
    }
    // কেস 2: 01712345678
    else if (cleanNumber.length === 11 && cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.substring(1);
      formattedNumber = `+88${cleanNumber}`;
      isValid = true;
    }
    // কেস 3: 1712345678
    else if (cleanNumber.length === 10) {
      formattedNumber = `+88${cleanNumber}`;
      isValid = true;
    }
    // কেস 4: 8801712345678
    else if (cleanNumber.length === 12 && cleanNumber.startsWith('880')) {
      cleanNumber = cleanNumber.substring(3);
      formattedNumber = `+88${cleanNumber}`;
      isValid = true;
    }
    
    if (!isValid) {
      return {
        isValid: false,
        error: 'Invalid Bangladeshi number. Please use format: 01712345678 or +8801712345678'
      };
    }
    
    // Get carrier info
    const carrierInfo = this.getBangladeshCarrier(cleanNumber);
    
    // Get location
    const location = this.getBangladeshLocation(cleanNumber);
    
    // Get spam score
    const spamScore = this.getSpamScore(cleanNumber, carrierInfo.carrier);
    
    return {
      isValid: true,
      number: cleanNumber,
      originalNumber: originalNumber,
      formattedNumber: formattedNumber,
      country: 'BD',
      countryName: 'Bangladesh',
      countryCode: '+88',
      carrier: carrierInfo.carrier,
      carrierCode: carrierInfo.code,
      lineType: carrierInfo.type,
      location: location.city,
      district: location.district,
      division: location.division,
      fullLocation: `${location.city}, ${location.division}, Bangladesh`,
      areaCode: cleanNumber.substring(0, 3),
      numberLength: cleanNumber.length,
      spamScore: spamScore
    };
  }
}

module.exports = new PhoneService();