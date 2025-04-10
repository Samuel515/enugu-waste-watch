import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MapPin, Clock } from "lucide-react";
import { DayContentProps } from "react-day-picker";

// Mock data
const MOCK_SCHEDULE = [
  {
    date: new Date(2025, 3, 10), // April 10, 2025
    areas: [
      { name: "Independence Layout", time: "09:00 AM - 12:00 PM" },
      { name: "New Haven", time: "01:00 PM - 04:00 PM" },
    ],
  },
  {
    date: new Date(2025, 3, 12), // April 12, 2025
    areas: [
      { name: "Achara Layout", time: "08:00 AM - 11:00 AM" },
      { name: "Trans Ekulu", time: "01:00 PM - 04:00 PM" },
    ],
  },
  {
    date: new Date(2025, 3, 15), // April 15, 2025
    areas: [
      { name: "GRA", time: "09:00 AM - 12:00 PM" },
      { name: "Abakpa Nike", time: "02:00 PM - 05:00 PM" },
    ],
  },
];

const ScheduleCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");

  // Function to check if a date has a schedule
  const hasSchedule = (date: Date | undefined) => {
    if (!date) return false;
    
    return MOCK_SCHEDULE.some(
      (schedule) =>
        schedule.date.getDate() === date.getDate() &&
        schedule.date.getMonth() === date.getMonth() &&
        schedule.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to get schedule for a specific date
  const getScheduleForDate = (date: Date | undefined) => {
    if (!date) return undefined;
    
    return MOCK_SCHEDULE.find(
      (schedule) =>
        schedule.date.getDate() === date.getDate() &&
        schedule.date.getMonth() === date.getMonth() &&
        schedule.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to render date cell
  const renderDateCell = (date: Date | undefined) => {
    if (date && hasSchedule(date)) {
      return <div className="bg-waste-green/20 w-full h-full rounded-full flex items-center justify-center" />;
    }
    return null;
  };

  // Sort schedule by date for list view
  const sortedSchedule = [...MOCK_SCHEDULE].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Collection Schedule</CardTitle>
            <CardDescription>
              View upcoming waste collection in your area
            </CardDescription>
          </div>
          <div>
            <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list")}>
              <TabsList className="grid grid-cols-2 w-[200px]">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={view} className="w-full">
          <TabsContent value="calendar" className="mt-0">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border w-full"
                  components={{
                    DayContent: (props: DayContentProps) => (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <div>{props.day}</div>
                        {renderDateCell(props.date)}
                      </div>
                    ),
                  }}
                />
              </div>
              <div>
                {selectedDate && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    
                    {getScheduleForDate(selectedDate) ? (
                      <div className="space-y-4">
                        <div>
                          <Badge className="bg-waste-green mb-2">
                            <Truck className="h-3 w-3 mr-1" />
                            Collection Day
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            Waste collection is scheduled for the areas listed below.
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          {getScheduleForDate(selectedDate)?.areas.map((area, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-md bg-secondary/40"
                            >
                              <div className="flex items-center mb-1">
                                <MapPin className="h-4 w-4 text-waste-green mr-1" />
                                <span className="font-medium">{area.name}</span>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{area.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Please ensure your waste is properly bagged and placed in the
                            designated bins before the collection time.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">
                          No waste collection scheduled for this date.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <div className="space-y-4">
              {sortedSchedule.length > 0 ? (
                sortedSchedule.map((schedule, scheduleIndex) => (
                  <div key={scheduleIndex} className="border rounded-md p-4">
                    <div className="mb-3">
                      <h3 className="font-medium">
                        {schedule.date.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      <Badge className="bg-waste-green mt-1">
                        <Truck className="h-3 w-3 mr-1" />
                        Collection Day
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {schedule.areas.map((area, areaIndex) => (
                        <div
                          key={areaIndex}
                          className="p-3 border rounded-md bg-secondary/40"
                        >
                          <div className="flex items-center mb-1">
                            <MapPin className="h-4 w-4 text-waste-green mr-1" />
                            <span className="font-medium">{area.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{area.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    No upcoming waste collections scheduled.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;
