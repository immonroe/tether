'use client';

import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export const HomePageActions: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex gap-4 justify-center">
      <Button onClick={() => router.push('/dashboard')} size="large">
        Get Started
      </Button>
      <Button variant="outline" size="large">
        Learn More
      </Button>
    </div>
  );
};
