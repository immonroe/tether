-- Create user_preferences table for study group matching
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subjects TEXT[] NOT NULL DEFAULT '{}',
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  learning_goals TEXT[] NOT NULL DEFAULT '{}',
  availability JSONB NOT NULL DEFAULT '{
    "timezone": "UTC",
    "preferredTimes": [],
    "daysOfWeek": []
  }',
  group_size JSONB NOT NULL DEFAULT '{
    "min": 2,
    "max": 4
  }',
  learning_style TEXT NOT NULL CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading', 'mixed')),
  study_frequency TEXT NOT NULL CHECK (study_frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_subjects ON user_preferences USING GIN(subjects);
CREATE INDEX idx_user_preferences_skill_level ON user_preferences(skill_level);
CREATE INDEX idx_user_preferences_learning_goals ON user_preferences USING GIN(learning_goals);
CREATE INDEX idx_user_preferences_learning_style ON user_preferences(learning_style);
CREATE INDEX idx_user_preferences_study_frequency ON user_preferences(study_frequency);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_user_preferences_updated_at();
