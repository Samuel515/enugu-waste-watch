import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface PickupScheduleItem {
  id: string;
  area: string;
  pickup_date: string;
  status: string;
  notes?: string;
}

const PickupSchedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nextPickupForUserArea, setNextPickupForUserArea] = useState<PickupScheduleItem | null>(null);
  const [upcomingPickups, setUpcomingPickups] = useState<PickupScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch pickup schedules from Supabase
  useEffect(() => {
    const fetchPickupSchedules = async () => {
      try {
        setIsLoading(true);
        
        // Get current date in ISO format
        const now = new Date().toISOString();
        
        // Fetch upcoming pickups (scheduled for today or future dates)
        const { data, error } = await supabase
          .from('pickup_schedules')
          .select('*')
          .gte('pickup_date', now)
          .eq('status', 'scheduled')
          .order('pickup_date', { ascending: true })
          .limit(3) as any;
        
        if (error) throw error;
        
        if (data) {
          setUpcomingPickups(data);
          
          // Find the next pickup for user's area if user has an area set
          if (user && user.area) {
            const userAreaPickup = data.find((pickup: PickupScheduleItem) => 
              pickup.area.toLowerCase() === user.area.toLowerCase()
            );
            
            if (userAreaPickup) {
              setNextPickupForUserArea(userAreaPickup);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching pickup schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load pickup schedules",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPickupSchedules();
  }, [user, toast]);

  const formatPickupDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "MMM d, yyyy");
    } catch (error) {
      return dateStr;
    }
  };

  const formatPickupTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "h:mm a");
    } catch (error) {
      return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Pickups</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-6">
            <LoaderCircle className="h-8 w-8 text-waste-green animate-spin mb-2" />
            <p className="text-muted-foreground">Loading schedules...</p>
          </div>
        ) : (
          <>
            {nextPickupForUserArea && (
              <div className="mb-4 p-3 border-l-4 border-waste-green bg-waste-green/5 rounded">
                <p className="font-medium">Next collection in your area:</p>
                <p className="text-sm text-waste-green">{nextPickupForUserArea.area}</p>
                <p className="text-xs">{formatPickupDate(nextPickupForUserArea.pickup_date)}, {formatPickupTime(nextPickupForUserArea.pickup_date)}</p>
              </div>
            )}
            
            {upcomingPickups.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No upcoming pickups scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingPickups.map((pickup) => (
                  <div
                    key={pickup.id}
                    className="flex flex-col p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-waste-green/10 p-2 rounded-full">
                        <Calendar className="h-4 w-4 text-waste-green" />
                      </div>
                      <div>
                        <p className="font-medium">{pickup.area}</p>
                        <p className="text-sm text-muted-foreground">{formatPickupDate(pickup.pickup_date)}</p>
                      </div>
                    </div>
                    <p className="text-sm">{formatPickupTime(pickup.pickup_date)}</p>
                    {pickup.notes && <p className="text-xs text-muted-foreground mt-1">{pickup.notes}</p>}
                  </div>
                ))}
                
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to="/schedule" className="flex items-center justify-center gap-2">
                    <span>View Full Schedule</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PickupSchedule;
