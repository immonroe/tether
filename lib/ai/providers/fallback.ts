import { AIProvider, ChatMessage, AIResponse, AIOptions } from '../types';

export class FallbackProvider implements AIProvider {
  name = 'fallback';
  
  async isAvailable(): Promise<boolean> {
    return true; // Fallback is always available
  }

  async generateResponse(messages: ChatMessage[], options: AIOptions = {}): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage?.content || '';

    // Simple rule-based responses for common educational queries
    const response = this.generateFallbackResponse(userMessage);

    return {
      content: response,
      provider: this.name,
      timestamp: new Date().toISOString(),
    };
  }

  private generateFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    // Math-related responses
    if (message.includes('pi') || message.includes('π')) {
      return `Great question about π (pi)! Pi is one of the most fascinating numbers in mathematics. Here's what makes it special:

**What is π?**
- Pi is the ratio of a circle's circumference to its diameter
- It's approximately 3.14159... and goes on forever without repeating
- It appears in many mathematical formulas beyond just circles

**Why is it important?**
- Essential for calculating areas and circumferences of circles
- Used in trigonometry, calculus, and advanced mathematics
- Appears in physics, engineering, and even probability

**Fun facts:**
- Pi Day is celebrated on March 14th (3/14)
- The first 50 digits are: 3.14159265358979323846264338327950288419716939937510
- It's an irrational number, meaning it can't be expressed as a simple fraction

Would you like me to show you how to calculate π or explain how it's used in specific formulas?`;
    }

    if (message.includes('calculus') || message.includes('derivative')) {
      return `I'd be happy to help with calculus! Derivatives represent the rate of change of a function. The basic concept is finding the slope of a tangent line to a curve at any point. 

For example, if you have f(x) = x², the derivative f'(x) = 2x tells you the slope at any point x.

Would you like me to explain a specific derivative rule or work through an example problem?`;
    }

    if (message.includes('algebra') || message.includes('equation')) {
      return `Algebra is about solving for unknown variables in equations. The key is to perform the same operations on both sides to isolate the variable.

For example, if you have 2x + 5 = 13:
- Subtract 5 from both sides: 2x = 8
- Divide both sides by 2: x = 4

What specific algebraic concept would you like help with?`;
    }

    if (message.includes('physics') || message.includes('force') || message.includes('motion')) {
      return `Physics helps us understand how the world works! The fundamental concepts include:
- Force: A push or pull that causes acceleration (F = ma)
- Motion: Described by position, velocity, and acceleration
- Energy: The ability to do work

What specific physics topic are you studying? I can help explain concepts or work through problems.`;
    }

    if (message.includes('chemistry') || message.includes('molecule') || message.includes('atom')) {
      return `Chemistry is the study of matter and its interactions! Key concepts include:
- Atoms: The basic building blocks of matter
- Molecules: Combinations of atoms bonded together
- Chemical reactions: How substances change and interact

Are you working on a specific chemistry concept or problem?`;
    }

    if (message.includes('biology') || message.includes('cell') || message.includes('dna')) {
      return `Biology explores living organisms and life processes! Important areas include:
- Cell biology: The basic unit of life
- Genetics: How traits are inherited
- Evolution: How species change over time
- Ecology: How organisms interact with their environment

What aspect of biology would you like to explore?`;
    }

    if (message.includes('history') || message.includes('historical')) {
      return `History helps us understand how past events shape our world today! When studying history, consider:
- Chronology: When events happened
- Cause and effect: Why events occurred
- Multiple perspectives: Different viewpoints on the same events
- Primary sources: Firsthand accounts from the time period

What historical period or event are you studying?`;
    }

    if (message.includes('english') || message.includes('literature') || message.includes('writing')) {
      return `English and literature develop critical thinking and communication skills! Key areas include:
- Reading comprehension: Understanding and analyzing texts
- Writing: Expressing ideas clearly and persuasively
- Literary analysis: Examining themes, characters, and techniques
- Grammar and vocabulary: Building strong communication skills

What specific aspect of English would you like help with?`;
    }

    // Science topics
    if (message.includes('physics') || message.includes('force') || message.includes('motion')) {
      return `Physics is fascinating! It helps us understand how the world works. Here are some key concepts:

**Newton's Laws of Motion:**
1. An object at rest stays at rest, an object in motion stays in motion (unless acted upon by a force)
2. Force = mass × acceleration (F = ma)
3. For every action, there's an equal and opposite reaction

**Energy and Work:**
- Kinetic energy: energy of motion (½mv²)
- Potential energy: stored energy (mgh for gravitational)
- Work = force × distance

What specific physics concept would you like to explore? I can explain mechanics, thermodynamics, waves, or any other area!`;
    }

    if (message.includes('chemistry') || message.includes('molecule') || message.includes('atom')) {
      return `Chemistry is the study of matter and its interactions! Here's a foundation:

**Atoms and Elements:**
- Atoms are the basic building blocks of matter
- Elements are pure substances made of one type of atom
- The periodic table organizes elements by atomic number

**Chemical Bonds:**
- Ionic bonds: electrons are transferred (like NaCl)
- Covalent bonds: electrons are shared (like H₂O)
- Metallic bonds: electrons are delocalized

**Chemical Reactions:**
- Reactants → Products
- Conservation of mass: atoms are never created or destroyed
- Energy changes: exothermic (releases heat) vs endothermic (absorbs heat)

What aspect of chemistry interests you most?`;
    }

    if (message.includes('biology') || message.includes('cell') || message.includes('dna')) {
      return `Biology explores life at all levels! Here's an overview:

**Cell Biology:**
- All living things are made of cells
- Prokaryotic cells (bacteria) vs Eukaryotic cells (plants, animals)
- Cell organelles: nucleus, mitochondria, chloroplasts, etc.

**Genetics:**
- DNA contains genetic information
- Genes code for proteins
- Inheritance follows patterns (Mendelian genetics)

**Evolution:**
- Natural selection drives adaptation
- Species change over time
- Common ancestry explains diversity

**Ecology:**
- How organisms interact with their environment
- Food webs and energy flow
- Ecosystems and biodiversity

What biological topic would you like to dive into?`;
    }

    // General learning advice
    if (message.includes('study') || message.includes('learn') || message.includes('help')) {
      return `I'm here to help you learn! Here are some effective study strategies:

1. **Active recall**: Test yourself instead of just re-reading
2. **Spaced repetition**: Review material at increasing intervals
3. **Elaboration**: Explain concepts in your own words
4. **Interleaving**: Mix different topics during study sessions
5. **Practice testing**: Use quizzes and practice problems

What subject or topic would you like to focus on? I can provide more specific guidance!`;
    }

    // Flashcard-specific responses
    if (message.includes('flashcard') || message.includes('card') || message.includes('study')) {
      return `I can help you create effective flashcards! Here are some strategies:

**Creating Good Flashcards:**
- Front: Ask a clear, specific question
- Back: Provide a concise, accurate answer
- Use active recall (test yourself without looking)
- Keep cards simple and focused

**Study Techniques:**
- Spaced repetition: Review cards at increasing intervals
- Mix different topics in one session
- Test yourself regularly
- Focus on cards you find difficult

**Example Flashcard Topics:**
- Math: Formulas, definitions, problem-solving steps
- Science: Key concepts, processes, terminology
- History: Dates, events, important figures
- Languages: Vocabulary, grammar rules, translations

What subject would you like to create flashcards for? I can suggest specific questions and answers!`;
    }

    // Default response - more engaging
    return `I'm here to help you learn! I can assist with a wide range of topics:

**Mathematics**: Algebra, calculus, geometry, statistics, trigonometry
**Sciences**: Physics, chemistry, biology, earth science, astronomy
**Languages**: Grammar, literature, writing, reading comprehension
**History**: World history, specific time periods, historical analysis
**Study Skills**: Test preparation, note-taking, time management
**Flashcards**: Creating effective study cards, spaced repetition, active recall

What would you like to explore? Feel free to ask specific questions about any subject - I'm here to help you understand and learn!`;
  }
}
