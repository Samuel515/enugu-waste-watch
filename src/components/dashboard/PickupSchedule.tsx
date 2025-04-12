
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const PickupSchedule = () => {
  const { user } = useAuth();
  const [nextPickupForUserArea, setNextPickupForUserArea] = useState<{
    id: number;
    area: string;
    date: string;
    time: string;
  } | null>(null);
  
  // Mock data for upcoming pickups
  const upcomingPickups = [
    {
      id: 1,
      area: "Independence Layout",
      date: "2023-06-20",
      time: "9:00 AM - 11:00 AM"
    },
    {
      id: 2,
      area: "New Haven",
      date: "2023-06-22",
      time: "1:00 PM - 3:00 PM"
    },
    {
      id: 3,
      area: "Trans-Ekulu",
      date: "2023-06-25",
      time: "10:00 AM - 12:00 PM"
    }
  ];

  // Sort pickups by date (most recent first)
  const sortedPickups = [...upcomingPickups].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Find next pickup for user's area if user has an area set
  useEffect(() => {
    if (user && user.area) {
      const userAreaPickup = upcomingPickups.find(pickup => 
        pickup.area.toLowerCase() === user.area.toLowerCase()
      );
      
      if (userAreaPickup) {
        setNextPickupForUserArea(userAreaPickup);
      }
    }
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Pickups</CardTitle>
      </CardHeader>
      <CardContent>
        {nextPickupForUserArea && (
          <div className="mb-4 p-3 border-l-4 border-waste-green bg-waste-green/5 rounded">
            <p className="font-medium">Next collection in your area:</p>
            <p className="text-sm text-waste-green">{nextPickupForUserArea.area}</p>
            <p className="text-xs">{nextPickupForUserArea.date}, {nextPickupForUserArea.time}</p>
          </div>
        )}
        
        {sortedPickups.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No upcoming pickups scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedPickups.map((pickup) => (
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
                    <p className="text-sm text-muted-foreground">{pickup.date}</p>
                  </div>
                </div>
                <p className="text-sm">{pickup.time}</p>
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
      </CardContent>
    </Card>
  );
};

export default PickupSchedule;
