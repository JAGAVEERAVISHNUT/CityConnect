import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, MapPin, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ISSUE_CATEGORIES = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'water_leak', label: 'Water Leak' },
  { value: 'broken_streetlight', label: 'Broken Streetlight' },
  { value: 'graffiti', label: 'Graffiti' },
  { value: 'illegal_dumping', label: 'Illegal Dumping' },
  { value: 'traffic_signal', label: 'Traffic Signal' },
  { value: 'noise_complaint', label: 'Noise Complaint' },
  { value: 'tree_maintenance', label: 'Tree Maintenance' },
];

export default function IssueReportForm({ onIssueSubmitted }: { readonly onIssueSubmitted?: () => void }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // Reverse geocoding could be added here to get address
          setAddress(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setGettingLocation(false);
          toast({
            title: "Location captured",
            description: "Your current location has been recorded.",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setGettingLocation(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter the address manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setGettingLocation(false);
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const uploadFiles = async (files: File[], issueId: string) => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${issueId}/${Date.now()}.${fileExt}`;
      const isVideo = file.type.startsWith('video/');
      const bucket = isVideo ? 'issue-videos' : 'issue-photos';
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${user?.id}/${fileName}`, file);
      
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      
      // Return the full public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(`${user?.id}/${fileName}`);
      
      return publicUrl;
    });

    const uploadedFiles = await Promise.all(uploadPromises);
    return uploadedFiles.filter(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;

      // Get AI-powered priority classification
      let priority = 2; // Default to Medium
      try {
        const { data: priorityData } = await supabase.functions.invoke('classify-issue-priority', {
          body: { title, description, category }
        });
        
        if (priorityData?.priority) {
          priority = priorityData.priority;
          console.log('AI classified priority:', priorityData);
        }
      } catch (priorityError) {
        console.warn('Priority classification failed, using default:', priorityError);
      }

      // First create the issue
      const { data: issue, error: issueError } = await supabase
        .from('issues')
        .insert([{
          user_id: user.id,
          title,
          description,
          category: category as
            | "pothole"
            | "water_leak"
            | "broken_streetlight"
            | "graffiti"
            | "illegal_dumping"
            | "traffic_signal"
            | "noise_complaint"
            | "tree_maintenance",
          priority,
          latitude: location?.lat ? Number(location.lat) : null,
          longitude: location?.lng ? Number(location.lng) : null,
          address: address || null,
        }])
        .select()
        .single();

      if (issueError) throw issueError;

      // Upload files if any
      let uploadedPhotos: string[] = [];
      let uploadedVideos: string[] = [];

      if (selectedFiles.length > 0) {
        const photoFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
        const videoFiles = selectedFiles.filter(f => f.type.startsWith('video/'));

        if (photoFiles.length > 0) {
          uploadedPhotos = await uploadFiles(photoFiles, issue.id);
        }
        if (videoFiles.length > 0) {
          uploadedVideos = await uploadFiles(videoFiles, issue.id);
        }

        // Update issue with file URLs
        await supabase
          .from('issues')
          .update({
            photos: uploadedPhotos,
            videos: uploadedVideos,
          })
          .eq('id', issue.id);
      }

      toast({
        title: "Issue Reported!",
        description: "Your issue has been submitted successfully.",
      });

      setIsOpen(false);
      if (onIssueSubmitted) onIssueSubmitted();
      
      // Reset form
      e.currentTarget.reset();
      setSelectedFiles([]);
      setLocation(null);
      setAddress('');

    } catch (error: unknown) {
      console.error('Error submitting issue:', error);
      let errorMessage = "Failed to submit issue. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertDescription>
          Please sign in to report an issue.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="civic" size="lg" className="shadow-lg">
          <Plus className="h-5 w-5 mr-2" />
          Report Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report New Issue</DialogTitle>
          <DialogDescription>
            Help improve your community by reporting issues that need attention.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Brief description of the issue"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select name="category" required disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue category" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide additional details about the issue..."
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={gettingLocation || isSubmitting}
                className="w-full"
              >
                {gettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Use Current Location
                  </>
                )}
              </Button>
              <Input
                placeholder="Or enter address manually"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos/Videos</Label>
            <Input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            {selectedFiles.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedFiles.length} file(s) selected
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Issue'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}