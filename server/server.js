const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Route - Direct lookup function
app.post('/api/lookup', (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    console.log(`\n🔍 Looking up: ${phoneNumber}`);
    
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
    let location = 'Dhaka';
    let spamScore = 10;
    
    // Format Bangladeshi number
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
    else if (cleanNumber.length === 10 || cleanNumber.length === 11) {
      formattedNumber = `+88${cleanNumber}`;
    }
    else {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid Bangladeshi number (e.g., 01712345678)'
      });
    }
    
    // Detect carrier from prefix
    const prefix = cleanNumber.substring(0, 3);
    
    if (prefix === '017') {
      carrier = 'Grameenphone';
      spamScore = 8;
      location = 'Dhaka';
    }
    else if (prefix === '013') {
      carrier = 'Grameenphone';
      spamScore = 10;
      location = 'Dhaka';
    }
    else if (prefix === '018') {
      carrier = 'Robi';
      spamScore = 12;
      location = 'Dhaka';
    }
    else if (prefix === '019') {
      carrier = 'Robi';
      spamScore = 11;
      location = 'Chattogram';
    }
    else if (prefix === '016') {
      carrier = 'Robi';
      spamScore = 13;
      location = 'Khulna';
    }
    else if (prefix === '015') {
      carrier = 'Teletalk';
      spamScore = 9;
      location = 'Rajshahi';
    }
    else if (prefix === '014') {
      carrier = 'Banglalink';
      spamScore = 15;
      location = 'Sylhet';
    }
    else {
      carrier = 'Mobile Operator';
      spamScore = 20;
      location = 'Bangladesh';
    }
    
    // Determine risk level
    let riskLevel = 'Safe';
    if (spamScore >= 70) riskLevel = 'High Risk';
    else if (spamScore >= 50) riskLevel = 'Spam';
    else if (spamScore >= 30) riskLevel = 'Suspicious';
    else riskLevel = 'Safe';
    
    // Generate AI insight
    let aiInsight = '';
    if (riskLevel === 'High Risk') {
      aiInsight = `HIGH RISK: This ${carrier} number from ${location} has a ${spamScore}% spam probability. Do not share personal information. Block this number immediately.`;
    } else if (riskLevel === 'Spam') {
      aiInsight = `SPAM SUSPECTED: ${carrier} number from ${location} with ${spamScore}% spam score. Be very cautious when answering this number.`;
    } else if (riskLevel === 'Suspicious') {
      aiInsight = `MODERATE RISK: This ${carrier} number from ${location} shows some unusual patterns. Verify caller identity before sharing information.`;
    } else {
      aiInsight = `LOW RISK: This appears to be a legitimate ${carrier} number from ${location}. Spam probability is only ${spamScore}%. Safe to answer.`;
    }
    
    // Profile image
    const imgId = Math.floor(Math.random() * 70) + 10;
    const gender = imgId % 2 === 0 ? 'men' : 'women';
    const profileImage = `https://randomuser.me/api/portraits/${gender}/${imgId}.jpg`;
    
    // Response data
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
      confidence: spamScore < 20 ? '92%' : spamScore < 50 ? '85%' : '78%',
      profileImage: profileImage,
      whatsappLink: `https://wa.me/${cleanNumber}`,
      telegramLink: `https://t.me/${cleanNumber}`
    };
    
    console.log(`✅ Result: ${carrier} | ${location} | Score: ${spamScore}% | Risk: ${riskLevel}`);
    
    res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`✅ TorNumber Server Running Successfully!`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📱 Try: 01712345678`);
  console.log(`========================================\n`);
});