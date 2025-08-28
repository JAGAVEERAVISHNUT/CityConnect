import { Button } from "@/components/ui/button";
import { MapPin, Camera } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-hero text-white py-24 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)]"></div>
      </div>

      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span>Your Community, </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-teal-200">
              Your Voice
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Report issues, track progress, and help make your neighborhood better. 
            Connect directly with local government and see real change happen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/report-issue">
              <Button variant="hero" size="lg" className="min-w-[200px]">
                <Camera className="w-5 h-5 mr-2" />
                Report an Issue
              </Button>
            </Link>
            <Link to="/community-map">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                <MapPin className="w-5 h-5 mr-2" />
                View Community Map
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-200">2,847</div>
              <div className="text-blue-100">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-200">48 hrs</div>
              <div className="text-blue-100">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-200">95%</div>
              <div className="text-blue-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;