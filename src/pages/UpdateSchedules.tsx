
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, PlusCircle, Trash2, Calendar as CalendarIcon2, LoaderCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse, set } from "date-fns";
import { PickupSchedule } from "@/types/reports";
import { enuguLocations } from "@/utils/locationData";

const UpdateSchedules = () => {
  const { user } = useAuth();
  const [area, setArea] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("08:00");
  const [notes, setNotes] = useState("");
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { toast } = useToast();
  
  // Fetch existing schedules and unique areas
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setIsLoading(true);
        
        // Fetch schedules
        const { data: schedulesData, error: schedulesError } = await supabase
          .from('pickup_schedules')
          .select('*')
          .order('pickup_date', { ascending: true }) as any;
          
        if (schedulesError) throw schedulesError;
        
        // Set schedules
        if (schedulesData) {
          setSchedules(schedulesData as PickupSchedule[]);
        }
        
        // Set default area if none selected
        if (!area && enuguLocations.length > 0) {
          setArea(enuguLocations[0]);
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
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!date || !area) {
      toast({
        title: "Missing information",
        description: "Please select an area and date for the pickup",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledDateTime = date ? set(date, { hours, minutes, seconds: 0 }) : null;
      
      if (!scheduledDateTime) {
        throw new Error("Invalid date or time");
      }
      
      const newSchedule = {
        area,
        pickup_date: scheduledDateTime.toISOString(),
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
          description: `Pickup scheduled for ${area} on ${format(scheduledDateTime, 'PPP')} at ${format(scheduledDateTime, 'h:mm a')}`
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
      setIsSaving(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      setIsDeleting(id);
      
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
    } finally {
      setIsDeleting(null);
    }
  };

  const updateScheduleStatus = async (id: string, status: "scheduled" | "completed" | "cancelled") => {
    try {
      setIsUpdatingStatus(id);
      
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
      setIsUpdatingStatus(null);
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

  return (
    <Layout requireAuth allowedRoles={["official", "admin"]}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Update Pickup Schedules</h1>
          <p className="text-muted-foreground">
            Create and manage waste collection schedules
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Create New Schedule</CardTitle>
              <CardDescription>
                Schedule a new pickup for a specific area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {enuguLocations.map((areaOption) => (
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Pickup Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
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
                  type="submit"
                  className="w-full" 
                  disabled={isSaving || !date || !area}
                >
                  {isSaving ? (
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
              </form>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Existing Schedules</CardTitle>
              <CardDescription>
                View and manage all waste collection schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-10">
                  <LoaderCircle className="h-8 w-8 text-waste-green animate-spin mb-2 mx-auto" />
                  <p>Loading schedules...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarIcon2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No schedules found</p>
                  <p className="text-xs text-muted-foreground">Create a new schedule to see it here</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Area</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule) => {
                        const pickupDate = new Date(schedule.pickup_date);
                        const isPast = pickupDate < new Date();
                        
                        return (
                          <TableRow key={schedule.id}>
                            <TableCell>{schedule.area}</TableCell>
                            <TableCell>
                              {format(pickupDate, 'PP')}
                              <div className="text-xs text-muted-foreground">
                                {format(pickupDate, 'h:mm a')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeClass(schedule.status)}>
                                {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {schedule.notes || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {schedule.status !== "completed" && !isPast && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateScheduleStatus(schedule.id, "completed")}
                                    disabled={isUpdatingStatus === schedule.id}
                                  >
                                    {isUpdatingStatus === schedule.id ? (
                                      <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
                                    ) : null}
                                    Mark Complete
                                  </Button>
                                )}
                                
                                {schedule.status !== "cancelled" && !isPast && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateScheduleStatus(schedule.id, "cancelled")}
                                    disabled={isUpdatingStatus === schedule.id}
                                  >
                                    {isUpdatingStatus === schedule.id ? (
                                      <LoaderCircle className="h-4 w-4 animate-spin mr-1" />
                                    ) : null}
                                    Cancel
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                  disabled={isDeleting === schedule.id}
                                >
                                  {isDeleting === schedule.id ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
