
import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface CollectionEvent {
  id: string;
  date: Date;
  area: string;
  time: string;
  type: string;
  notes?: string;
  status: string;
}

const ScheduleCalendar = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CollectionEvent[]>([]);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch pickup schedules from Supabase
  useEffect(() => {
    const fetchPickupSchedules = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all scheduled pickups
        const { data, error } = await supabase
          .from('pickup_schedules')
          .select('*')
          .order('pickup_date', { ascending: true }) as any;
        
        if (error) throw error;
        
        if (data) {
          const formattedEvents: CollectionEvent[] = data.map((item: any) => ({
            id: item.id,
            date: new Date(item.pickup_date),
            area: item.area,
            time: format(new Date(item.pickup_date), "h:mm a"),
            type: "General Waste", // Default value as we don't have a type in the schema
            notes: item.notes,
            status: item.status
          }));
          
          setEvents(formattedEvents);
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
  }, [toast]);
  
  const eventsForSelectedDate = events.filter(
    (event) => selectedDate && event.date.toDateString() === selectedDate.toDateString()
  );
  
  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <p className="text-muted-foreground">Loading schedules...</p>
          </div>
        ) : view === "calendar" ? (
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
                modifiersClassNames={{
                  selected: "bg-primary text-primary-foreground",
                  today: "bg-accent text-accent-foreground",
                  eventDay: "bg-waste-green/10"
                }}
                modifiers={{
                  eventDay: (date) => {
                    if (!date) return false;
                    return events.some(event => 
                      event.date.toDateString() === date.toDateString() &&
                      event.status === 'scheduled'
                    );
                  }
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
                      className={`border rounded-md p-3 ${
                        event.status === 'scheduled' ? 'bg-muted/30' : 
                        event.status === 'completed' ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{event.area}</h4>
                          <p className="text-sm">{event.time}</p>
                          {event.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Note: {event.notes}
                            </p>
                          )}
                          <p className="text-xs mt-1">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              event.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                              event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
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
                  } ${
                    event.status === 'completed' ? 'bg-green-50' : 
                    event.status === 'cancelled' ? 'bg-red-50' : ''
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
                      {event.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Note: {event.notes}
                        </p>
                      )}
                      <p className="text-xs mt-2">
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          event.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                          event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
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
