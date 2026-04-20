const phoneService = require('../services/phoneService');
const aiSimulationService = require('../services/aiSimulationService');
const cacheService = require('../services/cacheService');
const externalApiService = require('../services/externalApiService');
const Search = require('../../database/models/Search');

class NumberController {
  async lookupNumber(req, res) {
    try {
      const { phoneNumber } = req.body;
      const clientIp = req.ip || req.connection.remoteAddress;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required'
        });
      }
      
      // Validate with auto-country detection (WITHOUT requiring +88)
      const validation = await phoneService.validateAndParse(phoneNumber, clientIp);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }
      
      const normalizedNumber = validation.formattedInternational;
      
      // Check cache
      const cacheKey = cacheService.generateKey('number', { number: normalizedNumber });
      let cachedData = cacheService.get(cacheKey);
      
      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true
        });
      }
      
      // Try external API for real data
      let externalData = null;
      if (process.env.NUMVERIFY_API_KEY) {
        externalData = await externalApiService.lookupWithNumverify(
          phoneNumber, 
          validation.country
        );
      }
      
      // Check database for existing data
      let existingData = await Search.findOne({ normalizedNumber });
      
      // Enhance validation with external data if available
      if (externalData) {
        validation.carrier = externalData.carrier || validation.carrier;
        if (externalData.location) {
          validation.location = { city: externalData.location, source: 'numverify' };
        }
      }
      
      // Generate AI intelligence
      const aiData = await aiSimulationService.generateIntelligence(validation, existingData);
      
      // Prepare response data
      const responseData = {
        number: validation.number,
        formattedNumber: validation.formattedInternational,
        nationalFormat: validation.formattedNational,
        country: validation.country,
        countryName: validation.countryName,
        countryCode: validation.countryCode,
        carrier: validation.carrier,
        lineType: validation.lineType,
        fakeName: aiData.fakeName,
        profileImage: aiData.profileImage,
        spamScore: aiData.spamScore,
        riskLevel: aiData.riskLevel,
        aiInsight: aiData.aiInsight,
        confidence: aiData.confidence,
        location: validation.location || { city: 'Unknown', description: 'Location data unavailable' },
        timezone: validation.timezone,
        platforms: validation.platforms,
        areaCode: validation.areaCode,
        numberLength: validation.numberLength,
        analysisMetrics: aiData.analysisMetrics,
        spamReports: existingData?.spamReports || 0,
        searchCount: (existingData?.searchCount || 0) + 1,
        lastSearched: new Date()
      };
      
      // Store in database
      if (existingData) {
        existingData.searchCount += 1;
        existingData.lastSearched = new Date();
        existingData.spamScore = aiData.spamScore;
        existingData.riskLevel = aiData.riskLevel;
        existingData.aiInsight = aiData.aiInsight;
        existingData.location = validation.location;
        existingData.carrier = validation.carrier;
        await existingData.save();
      } else {
        const searchRecord = new Search({
          phoneNumber: validation.number,
          normalizedNumber,
          country: validation.country,
          countryName: validation.countryName,
          countryCode: validation.countryCode,
          carrier: validation.carrier,
          lineType: validation.lineType,
          location: validation.location,
          fakeName: aiData.fakeName,
          spamScore: aiData.spamScore,
          riskLevel: aiData.riskLevel,
          aiInsight: aiData.aiInsight,
          spamReports: 0
        });
        await searchRecord.save();
      }
      
      // Cache the response
      cacheService.set(cacheKey, responseData);
      
      res.json({
        success: true,
        data: responseData,
        cached: false,
        source: externalData ? 'real-api' : 'simulated'
      });
      
    } catch (error) {
      console.error('Lookup error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
  
  async reportSpam(req, res) {
    try {
      const { phoneNumber, reason } = req.body;
      const ipAddress = req.ip;
      
      const validation = await phoneService.validateAndParse(phoneNumber);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number'
        });
      }
      
      const normalizedNumber = validation.formattedInternational;
      const SpamReport = require('../../database/models/SpamReport');
      
      const report = new SpamReport({
        phoneNumber: validation.number,
        normalizedNumber,
        reportedBy: 'anonymous',
        reason: reason || 'Spam',
        ipAddress
      });
      
      await report.save();
      
      // Update search record
      const Search = require('../../database/models/Search');
      const searchRecord = await Search.findOne({ normalizedNumber });
      if (searchRecord) {
        const reportCount = await SpamReport.countDocuments({ normalizedNumber });
        searchRecord.spamReports = reportCount;
        await searchRecord.save();
      }
      
      // Invalidate cache
      const cacheKey = cacheService.generateKey('number', { number: normalizedNumber });
      cacheService.del(cacheKey);
      
      res.json({
        success: true,
        message: 'Thank you for reporting. This helps keep the community safe.'
      });
      
    } catch (error) {
      console.error('Report spam error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process report'
      });
    }
  }
}

module.exports = new NumberController();