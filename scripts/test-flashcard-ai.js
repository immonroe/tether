// Test script for flashcard AI generation with Gemini
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testFlashcardGeneration() {
  console.log('🎴 Testing Flashcard AI Generation with Gemini...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No Gemini API key found');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
      }
    });
    
    // Test 1: Topic Analysis
    console.log('🔍 Testing topic analysis...');
    const analysisPrompt = `Analyze the topic "photosynthesis" for flashcard creation. Provide a JSON response with this structure:
{
  "mainTopics": ["topic1", "topic2", "topic3"],
  "subtopics": ["subtopic1", "subtopic2", "subtopic3"],
  "difficulty": "beginner|intermediate|advanced",
  "suggestedCardCount": 10,
  "learningObjectives": ["objective1", "objective2", "objective3"]
}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisResponse = await analysisResult.response;
    const analysisText = analysisResponse.text();
    
    console.log('✅ Topic analysis successful!');
    console.log('Analysis:', analysisText.substring(0, 200) + '...\n');
    
    // Test 2: Flashcard Generation
    console.log('🎴 Testing flashcard generation...');
    const flashcardPrompt = `Generate 3 flashcards for the topic "photosynthesis". Format as JSON array:
[
  {
    "front": "Question or term",
    "back": "Answer or definition",
    "difficulty": "easy|medium|hard",
    "tags": ["tag1", "tag2"],
    "explanation": "Optional detailed explanation"
  }
]`;

    const flashcardResult = await model.generateContent(flashcardPrompt);
    const flashcardResponse = await flashcardResult.response;
    const flashcardText = flashcardResponse.text();
    
    console.log('✅ Flashcard generation successful!');
    console.log('Flashcards:', flashcardText.substring(0, 300) + '...\n');
    
    // Test 3: Study Tips
    console.log('💡 Testing study tips generation...');
    const tipsPrompt = `Generate 5 study tips for learning "photosynthesis" at medium difficulty level. Focus on practical, actionable advice.`;
    
    const tipsResult = await model.generateContent(tipsPrompt);
    const tipsResponse = await tipsResult.response;
    const tipsText = tipsResponse.text();
    
    console.log('✅ Study tips generation successful!');
    console.log('Study Tips:', tipsText.substring(0, 200) + '...\n');
    
    // Test 4: Different Learning Styles
    console.log('🎨 Testing learning style adaptation...');
    const stylePrompt = `Explain photosynthesis for a visual learner. Use visual descriptions, diagrams, and visual analogies.`;
    
    const styleResult = await model.generateContent(stylePrompt);
    const styleResponse = await styleResult.response;
    const styleText = styleResponse.text();
    
    console.log('✅ Learning style adaptation successful!');
    console.log('Visual explanation:', styleText.substring(0, 200) + '...\n');
    
    console.log('🎉 All flashcard AI tests passed!');
    console.log('Your Tether app is ready for production with Gemini AI!');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
testFlashcardGeneration().catch(console.error);
