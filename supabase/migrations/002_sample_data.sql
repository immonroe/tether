-- Insert sample achievements
INSERT INTO achievements (title, description, icon, max_progress) VALUES
('First Steps', 'Complete your first study session', '🎯', 1),
('Streak Master', 'Study for 7 days in a row', '🔥', 7),
('Flashcard Pro', 'Review 100 flashcards', '📚', 100),
('Group Collaborator', 'Join your first study group', '👥', 1),
('AI Tutor Fan', 'Have 10 conversations with the AI tutor', '🤖', 10),
('Knowledge Seeker', 'Complete 5 learning paths', '🏆', 5),
('Speed Learner', 'Complete a study session in under 10 minutes', '⚡', 1),
('Consistent Scholar', 'Study for 30 days total', '📅', 30),
('Concept Master', 'Master 50 different concepts', '🧠', 50),
('Social Learner', 'Participate in 5 group study sessions', '💬', 5);

-- Insert sample learning paths
INSERT INTO learning_paths (title, description, total_concepts) VALUES
('JavaScript Fundamentals', 'Master the basics of JavaScript programming', 15),
('React Development', 'Learn modern React development patterns', 20),
('Data Structures & Algorithms', 'Understand core computer science concepts', 25),
('Web Development Basics', 'HTML, CSS, and responsive design', 12),
('Python for Beginners', 'Start your Python programming journey', 18),
('Machine Learning Introduction', 'Explore the world of AI and ML', 22),
('Database Design', 'Learn relational database concepts', 16),
('System Design', 'Design scalable software systems', 30),
('Mobile App Development', 'Build apps for iOS and Android', 24),
('DevOps Fundamentals', 'Deploy and maintain applications', 20);
