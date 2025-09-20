#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to automatically add file descriptions to all project files
 * This helps reduce AI token usage and improves code navigation
 */

// File type configurations
const FILE_CONFIGS = {
  '.tsx': { commentStyle: 'jsdoc' },
  '.ts': { commentStyle: 'jsdoc' },
  '.jsx': { commentStyle: 'jsdoc' },
  '.js': { commentStyle: 'jsdoc' },
  '.md': { commentStyle: 'markdown' },
  '.json': { commentStyle: 'json' }
};

// Specific file descriptions for critical files
const SPECIFIC_DESCRIPTIONS = {
  'package.json': 'Project dependencies, scripts, and metadata for Tether AI learning platform',
  'package-lock.json': 'NPM package lock file with exact dependency versions',
  'next.config.js': 'Next.js configuration with TypeScript and Tailwind CSS support',
  'tailwind.config.js': 'Tailwind CSS configuration and design system setup',
  'tsconfig.json': 'TypeScript configuration for strict type checking',
  'postcss.config.js': 'PostCSS configuration for CSS processing',
  'next-env.d.ts': 'Next.js TypeScript environment declarations',
  'README.md': 'Project documentation and setup instructions',
  'LICENSE': 'MIT License for the Tether AI learning platform',
  '.gitignore': 'Git ignore patterns for version control',
  'lib/types.ts': 'Core TypeScript type definitions for the entire application',
  'lib/supabase.ts': 'Supabase client configuration and database connection',
  'lib/auth.ts': 'Authentication utilities and user management',
  'lib/errors.ts': 'Custom error classes and error handling utilities',
  'lib/utils.ts': 'Utility functions and helper methods',
  'lib/ai/service.ts': 'Main AI service orchestrator with multiple provider support',
  'lib/ai/types.ts': 'AI service type definitions and interfaces',
  'lib/ai/tutorService.ts': 'AI tutor-specific service and conversation management',
  'lib/ai/learningStyleDetector.ts': 'Learning style analysis and adaptation logic',
  'lib/ai/databaseService.ts': 'Database operations for AI chat history and user data',
  'lib/ai/chatHistory.ts': 'Chat history management and persistence',
  'stores/auth.ts': 'Authentication state management with Zustand',
  'stores/error.ts': 'Global error state management',
  'stores/loading.ts': 'Loading state management across the application',
  'hooks/useAuth.ts': 'Authentication state hook',
  'hooks/useErrorHandler.ts': 'Error handling and display hook',
  'hooks/useLoading.ts': 'Loading state management hook',
  'hooks/useChat.ts': 'Chat functionality and AI interaction hook',
  'hooks/useToast.ts': 'Toast notification management hook',
  'components/ui/Button.tsx': 'Reusable button component with multiple variants',
  'components/ui/Input.tsx': 'Reusable input component with validation',
  'components/ui/Card.tsx': 'Card container component for content sections',
  'components/ui/Toast.tsx': 'Toast notification component',
  'components/ui/ErrorBoundary.tsx': 'Error boundary component for error handling',
  'components/ui/LoadingSpinner.tsx': 'Loading spinner component',
  'components/ui/Skeleton.tsx': 'Skeleton loading component',
  'components/ui/Badge.tsx': 'Badge component for status indicators',
  'components/ui/ProgressBar.tsx': 'Progress bar component for tracking completion',
  'components/chat/ChatInterface.tsx': 'Main chat interface with AI tutor integration',
  'components/chat/LearningStyleInsights.tsx': 'Learning style analysis and insights display',
  'components/layout/MainLayout.tsx': 'Main application layout wrapper',
  'components/layout/Header.tsx': 'Application header with navigation',
  'components/layout/Sidebar.tsx': 'Sidebar navigation component',
  'components/layout/MobileNavigation.tsx': 'Mobile-responsive navigation component',
  'components/error/ErrorPage.tsx': 'Error page component for application errors',
  'components/error/NotFoundPage.tsx': '404 not found page component',
  'components/providers/ErrorProvider.tsx': 'Error context provider for global error handling',
  'components/providers/LoadingProvider.tsx': 'Loading context provider for global loading states',
  'components/flashcards/FlashcardStudy.tsx': 'Flashcard study session component',
  'components/flashcards/FlashcardLibrary.tsx': 'Flashcard library and management component',
  'components/study-groups/StudyGroupList.tsx': 'Study group listing and discovery component',
  'components/study-groups/SuggestedGroups.tsx': 'Suggested study groups component',
  'components/progress/LearningPath.tsx': 'Learning path visualization component',
  'components/progress/StudyStatistics.tsx': 'Study statistics and analytics component',
  'components/progress/AchievementSystem.tsx': 'Achievement and gamification system component',
  'components/dashboard/RecentSessions.tsx': 'Recent study sessions dashboard component',
  'components/dashboard/DashboardActions.tsx': 'Dashboard action buttons and quick access',
  'components/home/HomePageActions.tsx': 'Homepage action buttons and navigation',
  'app/page.tsx': 'Main homepage component for Tether AI learning platform',
  'app/layout.tsx': 'Root layout component with providers and global styles',
  'app/not-found.tsx': '404 error page component',
  'app/dashboard/page.tsx': 'Dashboard page component with user overview',
  'app/dashboard/layout.tsx': 'Dashboard layout with navigation and sidebar',
  'app/tutor/page.tsx': 'AI tutor chat interface page',
  'app/tutor/layout.tsx': 'Tutor page layout with chat interface',
  'app/flashcards/page.tsx': 'Flashcard study page component',
  'app/flashcards/layout.tsx': 'Flashcard page layout with study interface',
  'app/groups/page.tsx': 'Study groups discovery and management page',
  'app/groups/layout.tsx': 'Study groups page layout',
  'app/progress/page.tsx': 'Progress tracking and analytics page',
  'app/progress/layout.tsx': 'Progress page layout with statistics',
  'app/api/chat/route.ts': 'API route for AI chat functionality',
  'tasks/tasks-prd-tether.md': 'Project task list and development roadmap',
  'tasks/prd-tether.md': 'Product Requirements Document for Tether AI platform'
};

