import { MapView } from '../components/MapView'
import { RoutePlanner } from '../components/RoutePlanner'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLocations } from '../services/locationService'
import { Button } from '../components/ui/button'
import { Navigation } from 'lucide-react'

export function HomePage() {
  const [showRoutePlanner, setShowRoutePlanner] = useState(false)

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
  })

  if (showRoutePlanner) {
    return <RoutePlanner locations={locations} onCancel={() => setShowRoutePlanner(false)} />
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground py-8 px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">PSTU Interactive Campus Map</h1>
          <p className="text-primary-foreground/90 max-w-2xl">
            Explore Patuakhali Science and Technology University with our interactive map.
            Find buildings, departments, and amenities across campus.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MapView />
      </div>

      {/* Floating Route Planner Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-1/2 md:translate-x-0 md:translate-y-0 z-40">
        <Button
          onClick={() => setShowRoutePlanner(true)}
          className="shadow-lg hover:shadow-xl transition-all hover:scale-105"
          size="lg"
        >
          <Navigation className="h-5 w-5 mr-2" />
          Plan a Route
        </Button>
      </div>
    </div>
  )
}
