import { supabase } from '../lib/supabase'
import type { UserProfile, UserRole } from '../types'

export async function getCurrentUser(): Promise<UserProfile | null> {
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
    return {
      id: session.user.id,
      display_name: session.user.email || null,
      role: 'visitor' as UserRole,
      created_at: session.user.created_at,
    }
  }

  return profile as UserProfile
}

export async function signUp(email: string, password: string, displayName: string) {
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
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)

  if (error) {
    console.error('Error resetting password:', error)
    throw error
  }

  return data
}

export async function updateProfile(updates: Partial<UserProfile>) {
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
  return supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      getCurrentUser().then(callback)
    } else if (event === 'SIGNED_OUT') {
      callback(null)
    }
  })
}
