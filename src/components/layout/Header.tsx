
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, X, Bell, LogOut, Settings, User } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { isMobile } = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [hasCollectionToday, setHasCollectionToday] = useState(false);
  
  // Function to get initials from user name
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Get notification count from localStorage
  const getReadNotificationsFromStorage = (): string[] => {
    try {
      const storedIds = localStorage.getItem('readNotifications');
      return storedIds ? JSON.parse(storedIds) : [];
    } catch (e) {
      console.error('Error parsing read notifications from storage:', e);
      return [];
    }
  };

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadNotificationsCount = async () => {
      if (!user) {
        setUnreadNotificationsCount(0);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id')
          .or(`for_user_id.eq.${user.id},for_all.eq.true`) as any;
          
        if (error) throw error;
        
        if (data) {
          const readIds = getReadNotificationsFromStorage();
          const unreadCount = data.filter(item => !readIds.includes(item.id)).length;
          setUnreadNotificationsCount(unreadCount);
        }
      } catch (error) {
        console.error('Error fetching notifications count:', error);
      }
    };

    // Check for collection today
    const checkCollectionToday = async () => {
      if (!user || !user.area) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data, error } = await supabase
          .from('pickup_schedules')
          .select('*')
          .eq('area', user.area)
          .eq('status', 'scheduled')
          .gte('pickup_date', today.toISOString())
          .lt('pickup_date', tomorrow.toISOString()) as any;

        if (error) throw error;
        
        setHasCollectionToday(data && data.length > 0);
      } catch (error) {
        console.error('Error checking collection today:', error);
      }
    };

    fetchUnreadNotificationsCount();
    checkCollectionToday();

    // Set up interval to refresh
    const interval = setInterval(() => {
      fetchUnreadNotificationsCount();
      checkCollectionToday();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  return (
    <header className="border-b bg-background sticky top-0 z-20">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon.svg" alt="Logo" className="h-8 w-8" />
          <span className="font-bold text-lg hidden sm:inline">Waste Watch</span>
        </Link>

        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        )}

        {/* Navigation - Desktop */}
        {!isMobile && (
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Home
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  Reports
                </NavLink>
                
                <NavLink
                  to="/schedule"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  Schedule
                </NavLink>
                
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary relative ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  Notifications
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-3 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </NavLink>
              </>
            )}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              FAQ
            </NavLink>
          </nav>
        )}

        {/* Auth buttons or User menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {!isMobile && (
                <NavLink 
                  to="/notifications"
                  className="mr-2 relative p-2 rounded-full hover:bg-accent"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </NavLink>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications" className="cursor-pointer flex w-full items-center">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-[10px] px-1.5">
                          {unreadNotificationsCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  {hasCollectionToday && (
                    <DropdownMenuItem className="bg-blue-50 text-blue-800">
                      <Bell className="mr-2 h-4 w-4 text-blue-600" />
                      <span>Collection today in your area</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/auth?tab=login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?tab=register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation */}
      {isMobile && isMenuOpen && (
        <div className="md:hidden p-4 border-t bg-background">
          <nav className="flex flex-col space-y-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
              onClick={closeMenu}
            >
              Home
            </NavLink>
            {user && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                  onClick={closeMenu}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                  onClick={closeMenu}
                >
                  Reports
                </NavLink>
                <NavLink
                  to="/schedule"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                  onClick={closeMenu}
                >
                  Schedule
                </NavLink>
                <NavLink
                  to="/notifications"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary relative ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                  onClick={closeMenu}
                >
                  Notifications
                  {unreadNotificationsCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-[10px] px-1.5">
                      {unreadNotificationsCount}
                    </Badge>
                  )}
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                  onClick={closeMenu}
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`
                  }
                  onClick={closeMenu}
                >
                  Settings
                </NavLink>
              </>
            )}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
              onClick={closeMenu}
            >
              About
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
              onClick={closeMenu}
            >
              FAQ
            </NavLink>
            {user && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
