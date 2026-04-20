const phoneService = require('../services/phoneService');
const aiSimulationService = require('../services/aiSimulationService');

// Try to load database models (optional)
let Search = null;
let SpamReport = null;
try {
  Search = require('../../database/models/Search');
  SpamReport = require('../../database/models/SpamReport');
} catch (error) {
  console.log('⚠️ Database models not available, running without persistent storage');
}

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
      
      console.log(`🔍 Looking up number: ${phoneNumber}`);
      
      // Validate with auto-country detection
      const validation = await phoneService.validateAndParse(phoneNumber);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error
        });
      }
      
      console.log(`✅ Validated: ${validation.formattedInternational} (${validation.country})`);
      
      // Generate AI intelligence
      const aiData = await aiSimulationService.generateIntelligence(validation);
      
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
        spamReports: 0,
        searchCount: 1,
        lastSearched: new Date()
      };
      
      // Try to save to database if available
      if (Search) {
        try {
          let existingData = await Search.findOne({ normalizedNumber: validation.formattedInternational });
          if (existingData) {
            existingData.searchCount += 1;
            existingData.lastSearched = new Date();
            await existingData.save();
            responseData.spamReports = existingData.spamReports;
            responseData.searchCount = existingData.searchCount;
          } else {
            const searchRecord = new Search({
              phoneNumber: validation.number,
              normalizedNumber: validation.formattedInternational,
              country: validation.country,
              countryName: validation.countryName,
              carrier: validation.carrier,
              lineType: validation.lineType,
              fakeName: aiData.fakeName,
              spamScore: aiData.spamScore,
              riskLevel: aiData.riskLevel,
              aiInsight: aiData.aiInsight
            });
            await searchRecord.save();
          }
        } catch (dbError) {
          console.log('⚠️ Could not save to database:', dbError.message);
        }
      }
      
      res.json({
        success: true,
        data: responseData,
        cached: false
      });
      
    } catch (error) {
      console.error('Lookup error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error: ' + error.message
      });
    }
  }
  
  async reportSpam(req, res) {
    try {
      const { phoneNumber, reason } = req.body;
      
      const validation = await phoneService.validateAndParse(phoneNumber);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid phone number'
        });
      }
      
      // Save spam report if database is available
      if (SpamReport) {
        try {
          const report = new SpamReport({
            phoneNumber: validation.number,
            normalizedNumber: validation.formattedInternational,
            reportedBy: 'anonymous',
            reason: reason || 'Spam',
            ipAddress: req.ip
          });
          await report.save();
        } catch (dbError) {
          console.log('⚠️ Could not save spam report:', dbError.message);
        }
      }
      
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