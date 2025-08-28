import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import IssuesList from '@/components/IssuesList';
import NotificationCenter from '@/components/NotificationCenter';

interface DashboardStats {
  totalIssues: number;
  submittedIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
}

interface UserRole {
  role: string;
  department: string | null;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    submittedIssues: 0,
    inProgressIssues: 0,
    resolvedIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchStats();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, department')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user role:', error);
        return;
      }

      setUserRole(data);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('issues')
        .select('status');

      // If user is a citizen, only show their issues for stats
      if (userRole?.role === 'citizen') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const issueStats = {
        totalIssues: data?.length || 0,
        submittedIssues: data?.filter(i => i.status === 'submitted').length || 0,
        inProgressIssues: data?.filter(i => ['assigned', 'in_progress'].includes(i.status)).length || 0,
        resolvedIssues: data?.filter(i => i.status === 'resolved').length || 0,
      };

      setStats(issueStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const isStaff = userRole?.role && ['staff', 'admin', 'field_worker'].includes(userRole.role);

  // Redirect to auth if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-civic/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-civic/5">
      <div className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isStaff ? 'Municipal Dashboard' : 'My Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                {isStaff 
                  ? `${userRole?.role?.toUpperCase()} ${userRole?.department ? `- ${userRole.department}` : ''}`
                  : 'Track your reported issues and community updates'
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalIssues}</div>
              <p className="text-xs text-muted-foreground">
                {isStaff ? 'All reported issues' : 'Your reported issues'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.submittedIssues}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting acknowledgment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.inProgressIssues}</div>
              <p className="text-xs text-muted-foreground">
                Being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={isStaff ? "all-issues" : "my-issues"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={isStaff ? "all-issues" : "my-issues"}>
              {isStaff ? "All Issues" : "My Issues"}
            </TabsTrigger>
            <TabsTrigger value={isStaff ? "management" : "community"}>
              {isStaff ? "Management" : "Community"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={isStaff ? "all-issues" : "my-issues"} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isStaff ? "All Reported Issues" : "Your Reported Issues"}</CardTitle>
                <CardDescription>
                  {isStaff 
                    ? "Manage and track all community issues"
                    : "Track the status of issues you've reported"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IssuesList showUserIssuesOnly={!isStaff} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={isStaff ? "management" : "community"} className="space-y-6">
            {isStaff ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issue Management</CardTitle>
                    <CardDescription>Quick actions and tools</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Button>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Staff management features are being developed.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Department Analytics</CardTitle>
                    <CardDescription>Performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Average Resolution Time</span>
                        <Badge variant="secondary">2.3 days</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Customer Satisfaction</span>
                        <Badge variant="secondary">4.2/5</Badge>
                      </div>
                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          Analytics dashboard coming soon.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Community Issues</CardTitle>
                  <CardDescription>See what's happening in your area</CardDescription>
                </CardHeader>
                <CardContent>
                  <IssuesList showUserIssuesOnly={false} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}