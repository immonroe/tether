-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  is_guest BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create flashcard_decks table
CREATE TABLE flashcard_decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deck_id UUID REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_groups table
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  max_members INTEGER DEFAULT 10,
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create study_group_members table
CREATE TABLE study_group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Create achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  max_progress INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create study_sessions table
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tutor', 'flashcards', 'group')),
  subject TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_paths table
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  total_concepts INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_learning_paths table
CREATE TABLE user_learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('completed', 'in-progress', 'locked')),
  progress INTEGER DEFAULT 0,
  completed_concepts INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, path_id)
);

-- Create indexes for better performance
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_flashcards_next_review ON flashcards(next_review);
CREATE INDEX idx_study_group_members_group_id ON study_group_members(group_id);
CREATE INDEX idx_study_group_members_user_id ON study_group_members(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_user_learning_paths_user_id ON user_learning_paths(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat sessions" ON chat_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat sessions" ON chat_sessions FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can view messages from own sessions" ON chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create messages in own sessions" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM chat_sessions WHERE id = session_id AND user_id = auth.uid())
);

-- Flashcard decks policies
CREATE POLICY "Users can view own flashcard decks" ON flashcard_decks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own flashcard decks" ON flashcard_decks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcard decks" ON flashcard_decks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcard decks" ON flashcard_decks FOR DELETE USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can view flashcards from own decks" ON flashcards FOR SELECT USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create flashcards in own decks" ON flashcards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update flashcards in own decks" ON flashcards FOR UPDATE USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete flashcards from own decks" ON flashcards FOR DELETE USING (
  EXISTS (SELECT 1 FROM flashcard_decks WHERE id = deck_id AND user_id = auth.uid())
);

-- Study groups policies (public read, members can update)
CREATE POLICY "Anyone can view study groups" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create study groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Group creators can update groups" ON study_groups FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Study group members policies
CREATE POLICY "Users can view group members" ON study_group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON study_group_members FOR DELETE USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own study sessions" ON study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own study sessions" ON study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Learning paths policies (public read)
CREATE POLICY "Anyone can view learning paths" ON learning_paths FOR SELECT USING (true);

-- User learning paths policies
CREATE POLICY "Users can view own learning paths" ON user_learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own learning paths" ON user_learning_paths FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own learning paths" ON user_learning_paths FOR INSERT WITH CHECK (auth.uid() = user_id);
