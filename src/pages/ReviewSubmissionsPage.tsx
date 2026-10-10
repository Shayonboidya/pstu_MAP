import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { approveSubmission, rejectSubmission } from '../services/locationService'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Loader2, MapPin, Check, X, AlertCircle, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import { formatDate } from '../lib/utils'

export function ReviewSubmissionsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isLoading] = useState(false)

  const { data: locations = [] } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => {
      // For now, return empty array - in a real app this would fetch from location_submissions
      return []
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, reviewedBy }: { id: string; reviewedBy: string }) =>
      approveSubmission(id, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      toast.success('Submission approved successfully')
    },
    onError: () => {
      toast.error('Failed to approve submission')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reviewedBy }: { id: string; reviewedBy: string }) =>
      rejectSubmission(id, reviewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      toast.success('Submission rejected')
    },
    onError: () => {
      toast.error('Failed to reject submission')
    },
  })

  const handleApprove = (id: string) => {
    if (!user) return
    if (window.confirm('Are you sure you want to approve this submission?')) {
      approveMutation.mutate({ id, reviewedBy: user.id })
    }
  }

  const handleReject = (id: string) => {
    if (!user) return
    if (window.confirm('Are you sure you want to reject this submission?')) {
      rejectMutation.mutate({ id, reviewedBy: user.id })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Submissions</h1>
        <p className="text-muted-foreground">Approve or reject new location submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Live on map</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Not published</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Submissions</CardTitle>
          <CardDescription>
            {locations.length} submissions waiting for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : locations.length > 0 ? (
            <div className="space-y-4">
              {locations.map((submission: any) => (
                <div key={submission.id} className="p-4 border border-border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{submission.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {submission.description || 'No description'}
                        </p>
                        {submission.address && (
                          <p className="text-xs text-muted-foreground mt-1">{submission.address}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Submitted by: {submission.submitted_by}</span>
                          <span>{formatDate(submission.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {}}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <div className="flex-1" />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReject(submission.id)}
                      disabled={rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </>
                      )}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(submission.id)}
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No pending submissions</h3>
              <p className="text-muted-foreground">All submissions have been reviewed</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
