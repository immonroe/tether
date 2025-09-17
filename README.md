# 🎓 Tether - AI-Powered Learning Platform

**Tether** is an innovative AI-powered learning platform that combines personalized tutoring, mastery learning, spaced repetition, and AI-facilitated study groups. Our mission is to replicate the benefits of one-on-one tutoring (addressing Bloom's 2 Sigma Problem) while incorporating community-based reinforcement learning principles.

## ✨ Key Features

### 🤖 AI Tutor Interface
- **Intelligent Chat System**: Conversational AI tutor that adapts to your learning style
- **Multi-Modal Learning**: Support for text, voice, file uploads, and drawing/whiteboard
- **Personalized Explanations**: Adaptive responses based on your understanding level
- **Subject Agnostic**: Learn any topic with AI-generated tailored learning plans

### 📚 Spaced Repetition System
- **Smart Flashcards**: Create your own flashcards with AI-powered suggestions
- **Anki-Style Algorithm**: SM-2 spaced repetition for optimal long-term retention
- **Performance Tracking**: Detailed analytics on your learning progress
- **Bulk Operations**: Import/export flashcards for efficient study management

### 👥 AI-Moderated Study Groups
- **Smart Matching**: Find study partners based on subject, skill level, and goals
- **Real-Time Collaboration**: Live group chat and collaborative problem-solving
- **AI-Generated Prompts**: Structured discussion topics and exercises
- **Peer Teaching**: Assignments that reinforce learning through teaching others

### 📊 Progress Tracking & Gamification
- **Visual Dashboards**: Charts and analytics showing your learning journey
- **Achievement System**: Badges and rewards for consistent effort and milestones
- **Skill Trees**: Visual learning pathways showing concept mastery
- **Social Features**: Share progress and celebrate achievements with the community

### 🚀 Guest Mode
- **No Barriers**: Access all features immediately without creating an account
- **Seamless Migration**: Easy transition from guest to registered user
- **Data Persistence**: Your progress is saved and synced across sessions

## 🛠️ Tech Stack

- **Frontend**: React 18+ with Next.js 14+ and TypeScript
- **Backend**: Supabase (Database, Authentication, Real-time features)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for lightweight global state
- **AI Integration**: Cost-effective AI APIs with fallback systems
- **Deployment**: Vercel (recommended) or any Next.js-compatible platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tether
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Provider Configuration (Primary: Gemini - Free!)
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   # Optional: Additional AI Providers for Fallback
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations from `supabase/migrations/`
   - Configure Row Level Security (RLS) policies

5. **Set up AI Integration (Recommended)**
   - Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Add `NEXT_PUBLIC_GEMINI_API_KEY=your_key_here` to `.env.local`
   - Test the integration: `node scripts/test-gemini.js`
   - See `AI_SETUP.md` for detailed AI provider setup

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
tether/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── chat/          # AI chat API endpoint
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── tutor/             # AI tutor interface
│   ├── flashcards/        # Flashcard management
│   ├── groups/            # Study groups
│   └── progress/          # Progress tracking
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── chat/              # Chat interface components
│   ├── flashcards/        # Flashcard components
│   │   ├── FlashcardLibrary.tsx
│   │   ├── FlashcardStudy.tsx
│   │   └── index.ts
│   ├── study-groups/      # Study group components
│   └── progress/          # Progress tracking components
├── lib/                   # Utility libraries
│   ├── ai/                # AI integration system
│   │   ├── providers/     # AI provider implementations
│   │   │   ├── gemini.ts      # Google Gemini (Primary)
│   │   │   ├── openai.ts      # OpenAI GPT
│   │   │   ├── anthropic.ts   # Anthropic Claude
│   │   │   ├── huggingface.ts # Hugging Face
│   │   │   ├── ollama.ts      # Local Ollama
│   │   │   └── fallback.ts    # Fallback responses
│   │   ├── service.ts     # AI service orchestrator
│   │   ├── tutorService.ts # Tutor-specific AI logic
│   │   └── types.ts       # AI-related type definitions
│   ├── supabase.ts        # Supabase client
│   └── types.ts           # TypeScript definitions
├── hooks/                 # Custom React hooks
├── stores/                # Zustand state stores
├── scripts/               # Development and testing scripts
│   ├── test-chat-api.js   # Chat API testing
│   └── test-gemini.js     # Gemini API testing
├── supabase/              # Database migrations and types
├── tasks/                 # Development task management
│   ├── prd-tether.md      # Product Requirements Document
│   └── tasks-prd-tether.md # Implementation task list
└── AI_SETUP.md           # AI provider setup guide
```

## 🎯 Development Workflow

This project uses the AI Dev Tasks workflow for structured development:

1. **PRD-Driven Development**: All features start with a Product Requirements Document
2. **Task-Based Implementation**: Features are broken down into granular, actionable tasks
3. **Iterative Development**: One task at a time with review checkpoints
4. **Progress Tracking**: Visual task completion and git commit integration

### Using the Development Workflow

1. **Start a new task**:
   ```bash
   # Reference the process-task-list.md file in your AI assistant
   Please start on task 1.1 and use @process-task-list.md
   ```

2. **Review and approve**: Check each completed task before moving to the next

3. **Track progress**: Tasks are automatically marked complete and committed to git

## 🧪 Testing

### AI Integration Testing

```bash
# Test Gemini API integration
node scripts/test-gemini.js

# Test chat API with Gemini
node scripts/test-chat-api.js
```

### Standard Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🌟 Key Features in Detail

### AI Tutor System
- **Adaptive Learning**: AI adjusts explanations based on your responses
- **Learning Style Adaptation**: Supports visual, auditory, kinesthetic, and mixed learning styles
- **Multi-Provider Support**: Primary Gemini integration with fallback to other AI providers
- **Context Awareness**: Remembers previous conversations and learning progress
- **Subject Expertise**: Handles any topic with tailored learning approaches
- **Free AI Integration**: Powered by Google Gemini (no credit card required)

### Spaced Repetition Engine
- **SM-2 Algorithm**: Proven spaced repetition for long-term retention
- **Performance Analytics**: Track ease factors, intervals, and success rates
- **Smart Scheduling**: Optimal review timing based on your performance
- **Bulk Management**: Efficient creation and organization of flashcards

### Study Group Features
- **Intelligent Matching**: Find compatible study partners
- **Real-Time Collaboration**: Live chat and shared whiteboards
- **AI Moderation**: Automated prompts and discussion facilitation
- **Progress Sharing**: Track group achievements and individual contributions

## 🎨 Design Philosophy

- **Accessibility First**: Works for all learning abilities and devices
- **Minimal Friction**: Guest mode eliminates signup barriers
- **Visual Feedback**: Clear progress indicators and achievement systems
- **Clean Interface**: Rich features without cognitive overload
- **Mobile-First**: Optimized for learning on any device

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the AI Dev Tasks workflow for development
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Bloom's 2 Sigma Problem research
- Community learning principles from Ecclesiastes 4:9-12
- UI/UX inspiration from Khan Academy, Duolingo, and other leading educational platforms
- Built with the AI Dev Tasks workflow for structured development

## 📞 Support

- **Documentation**: Check the `/tasks` folder for detailed PRD and implementation guides
- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

---

**Happy Learning with Tether! 🎓✨**