import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLocations, deleteLocation } from '../services/locationService'
import { getCategories } from '../services/categoryService'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Label } from '../components/ui/label'
import { Loader2, MapPin, Plus, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

export function ManageLocationsPage() {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations', selectedCategory],
    queryFn: () => getLocations({ categoryId: selectedCategory, search: searchTerm }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Location deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete location')
    },
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      deleteMutation.mutate(id)
    }
  }

  const filteredLocations = locations?.filter((loc) => {
    const matchesCategory = selectedCategory ? loc.category_id === selectedCategory : true
    const matchesSearch = searchTerm
      ? loc.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Locations</h1>
          <p className="text-muted-foreground">Add, edit, and manage campus locations</p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/locations/add">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Link>
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="category-filter">Category</Label>
              <Select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>
            {filteredLocations?.length || 0} locations found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredLocations && filteredLocations.length > 0 ? (
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <div key={location.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${location.categories?.color}20`, color: location.categories?.color }}
                    >
                      <span className="text-xl">{location.categories?.icon || '📍'}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{location.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {location.categories?.name}
                        </Badge>
                        <Badge variant={location.status === 'approved' ? 'success' : 'warning'} className="text-xs">
                          {location.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
                        {location.description || 'No description'}
                      </p>
                      {location.address && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {location.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/locations/${location.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/locations/edit/${location.id}`}>Edit</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(location.id)} disabled={deleteMutation.isPending}>
                      {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No locations found</h3>
              <p className="text-muted-foreground mb-4">Add a new location to get started</p>
              <Button asChild variant="primary">
                <Link to="/admin/locations/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
