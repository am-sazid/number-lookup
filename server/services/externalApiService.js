const axios = require('axios');

class ExternalApiService {
  async lookupWithNumverify(phoneNumber, countryCode = null) {
    const apiKey = process.env.NUMVERIFY_API_KEY;
    if (!apiKey) {
      console.log('Numverify API key not configured, using fallback');
      return null;
    }
    
    try {
      let url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(phoneNumber)}`;
      if (countryCode) {
        url += `&country_code=${countryCode}`;
      }
      
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data && response.data.valid) {
        return {
          valid: response.data.valid,
          number: response.data.number,
          localFormat: response.data.local_format,
          internationalFormat: response.data.international_format,
          countryCode: response.data.country_code,
          countryName: response.data.country_name,
          location: response.data.location,
          carrier: response.data.carrier,
          lineType: response.data.line_type
        };
      }
      return null;
    } catch (error) {
      console.error('Numverify API error:', error.message);
      return null;
    }
  }

  async getIPGeolocation(ip) {
    const apiKey = process.env.IPGEOLOCATION_API_KEY;
    if (!apiKey) return null;
    
    try {
      const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`, {
        timeout: 5000
      });
      
      return {
        country: response.data.country_name,
        countryCode: response.data.country_code2,
        city: response.data.city,
        region: response.data.state_prov,
        zip: response.data.zipcode,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.time_zone?.name,
        isp: response.data.isp
      };
    } catch (error) {
      console.error('IP Geolocation error:', error.message);
      return null;
    }
  }
}

module.exports = new ExternalApiService();