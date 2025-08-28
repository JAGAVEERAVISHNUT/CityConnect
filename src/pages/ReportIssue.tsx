import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import IssueReportForm from '@/components/IssueReportForm';
import IssueCategories from '@/components/IssueCategories';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ReportIssue = () => {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Report an Issue</h1>
          <p className="text-muted-foreground">Help improve your community by reporting issues that need attention.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Issue Categories</CardTitle>
                <CardDescription>
                  Select the category that best describes your issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IssueCategories 
                  onCategorySelect={setSelectedCategory}
                  selectedCategory={selectedCategory}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Report</CardTitle>
                <CardDescription>
                  {selectedCategory 
                    ? `Reporting a ${selectedCategory.replace('_', ' ')} issue`
                    : "Select a category to begin"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IssueReportForm onIssueSubmitted={() => {
                  setSelectedCategory("");
                }} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;