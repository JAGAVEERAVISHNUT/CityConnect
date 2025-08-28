import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import IssuesList from '@/components/IssuesList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyReports = () => {
  const { user, loading } = useAuth();

  // Redirect to auth if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Reports</h1>
              <p className="text-muted-foreground">
                Track the status of issues you've reported to the community.
              </p>
            </div>
            <Link to="/report-issue">
              <Button variant="civic">
                <Plus className="w-4 h-4 mr-2" />
                Report New Issue
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Reported Issues</CardTitle>
            <CardDescription>
              View and track all the issues you've reported to improve your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IssuesList showUserIssuesOnly={true} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyReports;