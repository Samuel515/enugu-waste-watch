
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, MapPin, Upload, Trash2, AlertTriangle, CircleAlert, TriangleAlert } from "lucide-react";
import ImageUpload from "@/components/reporting/ImageUpload";
import { supabase } from "@/integrations/supabase/client";

const WASTE_TYPES = [
  {
    value: "overflow",
    label: "Overflowing Bin",
    description: "Waste bin that is full and overflowing",
    icon: <Trash2 className="h-4 w-4" />,
  },
  {
    value: "illegal",
    label: "Illegal Dumping",
    description: "Waste disposed in unauthorized location",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  {
    value: "missed",
    label: "Missed Collection",
    description: "Scheduled pickup was missed",
    icon: <CircleAlert className="h-4 w-4" />,
  },
  {
    value: "damage",
    label: "Damaged Bin",
    description: "Waste bin that needs repair or replacement",
    icon: <TriangleAlert className="h-4 w-4" />,
  },
];

const ReportForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(user?.area || "");
  const [wasteType, setWasteType] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const handleLocationDetection = () => {
    setIsLocationLoading(true);
    
    // Use the browser's geolocation API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // In a real app, we would call a geocoding service
        // For now, we'll save the coordinates in the location field
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation(`Located at: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setIsLocationLoading(false);
        toast({
          title: "Location detected",
          description: "Your current location has been detected successfully.",
        });
      },
      (error) => {
        setIsLocationLoading(false);
        toast({
          title: "Error detecting location",
          description: `${error.message}. Please enter your location manually.`,
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit a report",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // Validation
    if (!title || !description || !location || !wasteType) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Submit report to Supabase
      const { data, error } = await supabase
        .from('reports')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            location,
            waste_type: wasteType,
            status: 'pending',
            images
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Report submitted successfully",
        description: "Your waste report has been received and will be processed.",
      });
      
      // Navigate to dashboard or report details
      if (data && data[0]) {
        navigate(`/reports/${data[0].id}`);
      } else {
        navigate("/dashboard");
      }
      
      // Reset form
      setTitle("");
      setDescription("");
      setLocation(user?.area || "");
      setWasteType("");
      setImages([]);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Failed to submit report",
        description: error.message || "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Report Waste Issue</CardTitle>
        <CardDescription>
          Submit details about waste-related problems in your area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Waste Issue Type</Label>
            <Select value={wasteType} onValueChange={setWasteType} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {WASTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <div className="mr-2">{type.icon}</div>
                      <div>
                        <span>{type.label}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the waste issue"
              rows={4}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="location">Location</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLocationDetection}
                disabled={isLoading || isLocationLoading}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isLocationLoading ? "Detecting..." : "Detect Location"}
              </Button>
            </div>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Address or area name"
              disabled={isLoading || isLocationLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <ImageUpload 
              images={images} 
              setImages={setImages} 
              disabled={isLoading} 
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReportForm;
