import { Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import type { Location } from '../types'

interface LocationMarkerProps {
  location: Location
  onClick: (location: Location) => void
}

export function LocationMarker({ location, onClick }: LocationMarkerProps) {
  // Create custom icon based on category color
  const icon = new Icon({
    iconUrl: `https://placehold.co/40/${location.categories?.color.replace('#', '')}/ffffff?text=${location.categories?.name.charAt(0) || 'L'}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })

  const handleMarkerClick = () => {
    onClick(location)
  }

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      <Popup className="location-popup">
        <div className="min-w-[200px]">
          <h4 className="font-semibold text-lg mb-1">{location.name}</h4>
          <p className="text-sm text-muted-foreground mb-2">{location.categories?.name}</p>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{location.description}</p>
          {location.address && (
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
              {location.address}
            </p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              {location.status}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
