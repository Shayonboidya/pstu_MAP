import { Card, CardContent, CardDescription, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { MapPin, Phone, Clock, Image as ImageIcon, User, Calendar, Edit, Info } from 'lucide-react'
import { formatDate } from '../lib/utils'
import { Button } from '../components/ui/button'
import type { Location } from '../types'

interface LocationDetailsProps {
  location: Location
  onEdit?: () => void
  isEditable?: boolean
}

export function LocationDetails({ location, onEdit, isEditable = false }: LocationDetailsProps) {
  return (
    <Card className="w-full">
      {isEditable && (
        <div className="flex justify-end p-4 border-b border-border">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Location
          </Button>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{location.name}</h2>
              <Badge variant={location.status === 'approved' ? 'success' : 'warning'}>
                {location.status}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <span className="font-medium">{location.categories?.name}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {location.description && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Description</span>
            </div>
            <p className="text-sm text-foreground">{location.description}</p>
          </div>
        )}

        {location.address && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Address</span>
            </div>
            <p className="text-sm">{location.address}</p>
          </div>
        )}

        {location.opening_hours && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Opening Hours</span>
            </div>
            <p className="text-sm">{location.opening_hours}</p>
          </div>
        )}

        {location.contact_information && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Contact</span>
            </div>
            <p className="text-sm">{location.contact_information}</p>
          </div>
        )}

        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Created by</span>
          </div>
          <p className="text-sm">{location.created_by}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Created</span>
            </div>
            <p className="text-xs">{formatDate(location.created_at)}</p>
          </div>
          {location.updated_at && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Edit className="h-3 w-3" />
                <span>Updated</span>
              </div>
              <p className="text-xs">{formatDate(location.updated_at)}</p>
            </div>
          )}
        </div>

        {location.image_url && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>Image</span>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={location.image_url}
                alt={location.name}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
