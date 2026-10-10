import { useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap, Popup } from 'react-leaflet'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { MapPin, Navigation, RotateCcw, X } from 'lucide-react'
import { Input } from './ui/input'
import type { Location, RouteResponse } from '../types'
import { calculateRoute } from '../services/routingService'
import { useDebounce } from '../hooks/useDebounce'

// PSTU Coordinates
const PSTU_CENTER: [number, number] = [22.3361, 91.2259]

interface RoutePlannerProps {
  locations: Location[]
  onCancel: () => void
}

export function RoutePlanner({ locations, onCancel }: RoutePlannerProps) {
  const [startLocation, setStartLocation] = useState<Location | null>(null)
  const [endLocation, setEndLocation] = useState<Location | null>(null)
  const [route, setRoute] = useState<RouteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    loc.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  )

  const calculateRouteHandler = async () => {
    if (!startLocation || !endLocation) {
      setError('Please select both a starting point and destination')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const routeData = await calculateRoute({
        startLat: startLocation.latitude,
        startLng: startLocation.longitude,
        endLat: endLocation.latitude,
        endLng: endLocation.longitude,
      })
      setRoute(routeData)
    } catch (err) {
      setError((err as Error).message || 'Failed to calculate route')
    } finally {
      setLoading(false)
    }
  }

  const swapLocations = () => {
    const temp = startLocation
    setStartLocation(endLocation)
    setEndLocation(temp)
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 relative h-full">
        <MapContainer
          center={PSTU_CENTER}
          zoom={16}
          className="h-full w-full"
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapControls />

          {startLocation && (
            <Marker position={[startLocation.latitude, startLocation.longitude]}>
              <PopupWrapper name={startLocation.name} />
            </Marker>
          )}

          {endLocation && (
            <Marker position={[endLocation.latitude, endLocation.longitude]}>
              <PopupWrapper name={endLocation.name} />
            </Marker>
          )}

          {route?.coordinates && route.coordinates.length > 1 && (
            <Polyline
              positions={route.coordinates.map((coord) => [coord[1], coord[0]])}
              color="blue"
              weight={4}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </div>

      <div className="w-96 bg-background border-l border-border flex flex-col h-full z-10">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Route Planner
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Calculate directions between campus locations
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Start Location Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              Starting Point
            </label>
            <div className="relative">
              <Input
                placeholder="Select starting location..."
                value={startLocation ? startLocation.name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setStartLocation(null)
                }}
                onFocus={() => setSelectedResultIndex(0)}
              />
              {startLocation && (
                <button
                  onClick={() => setStartLocation(null)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {searchTerm && (
              <div className="absolute top-36 left-4 right-4 bg-white border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredLocations.length === 0 ? (
                  <div className="p-3 text-sm text-center text-muted-foreground">
                    No locations found
                  </div>
                ) : (
                  filteredLocations.map((loc, index) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setStartLocation(loc)
                        setSearchTerm('')
                      }}
                      className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                        selectedResultIndex === index ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="font-medium">{loc.name}</div>
                      <div className="text-xs text-muted-foreground">{loc.categories?.name}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* End Location Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-600" />
              Destination
            </label>
            <div className="relative">
              <Input
                placeholder="Select destination..."
                value={endLocation ? endLocation.name : searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setEndLocation(null)
                }}
                onFocus={() => setSelectedResultIndex(0)}
              />
              {endLocation && (
                <button
                  onClick={() => setEndLocation(null)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {searchTerm && !startLocation && (
              <div className="absolute top-36 left-4 right-4 bg-white border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                {filteredLocations.length === 0 ? (
                  <div className="p-3 text-sm text-center text-muted-foreground">
                    No locations found
                  </div>
                ) : (
                  filteredLocations.map((loc, index) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setEndLocation(loc)
                        setSearchTerm('')
                      }}
                      className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                        selectedResultIndex === index ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="font-medium">{loc.name}</div>
                      <div className="text-xs text-muted-foreground">{loc.categories?.name}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={swapLocations}
              disabled={!startLocation || !endLocation || loading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Swap
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={calculateRouteHandler}
              disabled={!startLocation || !endLocation || loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4 mr-2" />
                  Calculate Route
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Route Results */}
          {route && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Route Details
              </h3>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Distance</span>
                    <span className="font-medium">{formatDistance(route.distance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Time</span>
                    <span className="font-medium">{formatDuration(route.duration)}</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm">{startLocation?.name}</p>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm">{endLocation?.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="outline" onClick={onCancel} className="w-full">
            <X className="h-4 w-4 mr-2" />
            Close Route Planner
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`
  }
  return `${Math.round(meters)} m`
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.round(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

function MapControls() {
  const map = useMap()
  return (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control-zoom leaflet-bar leaflet-control">
        <a className="leaflet-control-zoom-in" href="#" onClick={(e) => { e.preventDefault(); map.zoomIn(); }}>
          <span className="font-bold">+</span>
        </a>
        <a className="leaflet-control-zoom-out" href="#" onClick={(e) => { e.preventDefault(); map.zoomOut(); }}>
          <span className="font-bold">−</span>
        </a>
      </div>
    </div>
  )
}

function PopupWrapper({ name }: { name: string }) {
  return (
    <Popup>
      <div className="text-sm">
        <strong>{name}</strong>
      </div>
    </Popup>
  )
}
