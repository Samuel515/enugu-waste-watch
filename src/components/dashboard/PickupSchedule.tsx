
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Truck } from "lucide-react";

// Mock data for the pickup schedule
const MOCK_SCHEDULE = [
  {
    id: 1,
    area: "Independence Layout",
    date: "2025-04-10",
    time: "09:00 AM - 12:00 PM",
    status: "scheduled",
  },
  {
    id: 2,
    area: "New Haven",
    date: "2025-04-11",
    time: "01:00 PM - 04:00 PM",
    status: "scheduled",
  },
  {
    id: 3,
    area: "Achara Layout",
    date: "2025-04-12",
    time: "08:00 AM - 11:00 AM",
    status: "scheduled",
  },
];

const PickupSchedule = () => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const date = new Date(dateString);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Pickups</CardTitle>
        <CardDescription>Your area's waste collection schedule</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {MOCK_SCHEDULE.map((schedule) => (
            <div key={schedule.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-waste-green" />
                  <h4 className="font-medium">{schedule.area}</h4>
                </div>
                {isToday(schedule.date) ? (
                  <Badge className="bg-waste-green">Today</Badge>
                ) : isTomorrow(schedule.date) ? (
                  <Badge variant="outline" className="border-waste-yellow text-waste-yellow">
                    Tomorrow
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                    Upcoming
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(schedule.date)}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{schedule.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PickupSchedule;
