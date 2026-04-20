const phoneService = require('./server/services/phoneService');

// Test different numbers
const testNumbers = ['01712345678', '01812345678', '01912345678', '+8801712345678'];

testNumbers.forEach(num => {
  console.log(`\nTesting: ${num}`);
  const result = phoneService.validateAndParse(num);
  if (result.isValid) {
    console.log(`  ✅ Carrier: ${result.carrier}`);
    console.log(`  ✅ Location: ${result.location}`);
    console.log(`  ✅ Formatted: ${result.formattedNumber}`);
  } else {
    console.log(`  ❌ Error: ${result.error}`);
  }
});