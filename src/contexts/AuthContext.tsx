import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChange, getCurrentUser, signOut, signIn, signUp } from '../services/authService'
import type { UserProfile, UserRole } from '../types'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isUser: boolean
  isVisitor: boolean
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, displayName: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial load
    getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Listen for auth changes
    const { data } = onAuthStateChange((currentUser) => {
      setUser(currentUser)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user' || user?.role === 'admin',
    isVisitor: !user || user?.role === 'visitor',
    signOut: async () => {
      await signOut()
      setUser(null)
    },
    signIn: async (email: string, password: string) => {
      const result = await signIn(email, password)
      const updatedUser = await getCurrentUser()
      setUser(updatedUser)
      return result
    },
    signUp: async (email: string, password: string, displayName: string) => {
      const result = await signUp(email, password, displayName)
      const updatedUser = await getCurrentUser()
      setUser(updatedUser)
      return result
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function requireAuth(role: UserRole = 'visitor') {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('requireAuth must be used within an AuthProvider')
  }

  const allowedRoles: Record<UserRole, boolean> = {
    visitor: true,
    user: context.isUser || context.isAdmin,
    admin: context.isAdmin,
  }

  return {
    user: context.user,
    loading: context.loading,
    canAccess: allowedRoles[role],
    isAdmin: context.isAdmin,
    isUser: context.isUser,
  }
}
