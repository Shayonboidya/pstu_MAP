import type { RouteRequest, RouteResponse } from '../types'

// Use OSRM (Open Source Routing Machine) public API
// Note: This uses a public routing service. For production, consider setting up your own OSRM instance
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving'

export async function calculateRoute(request: RouteRequest): Promise<RouteResponse> {
  const { startLat, startLng, endLat, endLng } = request

  try {
    const response = await fetch(
      `${OSRM_API}/${startLng},${startLat};${endLng},${endLat}?overview=full&annotations=distance,duration`
    )

    if (!response.ok) {
      throw new Error('Failed to calculate route')
    }

    const data = await response.json()

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found between the selected locations')
    }

    const route = data.routes[0]
    const coordinates = route.geometry.coordinates

    return {
      distance: route.distance, // meters
      duration: route.duration, // seconds
      coordinates: coordinates as [number, number][],
      summary: getRouteSummary(route.distance, route.duration),
    }
  } catch (error) {
    console.error('Error calculating route:', error)
    // Return a fallback response with straight-line distance
    const straightLineDistance = calculateStraightLineDistance(startLat, startLng, endLat, endLng)
    return {
      distance: straightLineDistance,
      duration: Math.round(straightLineDistance / 80), // ~80 seconds per 100 meters walking
      coordinates: [[startLng, startLat], [endLng, endLat]],
      summary: `Estimated distance: ${formatDistance(straightLineDistance)}. Note: This is straight-line distance as routing service unavailable.`,
    }
  }
}

function calculateStraightLineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

function getRouteSummary(distance: number, duration: number): string {
  const distanceStr = formatDistance(distance)
  const minutes = Math.round(duration / 60)

  if (minutes < 60) {
    return `${distanceStr} - Walking ~${minutes} minutes`
  }
  const hours = Math.round(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${distanceStr} - Driving ~${hours}h ${remainingMinutes}m`
}
