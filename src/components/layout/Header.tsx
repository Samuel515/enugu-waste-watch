
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Leaf, Menu, UserCircle, LogOut, Settings } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const { hasNewNotifications } = useNotifications();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Report Waste", href: "/report" },
    { label: "Pickup Schedule", href: "/schedule" },
    { label: "Notifications", href: "/notifications" },
  ];

  const officialMenuItems = [
    { label: "Manage Reports", href: "/manage-reports" },
    { label: "Update Schedules", href: "/update-schedules" },
  ];

  const adminMenuItems = [
    { label: "Analytics", href: "/analytics" },
    { label: "Manage Users", href: "/manage-users" },
    { label: "Settings", href: "/settings" },
  ];
  
  const allMenuItems = [...menuItems, 
                         ...(user?.role === "official" ? officialMenuItems : []),
                         ...(user?.role === "admin" ? adminMenuItems : [])];
  
  // Determine if page requires auth to prevent homepage routing
  const isAuthenticatedPage = user && window.location.pathname !== "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isAuthenticatedPage ? (
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-waste-green" />
              <span className="text-lg font-bold xs:text-xs sm:text-sm md:text-lg lg:text-xl">Enugu Waste Watch</span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-waste-green" />
              <span className="text-lg font-bold xs:text-xs sm:text-sm md:text-lg lg:text-xl">Enugu Waste Watch</span>
            </Link>
          )}
        </div>

        {/* Desktop Navigation - Only show on non-mobile */}
        {user && !isMobile && (
          <nav className="flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium transition-colors hover:text-primary relative"
              >
                {item.label}
                {item.href === "/notifications" && hasNewNotifications && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Link>
            ))}
            
            {user.role === "official" && officialMenuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            
            {user.role === "admin" && adminMenuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Only show user dropdown on non-mobile */}
              {!isMobile && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                      <UserCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary mt-1">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex w-full items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer flex w-full items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Button - Show on all screen sizes for consistency */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 md:hidden">
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                    {hasNewNotifications && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary mt-1 w-fit">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                    <div className="grid gap-2 py-6">
                      {allMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          className="flex w-full items-center py-2 text-sm font-medium transition-all hover:underline relative"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                          {item.href === "/notifications" && hasNewNotifications && (
                            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </Link>
                      ))}
                      {/* Add Profile and Settings links to mobile menu */}
                      <Link
                        to="/profile"
                        className="flex w-full items-center py-2 text-sm font-medium transition-all hover:underline"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex w-full items-center py-2 text-sm font-medium transition-all hover:underline"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              {/* For non-authenticated users, adjust for mobile */}
              {!isMobile && (
                <Button asChild variant="outline">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
              {!isMobile && (
                <Button asChild className="hidden md:block">
                  <Link to="/auth?tab=register">Sign Up</Link>
                </Button>
              )}
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="grid gap-4 py-6">
                      <Button asChild>
                        <Link to="/auth">Sign In</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link to="/auth?tab=register">Sign Up</Link>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
