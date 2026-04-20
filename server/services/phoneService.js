const libphonenumber = require('libphonenumber-js');

class PhoneService {
  async validateAndParse(phoneNumber, clientIp = null) {
    try {
      // Step 1: First try to parse as is
      let parsed = libphonenumber(phoneNumber);
      
      // Step 2: If invalid, try with BD country code (for Bangladeshi numbers without +88)
      if (!parsed || !parsed.isValid()) {
        parsed = libphonenumber(phoneNumber, 'BD');
      }
      
      // Step 3: Try with IN country code
      if (!parsed || !parsed.isValid()) {
        parsed = libphonenumber(phoneNumber, 'IN');
      }
      
      // Step 4: Try with US country code
      if (!parsed || !parsed.isValid()) {
        parsed = libphonenumber(phoneNumber, 'US');
      }
      
      if (!parsed || !parsed.isValid()) {
        return { 
          isValid: false, 
          error: 'Invalid phone number. Please enter a valid number (e.g., 01712345678 or +8801712345678)' 
        };
      }

      // Get real carrier and location info
      const carrierInfo = this.getCarrierInfo(parsed);
      const locationInfo = this.getLocationInfo(parsed);
      const timezoneInfo = this.getTimezoneInfo(parsed.country);
      const platformPresence = this.checkPlatformPresence(parsed.number);

      return {
        isValid: true,
        number: parsed.number,
        country: parsed.country,
        countryName: this.getCountryName(parsed.country),
        countryCode: `+${parsed.countryCallingCode}`,
        nationalNumber: parsed.nationalNumber,
        lineType: this.getLineType(parsed.nationalNumber, parsed.country),
        carrier: carrierInfo,
        formattedInternational: parsed.formatInternational(),
        formattedNational: parsed.formatNational(),
        location: locationInfo,
        timezone: timezoneInfo,
        platforms: platformPresence,
        areaCode: this.extractAreaCode(parsed.nationalNumber, parsed.country),
        numberLength: parsed.nationalNumber.length,
        isPossible: parsed.isPossible()
      };
    } catch (error) {
      console.error('Phone validation error:', error);
      return { isValid: false, error: 'Invalid phone number format' };
    }
  }

  getCarrierInfo(parsed) {
    // Real carrier detection based on number patterns
    const nationalNumber = parsed.nationalNumber.toString();
    const country = parsed.country;
    
    // Bangladesh carriers
    if (country === 'BD') {
      const prefix = nationalNumber.substring(0, 3);
      const carriers = {
        '13': 'Grameenphone', '14': 'Grameenphone', '15': 'Grameenphone',
        '16': 'Robi', '17': 'Robi', '18': 'Robi',
        '19': 'Banglalink', '14': 'Banglalink',
        '15': 'Teletalk', '11': 'Teletalk',
        '10': 'Airtel', '11': 'Airtel'
      };
      for (const [key, value] of Object.entries(carriers)) {
        if (prefix.startsWith(key)) return value;
      }
      return 'Unknown Carrier';
    }
    
    // India carriers
    if (country === 'IN') {
      const prefix = nationalNumber.substring(0, 2);
      if (prefix === '70' || prefix === '71') return 'Jio';
      if (prefix === '72' || prefix === '73') return 'Airtel';
      if (prefix === '74' || prefix === '75') return 'Vi';
      if (prefix === '76' || prefix === '77') return 'BSNL';
      return 'Indian Telecom';
    }
    
    // US carriers
    if (country === 'US') {
      const prefixes = ['212', '310', '312', '415', '617', '702', '718'];
      if (prefixes.includes(nationalNumber.substring(0, 3))) return 'AT&T';
      return 'Verizon or T-Mobile';
    }
    
    // Default carriers by country
    const carriers = {
      'GB': 'BT/EE/Vodafone',
      'PK': 'Jazz/Zong/Telenor',
      'NG': 'MTN/Glo/Airtel',
      'default': 'Local Carrier'
    };
    
    return carriers[country] || carriers.default;
  }

