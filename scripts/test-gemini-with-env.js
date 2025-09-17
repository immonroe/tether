// Test script for Gemini integration with proper env loading
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiIntegration() {
  console.log('🤖 Testing Gemini Integration...\n');
  
  // Check if API key is provided
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No Gemini API key found in .env.local');
    console.log('Please make sure GEMINI_API_KEY is set in your .env.local file');
    console.log('Get your free API key at: https://aistudio.google.com/app/apikey');
    return;
  }
  
  console.log('✅ Gemini API key found');
  console.log(`Key starts with: ${apiKey.substring(0, 10)}...`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    console.log('🧪 Testing basic generation...');
    
    const result = await model.generateContent('Explain photosynthesis in one sentence.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Basic generation successful!');
    console.log(`Response: ${text}\n`);
    
    // Test structured output
    console.log('🧪 Testing structured output...');
    
    const structuredResult = await model.generateContent(`
Generate a JSON object with this structure:
{
  "topic": "photosynthesis",
  "difficulty": "medium",
  "keyPoints": ["point1", "point2", "point3"]
}

Make it about photosynthesis.
    `);
    
    const structuredResponse = await structuredResult.response;
    const structuredText = structuredResponse.text();
    
    console.log('✅ Structured output successful!');
    console.log(`Response: ${structuredText}\n`);
    
    // Test different models
    console.log('🧪 Testing different models...');
    
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
    
    for (const modelName of models) {
      try {
        const testModel = genAI.getGenerativeModel({ model: modelName });
        const testResult = await testModel.generateContent('Say "Hello from ' + modelName + '"');
        const testResponse = await testResult.response;
        const testText = testResponse.text();
        
        console.log(`✅ ${modelName}: ${testText}`);
      } catch (error) {
        console.log(`❌ ${modelName}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Gemini integration test completed successfully!');
    console.log('Your Tether app is ready to use Gemini AI!');
    
  } catch (error) {
    console.log(`❌ Gemini test failed: ${error.message}`);
    console.log('Please check your API key and try again.');
  }
}

// Run the test
testGeminiIntegration().catch(console.error);
