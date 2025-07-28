
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusCircle, Trash2, Calendar as CalendarIcon2, LoaderCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, setHours, setMinutes, parse, startOfDay, isSameDay, isBefore } from "date-fns";
import { PickupSchedule } from "@/types/reports";
import enuguLocations from "@/data/locations";

const UpdateSchedules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [area, setArea] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("08:00"); // Default time 8:00 AM
  const [notes, setNotes] = useState("");
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
  const [areas, setAreas] = useState<string[]>(enuguLocations);
  
  // Generate time options from 6:00 AM to 8:00 PM in 30-minute increments
  const timeOptions = Array.from({ length: 29 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const minute = i % 2 === 0 ? "00" : "30";
    const period = hour < 12 || hour === 24 ? "AM" : "PM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return {
      value: `${hour.toString().padStart(2, "0")}:${minute}`,
      label: `${displayHour}:${minute} ${period}`
    };
  });
  
  // Fetch existing schedules and unique areas
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        
        // Fetch schedules - only future and today's schedules
        const today = startOfDay(new Date());
        
        const { data: schedulesData, error: schedulesError } = await supabase
          .from('pickup_schedules')
          .select('*')
          .gte('pickup_date', today.toISOString())
          .order('pickup_date', { ascending: true }) as any;
          
        if (schedulesError) throw schedulesError;
        
        // Set schedules
        if (schedulesData) {
          setSchedules(schedulesData as PickupSchedule[]);
        }
        
        // Set default area if none selected
        if (!area && areas.length > 0) {
          setArea(areas[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load schedules or areas",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, [area, areas.length, toast]);

  const combineDateAndTime = (date?: Date, timeStr = "00:00"): Date => {
    if (!date) return new Date();
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    return setMinutes(setHours(date, hours), minutes);
  };

  const handleCreateSchedule = async () => {
    if (!date || !area) {
      toast({
        title: "Missing information",
        description: "Please select an area and date for the pickup",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCreating(true);
      
      const combinedDateTime = combineDateAndTime(date, time);
      
      const newSchedule = {
        area,
        pickup_date: combinedDateTime.toISOString(),
        notes: notes.trim() || null,
        status: "scheduled",
        created_by: user?.id
      } as any;
      
      const { data, error } = await supabase
        .from('pickup_schedules')
        .insert(newSchedule)
        .select() as any;
        
      if (error) throw error;
      
      if (data) {
        // Add new schedule to list
        setSchedules([...schedules, data[0] as PickupSchedule]);
        
        // Clear form
        setNotes("");
        
        toast({
          title: "Schedule created",
          description: `Pickup scheduled for ${area} on ${format(combinedDateTime, 'PPP')} at ${format(combinedDateTime, 'h:mm a')}`
        });
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Failed to create schedule",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pickup_schedules')
        .delete()
        .eq('id', id) as any;
        
      if (error) throw error;
      
      // Remove from list
      setSchedules(schedules.filter(s => s.id !== id));
      
      toast({
        title: "Schedule deleted",
        description: "The pickup schedule has been removed"
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Failed to delete schedule",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const updateScheduleStatus = async (id: string, status: "scheduled" | "completed" | "cancelled") => {
    try {
      setIsUpdating(prev => ({ ...prev, [id]: true }));
      
      const { error } = await supabase
        .from('pickup_schedules')
        .update({ status })
        .eq('id', id) as any;
        
      if (error) throw error;
      
      // Update in list
      setSchedules(schedules.map(s => 
        s.id === id ? { ...s, status } : s
      ));
      
      toast({
        title: "Status updated",
        description: `Schedule has been marked as ${status}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Failed to update status",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Properly determine if a date is today (regardless of time)
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  };

  // Filter out past schedules - only display today and future schedules
  const currentSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.pickup_date);
    return !isBefore(scheduleDate, startOfDay(new Date())) || isToday(scheduleDate);
  });

  return (
    <Layout requireAuth allowedRoles={["official", "admin"]}>
      <div className="container py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Update Pickup Schedules</h1>
          <p className="text-muted-foreground">
            Create and manage waste collection schedules
          </p>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-1 max-h-max">
            <CardHeader>
              <CardTitle>Create New Schedule</CardTitle>
              <CardDescription>
                Schedule a new pickup for a specific area
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map((areaOption) => (
                      <SelectItem key={areaOption} value={areaOption}>
                        {areaOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Pickup Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => isBefore(date, startOfDay(new Date())) && !isToday(date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Pickup Time</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional information"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleCreateSchedule}
                disabled={!date || !area || isCreating}
              >
                {isCreating ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Schedule
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 h-[400px] lg:h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Existing Schedules</CardTitle>
              <CardDescription>
                View and manage all waste collection schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {isLoading ? (
                <div className="text-center py-10">
                  <LoaderCircle className="mx-auto h-8 w-8 text-waste-green animate-spin mb-2" />
                  <p>Loading schedules...</p>
                </div>
              ) : currentSchedules.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarIcon2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No schedules found</p>
                  <p className="text-xs text-muted-foreground">Create a new schedule to see it here</p>
                </div>
              ) : (
                <div className="rounded-md border h-full flex flex-col overflow-x-auto">
                  <div className="border-b">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[100px]">Area</TableHead>
                          <TableHead className="min-w-[90px]">Date</TableHead>
                          <TableHead className="min-w-[70px]">Time</TableHead>
                          <TableHead className="min-w-[80px]">Status</TableHead>
                          <TableHead className="min-w-[100px] hidden sm:table-cell">Notes</TableHead>
                          <TableHead className="text-right min-w-[140px] sm:min-w-[200px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    </Table>
                  </div>
                  <ScrollArea className="flex-1">
                    <Table>
                      <TableBody>
                        {currentSchedules.map((schedule) => {
                          const pickupDate = new Date(schedule.pickup_date);
                          
                          return (
                            <TableRow key={schedule.id}>
                              <TableCell>{schedule.area}</TableCell>
                              <TableCell>{format(pickupDate, 'PP')}</TableCell>
                              <TableCell>{format(pickupDate, 'h:mm a')}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeClass(schedule.status)}>
                                  {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate hidden sm:table-cell">
                                {schedule.notes || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2">
                                  {schedule.status !== "completed" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-[44px] text-xs sm:text-sm"
                                      onClick={() => updateScheduleStatus(schedule.id, "completed")}
                                      disabled={isUpdating[schedule.id]}
                                    >
                                      {isUpdating[schedule.id] ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <span className="hidden sm:inline">Mark Complete</span>
                                      )}
                                      <span className="sm:hidden">✓</span>
                                    </Button>
                                  )}
                                  
                                  {schedule.status !== "cancelled" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="min-h-[44px] text-xs sm:text-sm"
                                      onClick={() => updateScheduleStatus(schedule.id, "cancelled")}
                                      disabled={isUpdating[schedule.id]}
                                    >
                                      {isUpdating[schedule.id] ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <span className="hidden sm:inline">Cancel</span>
                                      )}
                                      <span className="sm:hidden">✕</span>
                                    </Button>
                                  )}
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 min-h-[44px] text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateSchedules;
