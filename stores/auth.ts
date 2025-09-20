/**
 * @fileoverview Authentication state management with Zustand
 * 
 * This file is part of the Tether AI learning platform.
 * authentication state management with zustand for the application.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/lib/auth'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
