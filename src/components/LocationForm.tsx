import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card'
import { Loader2, MapPin, Info, Phone, Clock, Building2, Edit } from 'lucide-react'
import type { Category } from '../types'
import { useState } from 'react'

const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category_id: z.string().min(1, 'Category is required'),
  latitude: z.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90'),
  longitude: z.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180'),
  address: z.string().max(200, 'Address must be less than 200 characters').optional().or(z.literal('')),
  opening_hours: z.string().max(100, 'Opening hours must be less than 100 characters').optional().or(z.literal('')),
  contact_information: z.string().max(200, 'Contact information must be less than 200 characters').optional().or(z.literal('')),
})

type LocationFormValues = z.infer<typeof locationSchema>

interface LocationFormProps {
  categories: Category[]
  onSubmit: (data: LocationFormValues) => void | Promise<void>
  onCancel: () => void
  defaultValues?: LocationFormValues
  isSubmitting?: boolean
  title?: string
  submitText?: string
}

export function LocationForm({
  categories,
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
  title = 'Add Location',
  submitText = 'Save Location',
}: LocationFormProps) {
  const [selectedLat, setSelectedLat] = useState<number>(defaultValues?.latitude ?? 22.3361)
  const [selectedLng, setSelectedLng] = useState<number>(defaultValues?.longitude ?? 91.2259)

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      latitude: 22.3361,
      longitude: 91.2259,
      address: '',
      opening_hours: '',
      contact_information: '',
      ...defaultValues,
    },
  })

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      form.setValue('latitude', value)
      setSelectedLat(value)
    }
  }

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      form.setValue('longitude', value)
      setSelectedLng(value)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title === 'Edit Location' ? <Edit className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
          {title}
        </CardTitle>
        <CardDescription>
          {title === 'Edit Location' ? 'Update the location information below' : 'Add a new location to the campus map'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <div className="relative">
                <Input
                  id="name"
                  {...form.register('name')}
                  className="pl-10"
                  disabled={isSubmitting}
                />
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <textarea
                  id="description"
                  {...form.register('description')}
                  className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  placeholder="Enter a brief description of this location..."
                />
                <Info className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              {form.formState.errors.description && (
                <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category</Label>
              <Select
                id="category_id"
                {...form.register('category_id')}
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
              {form.formState.errors.category_id && (
                <p className="text-xs text-red-500">{form.formState.errors.category_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <div className="relative">
                  <Input
                    id="latitude"
                    type="number"
                    min="-90"
                    max="90"
                    step="0.000001"
                    {...form.register('latitude', { valueAsNumber: true })}
                    onChange={handleLatChange}
                    disabled={isSubmitting}
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {form.formState.errors.latitude && (
                  <p className="text-xs text-red-500">{form.formState.errors.latitude.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <div className="relative">
                  <Input
                    id="longitude"
                    type="number"
                    min="-180"
                    max="180"
                    step="0.000001"
                    {...form.register('longitude', { valueAsNumber: true })}
                    onChange={handleLngChange}
                    disabled={isSubmitting}
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                {form.formState.errors.longitude && (
                  <p className="text-xs text-red-500">{form.formState.errors.longitude.message}</p>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                Selected coordinates: {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...form.register('address')}
                disabled={isSubmitting}
                placeholder="Enter the location address..."
              />
              {form.formState.errors.address && (
                <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <div className="relative">
                  <Input
                    id="opening_hours"
                    {...form.register('opening_hours')}
                    disabled={isSubmitting}
                    placeholder="e.g., 8:00 AM - 5:00 PM"
                  />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_information">Contact</Label>
                <div className="relative">
                  <Input
                    id="contact_information"
                    {...form.register('contact_information')}
                    disabled={isSubmitting}
                    placeholder="Phone number or email"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-border p-4 bg-muted/30">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {submitText}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