// Pattern-based descriptions for automatic detection
const PATTERN_DESCRIPTIONS = {
  'components/ui/': 'Reusable UI component',
  'components/chat/': 'Chat interface component',
  'components/layout/': 'Layout and navigation component',
  'components/error/': 'Error handling component',
  'components/providers/': 'React context provider component',
  'components/flashcards/': 'Flashcard system component',
  'components/study-groups/': 'Study group feature component',
  'components/progress/': 'Progress tracking component',
  'components/home/': 'Homepage component',
  'components/dashboard/': 'Dashboard component',
  'app/dashboard/': 'Dashboard page component',
  'app/tutor/': 'AI tutor page component',
  'app/flashcards/': 'Flashcard page component',
  'app/groups/': 'Study groups page component',
  'app/progress/': 'Progress tracking page component',
  'app/api/': 'API route handler',
  'hooks/': 'Custom React hook',
  'stores/': 'Zustand state management store',
  'lib/ai/providers/': 'AI provider implementation',
  'lib/ai/': 'AI service and integration utilities',
  'lib/': 'Utility library and configuration',
  'docs/': 'Project documentation',
  'tasks/': 'Project task management and planning'
};

function getFileDescription(filePath, content) {
  const relativePath = filePath.replace(process.cwd() + '/', '');
  
  // Check for specific descriptions first
  if (SPECIFIC_DESCRIPTIONS[relativePath]) {
    return SPECIFIC_DESCRIPTIONS[relativePath];
  }
  
  // Check for pattern-based descriptions
  for (const [pattern, description] of Object.entries(PATTERN_DESCRIPTIONS)) {
    if (relativePath.includes(pattern)) {
      return description;
    }
  }
  
  // Analyze content for automatic description
  const lines = content.split('\n');
  const firstFewLines = lines.slice(0, 10).join(' ').toLowerCase();
  
  // Component detection
  if (firstFewLines.includes('react') && (firstFewLines.includes('component') || firstFewLines.includes('fc<'))) {
    return 'React component';
  }
  
  // Hook detection
  if (firstFewLines.includes('use') && firstFewLines.includes('hook')) {
    return 'Custom React hook';
  }
  
  // API route detection
  if (filePath.includes('/api/')) {
    return 'API route handler';
  }
  
  // Store detection
  if (firstFewLines.includes('zustand') || firstFewLines.includes('store')) {
    return 'State management store';
  }
  
  // Service detection
  if (firstFewLines.includes('service') || firstFewLines.includes('class')) {
    return 'Service class or utility';
  }
  
  // Type detection
  if (firstFewLines.includes('interface') || firstFewLines.includes('type') || firstFewLines.includes('export type')) {
    return 'TypeScript type definitions';
  }
  
  // Configuration detection
  if (filePath.includes('config') || filePath.includes('.config.')) {
    return 'Configuration file';
  }
  
  // Default fallback
  return 'Project file';
}

