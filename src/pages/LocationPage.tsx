import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getLocationById } from '../services/locationService'
import { LocationDetails } from '../components/LocationDetails'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Loader2, MapPin, ChevronLeft, Calendar, Phone, Clock, Edit } from 'lucide-react'
import { formatDate } from '../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { useAuth } from '../contexts/AuthContext'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

export function LocationPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()

  const { data: location, isLoading, error } = useQuery({
    queryKey: ['location', id],
    queryFn: () => getLocationById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !location) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Location Not Found</h2>
        <p className="text-muted-foreground mb-6">The location you're looking for doesn't exist or has been removed.</p>
        <Button asChild variant="secondary">
          <Link to="/">Back to Map</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Map Section */}
      <div className="flex-1 h-64 md:h-auto min-h-[300px]">
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={16}
          className="h-full w-full"
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <div className="text-sm">
                <strong>{location.name}</strong>
                <p>{location.categories?.name}</p>
                {location.address && <p>{location.address}</p>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Details Section */}
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button asChild variant="ghost" size="sm" className="md:hidden">
              <Link to="/">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Badge variant={location.status === 'approved' ? 'success' : 'warning'}>
              {location.status}
            </Badge>
          </div>

          <LocationDetails
            location={location}
            isEditable={isAdmin}
            onEdit={() => {}}
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Coordinates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude</span>
                    <span className="font-mono">{location.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude</span>
                    <span className="font-mono">{location.longitude.toFixed(6)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {location.opening_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{location.opening_hours}</span>
                    </div>
                  )}
                  {location.contact_information && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{location.contact_information}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Added {formatDate(location.created_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isAdmin && (
            <div className="mt-6">
              <Button asChild variant="outline" className="w-full">
                <Link to={`/admin/locations`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Manage All Locations
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
