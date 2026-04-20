const phoneService = require('../services/phoneService');
const aiService = require('../services/aiSimulationService');
const cacheService = require('../services/cacheService');
const Search = require('../../database/models/Search');

class NumberController {
  async lookupNumber(req, res) {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          error: 'Phone number is required' 
        });
      }
      
      // Validate phone number
      const validation = phoneService.validateAndParse(phoneNumber);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          error: validation.error 
        });
      }
      
      // Check cache
      const cacheKey = cacheService.generateKey('number', { 
        number: validation.formattedInternational 
      });
      let cachedData = cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json({ 
          success: true, 
          data: cachedData, 
          cached: true 
        });
      }
      
      // Generate AI intelligence
      const aiData = await aiService.generateIntelligence(validation);
      
      // Prepare response
      const responseData = {
        number: validation.number,
        formattedNumber: validation.formattedInternational,
        country: validation.country,
        countryCode: validation.countryCode,
        carrier: validation.carrier,
        lineType: validation.lineType,
        fakeName: aiData.fakeName,
        profileImage: aiData.profileImage,
        spamScore: aiData.spamScore,
        riskLevel: aiData.riskLevel,
        aiInsight: aiData.aiInsight
      };
      
      // Save to database
      const searchRecord = new Search({
        phoneNumber: validation.number,
        normalizedNumber: validation.formattedInternational,
        country: validation.country,
        carrier: validation.carrier,
        lineType: validation.lineType,
        fakeName: aiData.fakeName,
        spamScore: aiData.spamScore,
        riskLevel: aiData.riskLevel,
        aiInsight: aiData.aiInsight
      });
      await searchRecord.save();
      
      // Cache the result
      cacheService.set(cacheKey, responseData);
      
      res.json({ 
        success: true, 
        data: responseData, 
        cached: false 
      });
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  }
}

module.exports = new NumberController();