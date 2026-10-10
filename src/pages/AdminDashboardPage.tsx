import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Loader2, MapPin, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getLocations } from '../services/locationService'
import { useAuth } from '../contexts/AuthContext'
import type { Location } from '../types'

export function AdminDashboardPage() {
  const { user } = useAuth()

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
  })

  const [stats, setStats] = useState({
    totalLocations: 0,
    byCategory: {} as Record<string, number>,
  })

  useEffect(() => {
    if (locations && locations.length > 0) {
      const byCategory = locations.reduce((acc: Record<string, number>, loc: Location) => {
        const catName = loc.categories?.name || 'Uncategorized'
        acc[catName] = (acc[catName] || 0) + 1
        return acc
      }, {})

      setStats({
        totalLocations: locations.length,
        byCategory,
      })
    }
  }, [locations])

  const isLoading = false

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage campus locations and categories</p>
        </div>
        <Button asChild variant="primary">
          <Link to="/admin/locations">
            <MapPin className="h-4 w-4 mr-2" />
            Manage Locations
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLocations}</div>
            <p className="text-xs text-muted-foreground">Campus locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Categories</span>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
            <p className="text-xs text-muted-foreground">Location categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-muted-foreground">Submissions</span>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Locations by Category</CardTitle>
          <CardDescription>Breakdown of campus locations by category</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.entries(stats.byCategory).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-sm">📍</span>
                    </div>
                    <span className="font-medium">{category}</span>
                  </div>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No locations found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Location List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Locations</CardTitle>
          <CardDescription>View and manage recently added locations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : locations && locations.length > 0 ? (
            <div className="space-y-4">
              {locations.slice(0, 5).map((location: Location) => (
                <div key={location.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${location.categories?.color}20`, color: location.categories?.color }}
                    >
                      <span className="text-lg">{location.categories?.icon || '📍'}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-xs text-muted-foreground">{location.categories?.name}</p>
                    </div>
                  </div>
                  <Badge variant={location.status === 'approved' ? 'success' : 'warning'}>
                    {location.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No locations found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
