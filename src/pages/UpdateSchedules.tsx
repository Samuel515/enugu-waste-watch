import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoaderCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PickupSchedule {
  id: string;
  area: string;
  pickup_date: string;
  status: "scheduled" | "completed" | "canceled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const UpdateSchedules = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<PickupSchedule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [dialogType, setDialogType] = useState<"complete" | "cancel" | null>(null);
  
  // Fetch schedules from Supabase
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user || user.role === "resident") return;
      
      setIsLoading(true);
      
      try {
        // Get the current date at midnight (start of day)
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        // Only fetch schedules with dates on or after the current date
        const { data, error } = await supabase
          .from('pickup_schedules')
          .select('*')
          .gte('pickup_date', currentDate.toISOString())
          .order('pickup_date', { ascending: true }) as any;
        
        if (error) throw error;
        
        if (data) {
          setSchedules(data);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load schedules",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
    
    // Set up real-time listener for schedule changes
    const channel = supabase
      .channel('schedule-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pickup_schedules' },
        () => fetchSchedules())
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
  
  // Function to update schedule status
  const updateScheduleStatus = async (scheduleId: string, newStatus: "completed" | "canceled") => {
    try {
      // Update the schedule status
      const { error } = await supabase
        .from('pickup_schedules')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId);
      
      if (error) throw error;
      
      // Update the local state
      setSchedules(schedules.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: newStatus, updated_at: new Date().toISOString() } 
          : schedule
      ));
      
      // Show success toast
      toast({
        title: "Status updated",
        description: `Schedule has been marked as ${newStatus}`,
      });
      
      // Close the dialog
      setSelectedScheduleId(null);
      setDialogType(null);
    } catch (error) {
      console.error(`Error updating schedule to ${newStatus}:`, error);
      toast({
        title: "Update failed",
        description: `Failed to mark schedule as ${newStatus}`,
        variant: "destructive"
      });
    }
  };
  
  // Check if a date is today
  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  // Function to format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('en-US', options);
  };

  // Handle dialog opening
  const openDialog = (scheduleId: string, type: "complete" | "cancel") => {
    setSelectedScheduleId(scheduleId);
    setDialogType(type);
  };

  // Handle dialog closing
  const closeDialog = () => {
    setSelectedScheduleId(null);
    setDialogType(null);
  };

  // Handle completing a schedule
  const handleComplete = () => {
    if (selectedScheduleId) {
      updateScheduleStatus(selectedScheduleId, "completed");
    }
  };

  // Handle canceling a schedule
  const handleCancel = () => {
    if (selectedScheduleId) {
      updateScheduleStatus(selectedScheduleId, "canceled");
    }
  };

  if (user?.role === "resident") {
    return (
      <Layout requireAuth>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Access Denied
            </h1>
            <p className="text-muted-foreground mt-2">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth allowedRoles={["official", "admin"]}>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Update Schedules</h1>
          <p className="text-muted-foreground">
            View and update waste collection schedules
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <LoaderCircle className="h-8 w-8 animate-spin text-waste-green" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">No upcoming schedules available</p>
            <Button asChild className="mt-4">
              <Link to="/schedule/new">Create New Schedule</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Collection in {schedule.area}</CardTitle>
                      <CardDescription>
                        {formatDate(schedule.pickup_date)}
                      </CardDescription>
                    </div>
                    <Badge 
                      className={`${
                        schedule.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : schedule.status === 'canceled' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <p className="text-sm">
                    {schedule.notes || "No additional notes for this collection."}
                  </p>
                </CardContent>
                
                {schedule.status === 'scheduled' && (
                  <CardFooter className="flex justify-end space-x-2 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(schedule.id, "cancel")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => openDialog(schedule.id, "complete")}
                    >
                      Mark Complete
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
        
        <Dialog open={!!selectedScheduleId && !!dialogType} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogType === "complete" ? "Complete Schedule" : "Cancel Schedule"}
              </DialogTitle>
              <DialogDescription>
                {dialogType === "complete" 
                  ? "Are you sure you want to mark this schedule as completed?" 
                  : "Are you sure you want to cancel this schedule?"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button 
                onClick={dialogType === "complete" ? handleComplete : handleCancel}
                variant={dialogType === "cancel" ? "destructive" : "default"}
              >
                {dialogType === "complete" ? "Complete" : "Cancel Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default UpdateSchedules;
