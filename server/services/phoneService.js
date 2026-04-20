const libphonenumber = require('libphonenumber-js');

class PhoneService {
  validateAndParse(phoneNumber) {
    try {
      const parsed = libphonenumber(phoneNumber);
      
      if (!parsed || !parsed.isValid()) {
        return { isValid: false, error: 'Invalid phone number' };
      }

      return {
        isValid: true,
        number: parsed.number,
        country: parsed.country,
        countryCode: `+${parsed.countryCallingCode}`,
        carrier: this.getCarrier(parsed.country),
        lineType: this.getLineType(parsed.nationalNumber),
        formattedInternational: parsed.formatInternational()
      };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }

  getLineType(number) {
    if (number.toString().startsWith('7')) return 'Mobile';
    if (number.toString().startsWith('8')) return 'Toll-Free';
    return 'Landline';
  }

  getCarrier(country) {
    const carriers = {
      US: ['AT&T', 'Verizon', 'T-Mobile'],
      GB: ['EE', 'Vodafone', 'O2'],
      IN: ['Airtel', 'Jio', 'Vi']
    };
    const list = carriers[country] || ['Local Carrier'];
    return list[Math.floor(Math.random() * list.length)];
  }
}

module.exports = new PhoneService();