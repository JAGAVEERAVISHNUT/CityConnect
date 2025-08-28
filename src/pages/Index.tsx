import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import IssueCategories from "@/components/IssueCategories";
import MapSection from "@/components/MapSection";
import IssueReportForm from "@/components/IssueReportForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, Clock, CheckCircle } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Redirect authenticated users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How CityConnect Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Making community engagement simple and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center shadow-card-civic hover:shadow-civic transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle>1. Report Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Spot a problem? Take a photo, select the category, and submit your report. 
                  We'll handle the rest.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card-civic hover:shadow-civic transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <CardTitle>2. Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get real-time updates as your report moves through the system. 
                  Stay informed every step of the way.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-card-civic hover:shadow-civic transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-civic-green to-civic-teal rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <CardTitle>3. See Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Watch as your community improves. Get notified when issues are resolved 
                  and see the positive impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Issue Categories Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Can You Report?
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose from these common issue categories or suggest a new one
            </p>
          </div>

          <IssueCategories 
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />

          {selectedCategory && (
            <div className="text-center mt-8">
              <Link to="/report-issue">
                <Button variant="civic" size="lg">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Report {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Issue
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <MapSection />

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of engaged citizens who are already using CityConnect 
            to improve their communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="hero" size="lg">
                Get Started Today
              </Button>
            </Link>
            <Link to="/community-map">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-civic-navy text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-primary rounded-md"></div>
            <span className="text-lg font-semibold">CityConnect</span>
          </div>
          <p className="text-blue-200">
            Connecting communities with local government for better neighborhoods.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;