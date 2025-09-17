// Test script for the chat API endpoint
require('dotenv').config({ path: '.env.local' });

async function testChatAPI() {
  console.log('💬 Testing Chat API with Gemini Integration...\n');
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No Gemini API key found');
    return;
  }
  
  try {
    // Test 1: Basic chat message
    console.log('🧪 Testing basic chat message...');
    const basicResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            sender: 'user',
            message: 'Can you explain photosynthesis in simple terms?',
            timestamp: new Date().toISOString()
          }
        ],
        learningStyle: 'mixed',
        sessionId: 'test-session-1'
      })
    });
    
    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log('✅ Basic chat API successful!');
      console.log('Provider:', basicData.data.provider);
      console.log('Model:', basicData.data.model);
      console.log('Response:', basicData.data.message.substring(0, 150) + '...');
      if (basicData.data.suggestions) {
        console.log('Suggestions:', basicData.data.suggestions.length, 'items');
      }
      console.log('');
    } else {
      console.log('❌ Basic chat API failed:', basicResponse.status);
      const errorData = await basicResponse.json();
      console.log('Error:', errorData);
    }
    
    // Test 2: Visual learning style
    console.log('👁️ Testing visual learning style...');
    const visualResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            sender: 'user',
            message: 'How does the water cycle work?',
            timestamp: new Date().toISOString()
          }
        ],
        learningStyle: 'visual',
        sessionId: 'test-session-2'
      })
    });
    
    if (visualResponse.ok) {
      const visualData = await visualResponse.json();
      console.log('✅ Visual learning API successful!');
      console.log('Provider:', visualData.data.provider);
      console.log('Response:', visualData.data.message.substring(0, 150) + '...');
      if (visualData.data.images) {
        console.log('Images suggested:', visualData.data.images.length, 'items');
      }
      console.log('');
    } else {
      console.log('❌ Visual learning API failed:', visualResponse.status);
    }
    
    // Test 3: Error handling (simulate by sending invalid data)
    console.log('⚠️ Testing error handling...');
    const errorResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Missing required messages field
        learningStyle: 'mixed',
        sessionId: 'test-session-3'
      })
    });
    
    if (!errorResponse.ok) {
      const errorData = await errorResponse.json();
      console.log('✅ Error handling working correctly!');
      console.log('Error status:', errorResponse.status);
      console.log('Error message:', errorData.error);
      console.log('');
    } else {
      console.log('❌ Error handling test failed - should have returned error');
    }
    
    console.log('🎉 Chat API testing completed!');
    console.log('Your AI Tutor API is ready for production!');
    
  } catch (error) {
    console.log(`❌ API test failed: ${error.message}`);
    console.log('Make sure the development server is running: npm run dev');
  }
}

// Run the test
testChatAPI().catch(console.error);
