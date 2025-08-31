import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MapIssue {
  id: string;
  title: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string | null;
  created_at: string;
}

interface InteractiveMapProps {
  issues: MapIssue[];
  height?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ issues, height = '600px' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isMapEnabled, setIsMapEnabled] = useState(false);

  // Check if we have mapbox token from Supabase secrets
  useEffect(() => {
    checkMapboxToken();
  }, []);

  const checkMapboxToken = async () => {
    try {
      // Try to get token from edge function secrets (if available)
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`https://dtcvexdklcxcyqywhnva.supabase.co/functions/v1/get-mapbox-token`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setMapboxToken(data.token);
          setIsMapEnabled(true);
          initializeMap(data.token);
        } else {
          setShowTokenInput(true);
        }
      } else {
        setShowTokenInput(true);
      }
    } catch (error) {
      setShowTokenInput(true);
    }
  };

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [78.9629, 20.5937], // India center
      zoom: 5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add issue markers
    addIssueMarkers();
  };

  const addIssueMarkers = () => {
    if (!map.current) return;

    const statusColors = {
      submitted: '#3b82f6',
      acknowledged: '#eab308',
      assigned: '#a855f7',
      in_progress: '#f97316',
      resolved: '#22c55e',
    };

    issues.forEach((issue) => {
      if (issue.latitude && issue.longitude) {
        const color = statusColors[issue.status as keyof typeof statusColors] || '#6b7280';
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = color;
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${issue.title}</h3>
            <p class="text-xs text-gray-600">${issue.category.replace('_', ' ')}</p>
            <p class="text-xs text-gray-500">${issue.address || 'Location provided'}</p>
            <span class="inline-block px-2 py-1 text-xs rounded" style="background-color: ${color}; color: white;">
              ${issue.status.replace('_', ' ')}
            </span>
          </div>
        `);

        new mapboxgl.Marker(el)
          .setLngLat([issue.longitude, issue.latitude])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setIsMapEnabled(true);
      setShowTokenInput(false);
      initializeMap(mapboxToken);
      toast({
        title: "Map Enabled",
        description: "Interactive map is now active with your Mapbox token.",
      });
    }
  };

  if (showTokenInput) {
    return (
      <Card style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-md">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Enable Interactive Map</h3>
            <p className="text-sm text-muted-foreground">
              To view the interactive map, please enter your Mapbox public token. 
              Get yours from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
            </p>
            <div className="space-y-2">
              <Input
                placeholder="Enter your Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <Button onClick={handleTokenSubmit} className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Enable Map
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isMapEnabled) {
    return (
      <Card style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{issues.length}</span>
          <span className="text-muted-foreground">issues on map</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;