import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Issue {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  address: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const STATUS_COLORS = {
  submitted: 'bg-blue-500',
  acknowledged: 'bg-yellow-500',
  assigned: 'bg-purple-500',
  in_progress: 'bg-orange-500',
  on_hold: 'bg-gray-500',
  resolved: 'bg-green-500',
} as const;

const STATUS_LABELS = {
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  resolved: 'Resolved',
} as const;

export default function IssuesList({ showUserIssuesOnly = false }: { showUserIssuesOnly?: boolean }) {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, [user, showUserIssuesOnly]);

  useEffect(() => {
    // Subscribe to real-time updates for issues
    const channel = supabase
      .channel('issues-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchIssues(); // Refetch issues when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIssues = async () => {
    try {
      let query = supabase
        .from('issues')
        .select(`
          *,
          profiles!issues_user_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (showUserIssuesOnly && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching issues:', error);
        // Fallback query without profiles join
        const fallbackQuery = supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (showUserIssuesOnly && user) {
          fallbackQuery.eq('user_id', user.id);
        }
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) throw fallbackError;
        
        setIssues((fallbackData || []).map(issue => ({
          ...issue,
          profiles: null
        })));
      } else {
        setIssues((data as any) || []);
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
        <p className="text-muted-foreground">
          {showUserIssuesOnly 
            ? "You haven't reported any issues yet." 
            : "No issues have been reported in your area yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <Card key={issue.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {issue.profiles?.first_name || 'Anonymous'} {issue.profiles?.last_name || ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                  </span>
                </CardDescription>
              </div>
              <Badge 
                variant="secondary" 
                className={`${STATUS_COLORS[issue.status as keyof typeof STATUS_COLORS]} text-white`}
              >
                {STATUS_LABELS[issue.status as keyof typeof STATUS_LABELS]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {issue.description && (
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {issue.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {issue.address && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {issue.address}
                    </span>
                  )}
                </div>
                
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}