# Tether AI Learning Platform - Setup Guide

## Project Overview
Tether AI is an intelligent learning platform that combines AI tutoring, spaced repetition flashcards, and collaborative study groups to enhance the learning experience.

## Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Setup
1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your URL and anon key
3. Go to Settings > Database to get your service role key
4. Run the database migrations:
   ```bash
   # Install Supabase CLI if you haven't already
   npm install -g supabase
   
   # Initialize Supabase in your project
   supabase init
   
   # Start local Supabase (optional for development)
   supabase start
   
   # Apply migrations to your remote database
   supabase db push
   ```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
tether/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── tutor/            # AI Tutor interface
│   ├── flashcards/       # Flashcard system
│   ├── groups/           # Study groups
│   └── progress/         # Progress tracking
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── chat/            # Chat interface components
│   ├── flashcards/      # Flashcard components
│   ├── study-groups/    # Study group components
│   └── progress/        # Progress tracking components
├── lib/                 # Utility libraries
│   ├── supabase.ts     # Supabase client configuration
│   ├── auth.ts         # Authentication utilities
│   └── types.ts        # TypeScript type definitions
├── stores/              # Zustand state management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
└── supabase/            # Database migrations and config
    └── migrations/      # SQL migration files
```

## Features Implemented

### ✅ Completed (Tasks 1.0-1.6)
- [x] Next.js 14+ with TypeScript and Tailwind CSS
- [x] Supabase project configuration
- [x] Database schema with RLS policies
- [x] Authentication setup with Supabase SSR
- [x] Basic project structure and folder organization
- [x] ESLint, Prettier, and TypeScript strict mode
- [x] UI component library with Radix UI
- [x] Zustand state management
- [x] Responsive design system

### 🚧 Next Steps (Tasks 2.0+)
- [ ] Core application architecture
- [ ] AI Tutor chat interface
- [ ] Spaced repetition flashcard system
- [ ] Study groups feature
- [ ] Progress tracking and gamification
- [ ] Guest mode and data persistence

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Database Schema

The database includes the following main tables:
- `users` - User accounts and profiles
- `chat_sessions` - AI tutor conversation sessions
- `chat_messages` - Individual chat messages
- `flashcard_decks` - Collections of flashcards
- `flashcards` - Individual flashcard content
- `study_groups` - Study group information
- `study_group_members` - Group membership
- `achievements` - Available achievements
- `user_achievements` - User progress on achievements
- `study_sessions` - Learning session records
- `learning_paths` - Structured learning curricula
- `user_learning_paths` - User progress on learning paths

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
