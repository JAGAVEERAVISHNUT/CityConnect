import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Filter, Layers } from "lucide-react";

const MapSection = () => {
  return (
    <section className="py-16 px-4 bg-civic-light">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Community Issue Map
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore what's happening in your neighborhood. See real-time updates on reported issues 
            and their resolution status across the community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Placeholder */}
          <div className="lg:col-span-2">
            <Card className="h-[500px] shadow-card-civic">
              <CardContent className="p-0 h-full">
                <div className="w-full h-full bg-gradient-to-br from-civic-teal/20 to-civic-blue/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Map pins mockup */}
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  
                  <div className="text-center z-10">
                    <MapPin className="w-12 h-12 text-civic-blue mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Interactive Community Map
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Real-time visualization of community issues
                    </p>
                    <Button variant="civic">
                      <Eye className="w-4 h-4 mr-2" />
                      View Full Map
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Controls & Stats */}
          <div className="space-y-6">
            <Card className="shadow-card-civic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Open Issues
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  In Progress
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Resolved
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card-civic">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Issues</span>
                  <span className="font-semibold text-foreground">23</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">This Week</span>
                  <span className="font-semibold text-civic-green">+12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Resolved</span>
                  <span className="font-semibold text-civic-blue">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Response Rate</span>
                  <span className="font-semibold text-civic-green">94%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;