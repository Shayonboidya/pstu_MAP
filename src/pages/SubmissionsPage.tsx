import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { submitLocation } from '../services/locationService'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Loader2, MapPin, Plus, Clock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { getCategories } from '../services/categoryService'
import { LocationForm } from '../components/LocationForm'

export function SubmissionsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => {
      // For now, return empty array as this would need a new endpoint
      // In a real app, this would fetch from location_submissions table
      return []
    },
  })

  const handleSubmitLocation = async (data: any) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to submit a location')
      }

      const submissionData = {
        ...data,
        submitted_by: user.id,
        review_status: 'pending',
      }

      await submitLocation(submissionData)
      toast.success('Location submission received! Admins will review it soon.')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
    } catch (error) {
      toast.error((error as Error).message || 'Failed to submit location')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Submissions</h1>
          <p className="text-muted-foreground">View and manage your location submissions</p>
        </div>
        <Button asChild variant="primary">
          <button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit New Location
          </button>
        </Button>
      </div>

      {/* Info Banner */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium">Submission Status</h4>
              <p className="text-sm text-muted-foreground mt-1">
                All location submissions are reviewed by admins before appearing on the map.
                Once approved, your location will be visible to all users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
          <CardDescription>
            {submissions.length} submissions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : submissions.length > 0 ? (
            <div className="space-y-4">
              {submissions.map((submission: any) => (
                <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{submission.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {submission.description || 'No description'}
                      </p>
                      {submission.address && (
                        <p className="text-xs text-muted-foreground mt-1">{submission.address}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={submission.review_status === 'approved' ? 'success' : submission.review_status === 'rejected' ? 'error' : 'warning'}>
                    {submission.review_status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No submissions yet</h3>
              <p className="text-muted-foreground mb-4">Submit a campus location to get started</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">Submit New Location</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <Plus className="h-5 w-5 rotate-45" />
              </Button>
            </div>
            <div className="p-6">
              <LocationForm
                categories={categories}
                onSubmit={handleSubmitLocation}
                onCancel={() => setShowForm(false)}
                title="Submit Location"
                submitText="Submit for Review"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
