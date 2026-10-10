import { supabase } from '../lib/supabase'
import type { Location, LocationStatus, LocationSubmission } from '../types'

export interface LocationFilter {
  search?: string
  categoryId?: string
  status?: LocationStatus
}

export async function getLocations(filter: LocationFilter = {}) {
  let query = supabase
    .from('locations')
    .select(`
      *,
      categories (*)
    `)

  if (filter.search) {
    query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
  }

  if (filter.categoryId) {
    query = query.eq('category_id', filter.categoryId)
  }

  if (filter.status) {
    query = query.eq('status', filter.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching locations:', error)
    throw error
  }

  return data as Location[]
}

export async function getLocationById(id: string) {
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      categories (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching location:', error)
    throw error
  }

  return data as Location
}

export async function createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('locations')
    .insert([location])
    .select()
    .single()

  if (error) {
    console.error('Error creating location:', error)
    throw error
  }

  return data as Location
}

export async function updateLocation(
  id: string,
  updates: Partial<Omit<Location, 'id' | 'created_at'>>
) {
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating location:', error)
    throw error
  }

  return data as Location
}

export async function deleteLocation(id: string) {
  const { error } = await supabase.from('locations').delete().eq('id', id)

  if (error) {
    console.error('Error deleting location:', error)
    throw error
  }
}

export async function submitLocation(location: Omit<LocationSubmission, 'id' | 'created_at' | 'reviewed_at'>) {
  const { data, error } = await supabase
    .from('location_submissions')
    .insert([location])
    .select()
    .single()

  if (error) {
    console.error('Error submitting location:', error)
    throw error
  }

  return data as LocationSubmission
}

export async function approveSubmission(id: string, reviewedBy: string) {
  const { data, error } = await supabase
    .from('location_submissions')
    .update({ review_status: 'approved', reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error approving submission:', error)
    throw error
  }

  return data as LocationSubmission
}

export async function rejectSubmission(id: string, reviewedBy: string) {
  const { data, error } = await supabase
    .from('location_submissions')
    .update({ review_status: 'rejected', reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error rejecting submission:', error)
    throw error
  }

  return data as LocationSubmission
}
