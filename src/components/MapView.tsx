import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useMapStore } from '../store/mapStore'
import { useQuery } from '@tanstack/react-query'
import { getLocations } from '../services/locationService'
import { LocationMarker } from './LocationMarker'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Search, MapPin, List, Grid, Plus } from 'lucide-react'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import type { Category, Location } from '../types'
import { getCategories } from '../services/categoryService'
import { Card } from './ui/card'

// PSTU Coordinates
const PSTU_CENTER: [number, number] = [22.3361, 91.2259]

function MapView() {
  const { center, zoom, setCenter, setZoom, setSelectedLocation } = useMapStore()
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showList, setShowList] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [locationList, setLocationList] = useState<Location[]>([])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: locations, isLoading, error } = useQuery({
    queryKey: ['locations', debouncedSearchTerm, selectedCategory],
    queryFn: () => getLocations({
      search: debouncedSearchTerm,
      categoryId: selectedCategory || undefined,
    }),
  })

  const { data: categoryData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData)
    }
  }, [categoryData])

  useEffect(() => {
    if (locations) {
      setLocationList(locations)
    }
  }, [locations])

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location)
    setCenter(location.latitude, location.longitude)
    setZoom(16)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
  }

  const recenterToPSTU = () => {
    setCenter(PSTU_CENTER[0], PSTU_CENTER[1])
    setZoom(16)
    setSelectedLocation(null)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <div className="text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Failed to load locations</h3>
          <p className="text-sm text-muted-foreground mb-4">{(error as Error).message}</p>
          <Button onClick={resetFilters}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative h-full">
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          scrollWheelZoom={true}
          className="h-full w-full"
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {isLoading ? (
            <Marker position={center}>
              <Popup>
                Loading locations...
              </Popup>
            </Marker>
          ) : (
            locations?.map((location) => (
              <LocationMarker
                key={location.id}
                location={location}
                onClick={handleLocationClick}
              />
            ))
          )}

          <MapControls />
        </MapContainer>

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={recenterToPSTU}
            className="bg-background shadow-md"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowList(!showList)}
            className="bg-background shadow-md"
          >
            {showList ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          showList ? 'w-full md:w-96' : 'w-0 opacity-0 md:w-0 md:opacity-0'
        } transition-all duration-300 border-l border-background bg-background flex flex-col h-full z-10`}
      >
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Campus Locations</h2>
            <Badge variant="outline" className="text-xs">
              {locations?.length || 0} found
            </Badge>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 w-40"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          {(searchTerm || selectedCategory) && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-8">
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : locations?.length === 0 ? (
            <div className="text-center py-12">
              <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No locations found</p>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="mt-2">
                Clear Filters
              </Button>
            </div>
          ) : (
            locationList.map((location) => (
              <Card
                key={location.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleLocationClick(location)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${location.categories?.color}20`, color: location.categories?.color }}
                  >
                    <span className="text-lg">{location.categories?.icon || '📍'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{location.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {location.categories?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {location.address || 'No address'}
                    </p>
                  </div>
                  <Badge variant={location.status === 'approved' ? 'success' : 'warning'}>
                    {location.status}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>

        {isAdmin && (
          <div className="p-4 border-t border-border">
            <Button asChild variant="primary" className="w-full" size="sm">
              <Link to="/admin/locations">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Map Controls Component
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

export { MapView }
