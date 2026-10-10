export type UserRole = 'visitor' | 'user' | 'admin'

export interface UserProfile {
  id: string
  display_name: string | null
  role: UserRole
  created_at: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export type LocationStatus = 'approved' | 'pending' | 'rejected'

export interface Location {
  id: string
  name: string
  description: string | null
  category_id: string
  latitude: number
  longitude: number
  address: string | null
  image_url: string | null
  opening_hours: string | null
  contact_information: string | null
  status: LocationStatus
  created_by: string
  created_at: string
  updated_at: string | null
  categories?: {
    id: string
    name: string
    icon: string
    color: string
  }
}

export interface LocationSubmission {
  id: string
  name: string
  description: string | null
  category_id: string
  latitude: number
  longitude: number
  address: string | null
  image_url: string | null
  opening_hours: string | null
  contact_information: string | null
  submitted_by: string
  review_status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface RouteRequest {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
}

export interface RouteResponse {
  distance: number
  duration: number
  coordinates: [number, number][]
  summary: string
}
