# User Matching System for Study Groups

## Overview

The user matching system is designed to connect learners with compatible study partners based on their preferences, learning goals, and availability. This system is a core component of the Tether AI learning platform's study groups feature.

## Features

- **Multi-factor Matching**: Considers subject interests, skill level, availability, learning goals, and learning style
- **Weighted Scoring**: Uses a weighted algorithm to calculate compatibility scores
- **Flexible Preferences**: Supports various learning styles, time zones, and study frequencies
- **Real-time Matching**: Provides instant matching results based on current user preferences
- **Group Formation**: Can form study groups of 2-4 people based on compatibility

## Matching Algorithm

### Scoring Weights

The matching algorithm uses the following weights to calculate compatibility:

1. **Subject Match (30%)**: Users must have overlapping subjects of interest
2. **Skill Level (25%)**: Compatible skill levels (exact match or adjacent levels)
3. **Availability (20%)**: Overlapping time zones, preferred times, and available days
4. **Learning Goals (15%)**: Number of matching learning goals
5. **Learning Style (10%)**: Compatible learning styles (visual, auditory, kinesthetic, etc.)

### Compatibility Rules

#### Subject Matching
- Users must have at least one subject in common
- Target subject preference is prioritized
- Multiple subject overlaps increase compatibility

#### Skill Level Matching
- Exact matches are preferred
- Adjacent levels are acceptable (beginner-intermediate, intermediate-advanced)
- Users should be within one level of each other

#### Availability Matching
- Timezone compatibility (same timezone or UTC fallback)
- Overlapping preferred study times
- Overlapping available days of the week

#### Learning Goals Matching
- Number of matching goals between users
- Higher overlap indicates better compatibility

#### Learning Style Matching
- Exact matches are preferred
- Mixed learning style is compatible with any other style
- Visual and reading styles are compatible
- Auditory and kinesthetic styles can work together

## Database Schema

### User Preferences Table

```sql
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
```

## API Usage

### MatchingService

```typescript
import { matchingService } from '@/lib/ai/matchingService';

// Find matches for a user
const matches = await matchingService.findMatches(
  userPreferences,
  allUsers,
  criteria,
  10 // limit
);

// Find group matches
const groups = await matchingService.findGroupMatches(
  userPreferences,
  criteria,
  { min: 2, max: 4 }
);
```

### UserPreferencesService

```typescript
import { userPreferencesService } from '@/lib/ai/userPreferencesService';

// Get user preferences
const preferences = await userPreferencesService.getUserPreferences(userId);

// Save user preferences
const saved = await userPreferencesService.saveUserPreferences(userId, preferences);

// Get all users with preferences
const allUsers = await userPreferencesService.getAllUsersWithPreferences();
```

## Components

### UserPreferencesForm
A comprehensive form for users to set their study preferences including:
- Subject interests
- Skill level
- Learning goals
- Availability (timezone, times, days)
- Learning style
- Study frequency
- Group size preferences

### MatchingResults
Displays potential study partners with:
- Compatibility scores
- Matching factors
- User information
- Invite functionality

### StudyGroupList
Shows available study groups with:
- Group information
- Member count
- Subject and level
- Join functionality

## Testing

The matching algorithm has been thoroughly tested with various scenarios:

- High compatibility matches (100% score)
- Low compatibility matches (filtered out)
- Edge cases (no subject overlap, different timezones)
- Group formation with multiple users

Run the test suite:
```bash
node scripts/test-matching.js
```

## Future Enhancements

- Machine learning-based matching improvements
- Integration with user behavior data
- Advanced filtering options
- Matching based on study session history
- Compatibility feedback system
- Automated group scheduling
