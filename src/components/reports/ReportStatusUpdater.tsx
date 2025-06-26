
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ReportStatus } from "@/types/reports";

interface ReportStatusUpdaterProps {
  reportId: string;
  currentStatus: ReportStatus;
  onStatusUpdate: (newStatus: ReportStatus) => void;
}

const ReportStatusUpdater: React.FC<ReportStatusUpdaterProps> = ({
  reportId,
  currentStatus,
  onStatusUpdate
}) => {
  const [newStatus, setNewStatus] = useState<ReportStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleStatusUpdate = async () => {
    if (newStatus === currentStatus) {
      toast({
        title: "No change",
        description: "Please select a different status",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    
    try {
      console.log(`Updating report ${reportId} status from ${currentStatus} to ${newStatus}`);
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      onStatusUpdate(newStatus);
      
      toast({
        title: "Status updated",
        description: `Report status changed to ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={newStatus} onValueChange={(value: ReportStatus) => setNewStatus(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        onClick={handleStatusUpdate} 
        disabled={isUpdating || newStatus === currentStatus}
        size="sm"
      >
        {isUpdating ? "Updating..." : "Update"}
      </Button>
    </div>
  );
};

export default ReportStatusUpdater;
