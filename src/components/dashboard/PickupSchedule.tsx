
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Clock } from "lucide-react";

// Mock data for upcoming pickups
const UPCOMING_PICKUPS = [
  {
    id: 1,
    area: "Independence Layout",
    date: new Date(2025, 3, 13), // April 13, 2025
    time: "9:00 AM - 12:00 PM",
  },
  {
    id: 2,
    area: "New Haven",
    date: new Date(2025, 3, 16), // April 16, 2025
    time: "1:00 PM - 4:00 PM",
  },
  {
    id: 3,
    area: "GRA",
    date: new Date(2025, 3, 10), // April 10, 2025
    time: "8:00 AM - 11:00 AM",
  },
];

const PickupSchedule = () => {
  // Sort pickups by date (newest first)
  const sortedPickups = [...UPCOMING_PICKUPS].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Format date to be more readable
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Pickups</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {sortedPickups.map((pickup) => (
          <div 
            key={pickup.id} 
            className="border rounded-md p-3 space-y-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-1 sm:mb-0 font-medium">{formatDate(pickup.date)}</div>
              <div className="inline-flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {pickup.time}
              </div>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-1 text-waste-green" />
              <span>{pickup.area}</span>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <a href="/schedule" className="text-sm text-waste-green hover:underline">
            View full schedule
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default PickupSchedule;
