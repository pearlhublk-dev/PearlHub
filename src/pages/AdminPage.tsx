import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  moderation_status: string;
  admin_notes: string;
  active: boolean;
  admin_status_reason: string;
  user_id: string;
  type?: string;
  created_at: string;
}

interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
}

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (data && !error) {
      setIsAdmin(true);
      loadAdminData();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);

    // Load pending listings
    const [staysRes, vehiclesRes, eventsRes, reportsRes, analyticsRes] = await Promise.all([
      supabase.from('stays_listings').select('*').eq('moderation_status', 'pending'),
      supabase.from('vehicles_listings').select('*').eq('moderation_status', 'pending'),
      supabase.from('events_listings').select('*').eq('moderation_status', 'pending'),
      supabase.from('user_reports').select('*').eq('status', 'pending'),
      // Simple analytics query
      supabase.from('bookings').select('total_amount, currency, created_at').limit(1000)
    ]);

    const allPending = [
      ...staysRes.data?.map(l => ({ ...l, type: 'stay' })) || [],
      ...vehiclesRes.data?.map(l => ({ ...l, type: 'vehicle' })) || [],
      ...eventsRes.data?.map(l => ({ ...l, type: 'event' })) || []
    ];

    setPendingListings(allPending);
    setReports(reportsRes.data || []);

    // Calculate analytics
    const bookings = analyticsRes.data || [];
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const totalBookings = bookings.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    setAnalytics({
      totalRevenue,
      totalBookings,
      avgBookingValue,
      recentBookings: bookings.slice(0, 10)
    });

    setLoading(false);
  };

  const updateListingStatus = async (listingId: string, type: string, status: string, notes: string = '') => {
    const table = type === 'stay' ? 'stays_listings' : type === 'vehicle' ? 'vehicles_listings' : 'events_listings';

    const { error } = await supabase
      .from(table)
      .update({ moderation_status: status, admin_notes: notes })
      .eq('id', listingId);

    if (error) {
      toast.error('Failed to update listing status');
      return;
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user!.id,
      action_type: 'moderation_update',
      target_type: 'listing',
      target_id: listingId,
      details: { status, notes, listing_type: type }
    });

    toast.success('Listing status updated');
    loadAdminData();
  };

  const updateActiveStatus = async (listingId: string, type: string, active: boolean) => {
    const table = type === 'stay' ? 'stays_listings' : type === 'vehicle' ? 'vehicles_listings' : 'events_listings';

    const { error } = await supabase
      .from(table)
      .update({ active })
      .eq('id', listingId);

    if (error) {
      toast.error('Failed to update active status');
      return;
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user!.id,
      action_type: 'active_status_update',
      target_type: 'listing',
      target_id: listingId,
      details: { active }
    });

    toast.success('Active status updated');
    loadAdminData();
  };

  const suspendUser = async (userId: string, reason: string) => {
    // Update user status (assuming we add a suspended field to profiles)
    const { error } = await supabase
      .from('profiles')
      .update({ verified: false }) // Using verified as suspension flag for now
      .eq('id', userId);

    if (error) {
      toast.error('Failed to suspend user');
      return;
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user!.id,
      action_type: 'user_suspension',
      target_type: 'user',
      target_id: userId,
      details: { reason }
    });

    toast.success('User suspended');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Control Panel</h1>

        <Tabs defaultValue="moderation" className="space-y-6">
          <TabsList>
            <TabsTrigger value="moderation">Listing Moderation</TabsTrigger>
            <TabsTrigger value="reports">User Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Listings ({pendingListings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingListings.length === 0 ? (
                  <p>No pending listings</p>
                ) : (
                  <div className="space-y-4">
                    {pendingListings.map((listing) => (
                      <Card key={listing.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{listing.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Type: {listing.type} | Created: {new Date(listing.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm">Status: {listing.moderation_status} | Active: {listing.active ? 'Yes' : 'No'}</p>
                            {listing.admin_status_reason && <p className="text-sm text-red-600">Reason: {listing.admin_status_reason}</p>}
                          </div>
                          <Badge variant={listing.active ? "default" : "secondary"}>{listing.active ? "Active" : "Inactive"}</Badge>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`active-${listing.id}`}
                              checked={listing.active}
                              onCheckedChange={(checked) => updateActiveStatus(listing.id, listing.type!, checked)}
                            />
                            <Label htmlFor={`active-${listing.id}`}>Active</Label>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => updateListingStatus(listing.id, listing.type!, 'approved')}
                          >
                            Approve
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">Reject</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Listing</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to reject this listing? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Textarea
                                placeholder="Reason for rejection..."
                                id={`reject-notes-${listing.id}`}
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    const notes = (document.getElementById(`reject-notes-${listing.id}`) as HTMLTextAreaElement)?.value || '';
                                    updateListingStatus(listing.id, listing.type!, 'rejected', notes);
                                  }}
                                >
                                  Reject
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">Suspend User</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will suspend the user who created this listing.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <Textarea
                                placeholder="Reason for suspension..."
                                id={`suspend-notes-${listing.id}`}
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    const reason = (document.getElementById(`suspend-notes-${listing.id}`) as HTMLTextAreaElement)?.value || '';
                                    suspendUser(listing.user_id, reason);
                                  }}
                                >
                                  Suspend
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reports ({reports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <p>No pending reports</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <Card key={report.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{report.report_type}</p>
                            <p className="text-sm">{report.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Reported: {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="destructive">{report.status}</Badge>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={() => updateReportStatus(report.id, 'investigating')}
                          >
                            Investigate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReportStatus(report.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateReportStatus(report.id, 'dismissed')}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">LKR {analytics.totalRevenue?.toLocaleString() || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{analytics.totalBookings || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg Booking Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">LKR {analytics.avgBookingValue?.toFixed(0) || 0}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.recentBookings?.map((booking: any) => (
                    <div key={booking.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-semibold">LKR {booking.total_amount}</p>
                        <p className="text-sm text-muted-foreground">{new Date(booking.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge>{booking.currency}</Badge>
                    </div>
                  )) || <p>No recent bookings</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;