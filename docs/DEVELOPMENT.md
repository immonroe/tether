# Development Guide

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
- [x] AI Tutor chat interface with Gemini integration
- [x] Learning style adaptation
- [x] Multi-provider AI support with fallback

### 🚧 Next Steps (Tasks 2.0+)
- [ ] Spaced repetition flashcard system
- [ ] Study groups feature
- [ ] Progress tracking and gamification
- [ ] Guest mode and data persistence
- [ ] Advanced AI features (voice, images, drawing)
- [ ] Mobile app development
- [ ] Performance optimization
- [ ] Testing suite implementation

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# AI Testing
node scripts/test-gemini.js      # Test Gemini API
node scripts/test-chat-api.js    # Test chat API

# Database
npx supabase start              # Start local Supabase
npx supabase db reset           # Reset local database
npx supabase db push            # Push schema changes
npx supabase gen types typescript --local > lib/supabase-types.ts
```

## Database Schema

### Core Tables

```sql
-- Users table (handled by Supabase Auth)
-- Additional user profiles can be added here

-- Study Groups
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group Members
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Flashcards
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  subject TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study Sessions
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  ease_factor DECIMAL(4,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 day'
);
```

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies for user data isolation.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the AI Dev Tasks workflow for development
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
