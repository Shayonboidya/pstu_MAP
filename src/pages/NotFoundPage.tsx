import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { MapPin, Home, Search } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl"></div>
        <MapPin className="h-24 w-24 text-primary relative z-10" />
      </div>

      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Location Not Found</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page or location you're looking for doesn't exist or has been moved. Check the URL or search for a different location.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="primary" size="lg">
          <Link to="/">
            <Home className="h-5 w-5 mr-2" />
            Back to Map
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/locations">
            <Search className="h-5 w-5 mr-2" />
            Search Locations
          </Link>
        </Button>
      </div>
    </div>
  )
}
