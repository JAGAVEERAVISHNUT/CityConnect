import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Filter, Layers, Eye, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MapIssue {
  id: string;
  title: string;
  category: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  created_at: string;
}

const CommunityMap = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<MapIssue[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapIssues();
  }, []);

  const fetchMapIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('id, title, category, status, latitude, longitude, address, created_at')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues((data as MapIssue[]) || []);
    } catch (error) {
      console.error('Error fetching map issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (selectedFilter === 'all') return true;
    return issue.status === selectedFilter;
  });

  const statusColors = {
    submitted: 'bg-blue-500',
    acknowledged: 'bg-yellow-500',
    assigned: 'bg-purple-500',
    in_progress: 'bg-orange-500',
    resolved: 'bg-green-500',
  };

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Community Map</h1>
          <p className="text-muted-foreground">
            Explore real-time updates on reported issues across your community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] shadow-card-civic">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full bg-gradient-to-br from-civic-teal/20 to-civic-blue/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Interactive Map Simulation */}
                  {filteredIssues.slice(0, 10).map((issue, index) => (
                    <div
                      key={issue.id}
                      className={`absolute w-4 h-4 rounded-full animate-pulse cursor-pointer ${
                        statusColors[issue.status as keyof typeof statusColors] || 'bg-gray-500'
                      }`}
                      style={{
                        top: `${20 + (index * 8)}%`,
                        left: `${30 + (index * 7)}%`,
                      }}
                      title={`${issue.title} - ${issue.status}`}
                    />
                  ))}
                  
                  <div className="text-center z-10">
                    <MapPin className="w-16 h-16 text-civic-blue mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-foreground mb-2">
                      Interactive Community Map
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Real-time visualization of community issues. Click on pins to see details.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredIssues.length} issues
                      </p>
                      <Button variant="civic">
                        <Eye className="w-4 h-4 mr-2" />
                        Enable Interactive Mode
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <Card className="shadow-card-civic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant={selectedFilter === 'all' ? 'civic' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedFilter('all')}
                >
                  All Issues ({issues.length})
                </Button>
                <Button
                  variant={selectedFilter === 'submitted' ? 'civic' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedFilter('submitted')}
                >
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Submitted ({issues.filter(i => i.status === 'submitted').length})
                </Button>
                <Button
                  variant={selectedFilter === 'in_progress' ? 'civic' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedFilter('in_progress')}
                >
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                  In Progress ({issues.filter(i => i.status === 'in_progress').length})
                </Button>
                <Button
                  variant={selectedFilter === 'resolved' ? 'civic' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedFilter('resolved')}
                >
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Resolved ({issues.filter(i => i.status === 'resolved').length})
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="shadow-card-civic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  Map Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Issues</span>
                  <span className="font-semibold text-foreground">{issues.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">With Location</span>
                  <span className="font-semibold text-civic-green">{issues.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Most Common</span>
                  <Badge variant="secondary">Potholes</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Resolution Rate</span>
                  <span className="font-semibold text-civic-green">
                    {issues.length > 0 
                      ? Math.round((issues.filter(i => i.status === 'resolved').length / issues.length) * 100)
                      : 0
                    }%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card className="shadow-card-civic">
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredIssues.slice(0, 5).map((issue) => (
                  <div key={issue.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                    <div 
                      className={`w-3 h-3 rounded-full mt-1 ${
                        statusColors[issue.status as keyof typeof statusColors] || 'bg-gray-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {issue.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {issue.address || 'Location provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMap;