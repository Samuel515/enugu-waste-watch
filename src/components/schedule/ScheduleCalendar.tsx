
import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, List } from "lucide-react";

interface CollectionEvent {
  id: number;
  date: Date;
  area: string;
  time: string;
  type: string;
}

const ScheduleCalendar = () => {
  const [events, setEvents] = useState<CollectionEvent[]>([]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Mock data for waste collection events
  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const mockEvents: CollectionEvent[] = [
      {
        id: 1,
        date: new Date(currentYear, currentMonth, 15),
        area: "Independence Layout",
        time: "9:00 AM - 11:00 AM",
        type: "General Waste"
      },
      {
        id: 2,
        date: new Date(currentYear, currentMonth, 16),
        area: "New Haven",
        time: "1:00 PM - 3:00 PM",
        type: "Recyclables"
      },
      {
        id: 3,
        date: new Date(currentYear, currentMonth, 17),
        area: "Trans-Ekulu",
        time: "10:00 AM - 12:00 PM",
        type: "General Waste"
      },
      {
        id: 4,
        date: new Date(currentYear, currentMonth, 18),
        area: "Ogui Road",
        time: "8:00 AM - 10:00 AM",
        type: "General Waste"
      },
      {
        id: 5,
        date: new Date(currentYear, currentMonth, 19),
        area: "GRA",
        time: "2:00 PM - 4:00 PM",
        type: "Recyclables"
      },
      {
        id: 6,
        date: new Date(currentYear, currentMonth, 20),
        area: "Uwani",
        time: "9:00 AM - 11:00 AM",
        type: "General Waste"
      },
      {
        id: 7,
        date: new Date(currentYear, currentMonth, 22),
        area: "Abakpa",
        time: "1:00 PM - 3:00 PM",
        type: "General Waste"
      },
      {
        id: 8,
        date: new Date(currentYear, currentMonth, 24),
        area: "Coal Camp",
        time: "10:00 AM - 12:00 PM",
        type: "Recyclables"
      }
    ];
    
    setEvents(mockEvents);
  }, []);
  
  const eventsForSelectedDate = events.filter(
    (event) => selectedDate && event.date.toDateString() === selectedDate.toDateString()
  );
  
  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Custom day renderer that adds indicator for events
  const renderDay = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const day = props["aria-label"];
    
    if (!day) return <div {...props} />;
    
    const dateStr = day.split(" ").slice(0, 3).join(" ");
    const hasEvent = events.some((event) => 
      event.date.toDateString() === new Date(dateStr).toDateString()
    );
    
    return (
      <div {...props} className={props.className}>
        {props.children}
        {hasEvent && (
          <div className="h-1.5 w-1.5 bg-waste-green rounded-full absolute bottom-1 left-1/2 transform -translate-x-1/2" />
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col xs:flex-row items-center justify-between mb-6 gap-2">
          <h3 className="text-xl font-medium">Collection Schedule</h3>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendar
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4 mr-1" />
              List View
            </Button>
          </div>
        </div>
        
        {view === "calendar" && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-auto">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  setDate(selectedDate);
                  setSelectedDate(selectedDate);
                }}
                className="rounded-md border w-full"
                components={{
                  Day: ({ day, ...props }: any) => renderDay(props)
                }}
              />
            </div>
            
            <div className="flex-1 border rounded-md p-4">
              <h3 className="font-medium mb-4">
                {selectedDate
                  ? `Events for ${selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric"
                    })}`
                  : "No date selected"}
              </h3>
              
              {!eventsForSelectedDate.length ? (
                <p className="text-muted-foreground text-sm">
                  No waste collection scheduled for this date.
                </p>
              ) : (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <div
                      key={event.id}
                      className="border rounded-md p-3 bg-muted/30"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{event.area}</h4>
                          <p className="text-sm">{event.time}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {view === "list" && (
          <div className="space-y-4">
            {sortedEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming waste collections scheduled.
              </p>
            ) : (
              sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className={`border rounded-md p-4 ${
                    selectedDate &&
                    event.date.toDateString() === selectedDate.toDateString()
                      ? "border-waste-green bg-waste-green/5"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-waste-green">
                        {event.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                      <h4 className="font-medium mt-1">{event.area}</h4>
                      <p className="text-sm">{event.time}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;
