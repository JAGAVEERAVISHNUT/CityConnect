import { useState } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, Bell, User } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";

const Header = () => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">CityConnect</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Report Issue
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              View Map
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              My Reports
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <NotificationCenter />
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="civic" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Report Issue
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                View Map
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                My Reports
              </a>
              <div className="flex flex-col space-y-2 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" className="justify-start">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="civic" size="sm" className="justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;