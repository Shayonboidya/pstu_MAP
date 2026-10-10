import { supabase, isSupabaseAvailable } from '../lib/supabase'
import type { UserProfile, UserRole } from '../types'

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured - returning null user')
    return null
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    // Get user profile from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      // Return basic user info even if profile doesn't exist
      // Default role is 'user' (profiles created on signup have role: 'user')
      return {
        id: session.user.id,
        display_name: session.user.email || null,
        role: 'user' as UserRole,
        created_at: session.user.created_at,
      }
    }

    return profile as UserProfile
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export async function signUp(email: string, password: string, displayName: string) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not configured - cannot sign up')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  })

  if (error) {
    console.error('Error signing up:', error)
    throw error
  }

  // Create profile for new user
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        display_name: displayName,
        role: 'user',
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating profile:', profileError)
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not configured - cannot sign in')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Error signing in:', error)
    throw error
  }

  return data
}

export async function signOut() {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not configured - sign out skipped')
    return
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function resetPassword(email: string) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not configured - cannot reset password')
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    console.error('Error resetting password:', error)
    throw error
  }

  return data
}

export async function updateProfile(updates: Partial<UserProfile>) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not configured - cannot update profile')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw error
  }

  return data as UserProfile
}

export function onAuthStateChange(callback: (user: UserProfile | null) => void) {
  if (!isSupabaseAvailable()) {
    // Return a mock subscription that does nothing
    return {
      subscription: {
        unsubscribe: () => {}
      }
    }
  }

  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      getCurrentUser().then(callback)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })

  return { subscription: data.subscription }
}