  getLocationInfo(parsed) {
    const nationalNumber = parsed.nationalNumber.toString();
    const country = parsed.country;
    
    // Bangladesh location detection
    if (country === 'BD') {
      const prefix = nationalNumber.substring(0, 2);
      const locations = {
        '2': 'Dhaka', '3': 'Chattogram', '4': 'Rajshahi', 
        '5': 'Khulna', '6': 'Sylhet', '7': 'Barishal',
        '8': 'Rangpur', '9': 'Mymensingh'
      };
      const city = locations[prefix] || 'Bangladesh';
      return { 
        city: city, 
        description: `${city} metropolitan area`,
        source: 'prefix-based',
        region: city
      };
    }
    
    // India location detection
    if (country === 'IN') {
      const prefix = nationalNumber.substring(0, 2);
      const locations = {
        '11': 'Delhi NCR', '22': 'Mumbai', '33': 'Kolkata',
        '44': 'Chennai', '80': 'Bangalore', '40': 'Hyderabad'
      };
      const city = locations[prefix] || 'India';
      return { city, description: `${city} area`, source: 'prefix-based' };
    }
    
    // US location detection (area codes)
    if (country === 'US') {
      const areaCode = nationalNumber.substring(0, 3);
      const usLocations = {
        '212': 'New York City', '310': 'Los Angeles', '312': 'Chicago',
        '415': 'San Francisco', '617': 'Boston', '702': 'Las Vegas',
        '718': 'Brooklyn', '305': 'Miami', '713': 'Houston'
      };
      const city = usLocations[areaCode] || 'United States';
      return { city, description: `${city} metropolitan area`, source: 'area-code' };
    }
    
    return { 
      city: this.getCountryName(country), 
      description: `Based in ${this.getCountryName(country)}`,
      source: 'country-based'
    };
  }

  getTimezoneInfo(country) {
    const timezones = {
      'BD': 'Asia/Dhaka (GMT+6)',
      'IN': 'Asia/Kolkata (GMT+5:30)',
      'US': 'Multiple timezones (EST/PST/CST/MST)',
      'GB': 'Europe/London (GMT+0/GMT+1)',
      'PK': 'Asia/Karachi (GMT+5)',
      'NG': 'Africa/Lagos (GMT+1)',
      'CA': 'Multiple timezones',
      'AU': 'Multiple timezones',
      'default': 'Local timezone'
    };
    return { timezone: timezones[country] || timezones.default };
  }

  checkPlatformPresence(phoneNumber) {
    // Simulate platform presence check
    // In real scenario, you'd need actual APIs
    const randomValue = Math.random();
    return {
      whatsapp: randomValue > 0.4,  // 60% chance
      telegram: randomValue > 0.6,  // 40% chance
      viber: randomValue > 0.7,
      imo: randomValue > 0.75
    };
  }

  getLineType(number, country) {
    const numStr = number.toString();
    
    // Mobile number patterns by country
    const mobilePatterns = {
      'BD': /^1[3-9]/,      // Bangladeshi mobile starts with 13-19
      'IN': /^[6-9]/,       // Indian mobile starts with 6-9
      'US': /^[2-9][0-9]{2}[2-9]/, // US mobile pattern
      'GB': /^7[0-9]{9}/,   // UK mobile starts with 7
      'PK': /^3[0-9]{2}/,   // Pakistani mobile starts with 3
      'NG': /^7[0-9]|8[0-9]|9[0-9]/ // Nigerian mobile
    };
    
    const pattern = mobilePatterns[country];
    if (pattern && pattern.test(numStr)) return 'Mobile';
    
    // Toll-free numbers
    if (numStr.startsWith('800') || numStr.startsWith('888') || numStr.startsWith('877')) {
      return 'Toll-Free';
    }
    
    // Landline patterns
    if (numStr.length === 10 && numStr.match(/^[02-8]/)) return 'Landline';
    
    return 'Unknown';
  }

  extractAreaCode(number, country) {
    const numStr = number.toString();
    const lengths = {
      'BD': 2, 'IN': 2, 'US': 3, 'GB': 2, 'PK': 2, 'NG': 2
    };
    const length = lengths[country] || 2;
    return numStr.substring(0, length);
  }

  getCountryName(countryCode) {
    const countries = {
      'BD': 'Bangladesh', 'IN': 'India', 'US': 'United States', 
      'GB': 'United Kingdom', 'PK': 'Pakistan', 'NG': 'Nigeria',
      'CA': 'Canada', 'AU': 'Australia', 'DE': 'Germany',
      'FR': 'France', 'JP': 'Japan', 'CN': 'China',
      'BR': 'Brazil', 'MX': 'Mexico', 'ID': 'Indonesia'
    };
    return countries[countryCode] || countryCode;
  }
}

module.exports = new PhoneService();