function addDescriptionToFile(filePath, content) {
  const ext = path.extname(filePath);
  const config = FILE_CONFIGS[ext];
  
  if (!config) {
    return content; // Skip unsupported file types
  }
  
  // Check if file already has a description
  if (content.includes('@fileoverview') || content.includes('Project Overview') || content.includes('**Project Overview**') || content.includes('// Project dependencies')) {
    return content; // Skip files that already have descriptions
  }
  
  const description = getFileDescription(filePath, content);
  const lines = content.split('\n');
  
  let newContent = '';
  
  if (ext === '.json') {
    // For JSON files, add comment at the top
    newContent = `// ${description}\n${content}`;
  } else if (ext === '.md') {
    // For markdown files, add as a header
    const fileName = path.basename(filePath, ext);
    newContent = `# ${fileName}\n\n**Project Overview**: ${description}\n\n---\n\n${content}`;
  } else {
    // For TypeScript/JavaScript files, add JSDoc comment
    const comment = `/**\n * @fileoverview ${description}\n * \n * This file is part of the Tether AI learning platform.\n * ${description.toLowerCase()} for the application.\n */`;
    
    // Find the best place to insert the comment
    let insertIndex = 0;
    
    // Skip shebang lines
    if (lines[0] && lines[0].startsWith('#!')) {
      insertIndex = 1;
    }
    
    // Skip 'use client' directives
    if (lines[insertIndex] && lines[insertIndex].includes("'use client'")) {
      insertIndex++;
    }
    
    // Skip 'use strict' directives
    if (lines[insertIndex] && lines[insertIndex].includes("'use strict'")) {
      insertIndex++;
    }
    
    // Insert the comment
    lines.splice(insertIndex, 0, comment, '');
    newContent = lines.join('\n');
  }
  
  return newContent;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other build directories
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        continue;
      }
      
      const result = processDirectory(filePath);
      processedCount += result.processed;
      skippedCount += result.skipped;
    } else {
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.md', '.json'].includes(ext)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const newContent = addDescriptionToFile(filePath, content);
          
          if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ Added description to: ${filePath.replace(process.cwd() + '/', '')}`);
            processedCount++;
          } else {
            console.log(`⏭️  Skipped (already has description): ${filePath.replace(process.cwd() + '/', '')}`);
            skippedCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing ${filePath}:`, error.message);
        }
      }
    }
  }
  
  return { processed: processedCount, skipped: skippedCount };
}

// Main execution
console.log('🚀 Starting file description automation...\n');

const result = processDirectory(process.cwd());

console.log(`\n📊 Summary:`);
console.log(`✅ Files processed: ${result.processed}`);
console.log(`⏭️  Files skipped: ${result.skipped}`);
console.log(`📁 Total files: ${result.processed + result.skipped}`);

console.log('\n🎉 File description automation completed!');
console.log('💡 This will help reduce AI token usage and improve code navigation.');
