// Simple test script to verify AI providers work
const { aiService, flashcardAIService } = require('../lib/ai/service');

async function testAIProviders() {
  console.log('🤖 Testing AI Providers...\n');
  
  // Test 1: Check available providers
  console.log('Available providers:', aiService.getAvailableProviders());
  
  // Test 2: Basic AI response
  try {
    console.log('\n📝 Testing basic AI response...');
    const response = await aiService.generateResponse([
      { role: 'user', content: 'Explain photosynthesis in simple terms' }
    ]);
    console.log(`✅ Success! Provider: ${response.provider}`);
    console.log(`Response: ${response.content.substring(0, 100)}...`);
  } catch (error) {
    console.log(`❌ Basic AI test failed: ${error.message}`);
  }
  
  // Test 3: Flashcard generation
  try {
    console.log('\n🎴 Testing flashcard generation...');
    const flashcards = await flashcardAIService.generateFlashcards({
      topic: 'photosynthesis',
      count: 3,
      difficulty: 'medium'
    });
    console.log(`✅ Generated ${flashcards.length} flashcards`);
    flashcards.forEach((card, i) => {
      console.log(`${i + 1}. ${card.front} → ${card.back}`);
    });
  } catch (error) {
    console.log(`❌ Flashcard generation failed: ${error.message}`);
  }
  
  // Test 4: Topic analysis
  try {
    console.log('\n🔍 Testing topic analysis...');
    const analysis = await flashcardAIService.analyzeTopic('photosynthesis');
    console.log(`✅ Topic analysis successful`);
    console.log(`Main topics: ${analysis.mainTopics.join(', ')}`);
    console.log(`Difficulty: ${analysis.difficulty}`);
    console.log(`Suggested cards: ${analysis.suggestedCardCount}`);
  } catch (error) {
    console.log(`❌ Topic analysis failed: ${error.message}`);
  }
  
  console.log('\n✨ AI testing complete!');
}

// Run the test
testAIProviders().catch(console.error);
