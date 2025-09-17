'use client';

import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Tether AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your intelligent learning companion powered by AI. Master any subject with personalized tutoring, 
            spaced repetition flashcards, and collaborative study groups.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push('/dashboard')} size="large">
              Get Started
            </Button>
            <Button variant="outline" size="large">
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Tutor</h3>
            <p className="text-gray-600">
              Get personalized help with any subject through our intelligent AI tutor.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">Smart Flashcards</h3>
            <p className="text-gray-600">
              Master concepts with spaced repetition flashcards that adapt to your learning pace.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Study Groups</h3>
            <p className="text-gray-600">
              Collaborate with peers and learn together in focused study groups.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
