
import { useState } from "react";
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
import { useNavigate } from "react-router-dom";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(user?.area || "");
  const [wasteType, setWasteType] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const handleLocationDetection = async () => {
  setIsLocationLoading(true);

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    setIsLocationLoading(false);
    toast({
      title: "Geolocation not supported",
      description: "Your browser does not support geolocation. Please enter your location manually.",
      variant: "destructive",
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        // Store the coordinates
        const { latitude, longitude } = position.coords;
        setCoordinates({ latitude, longitude });
        console.log(`Coordinates: ${latitude}, ${longitude}`);

        // Reverse geocode using Nominatim API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`, // Increased zoom for more detail
          {
            headers: {
              "User-Agent": "YourAppName/1.0" // Required by Nominatim for production use
            }
          }
        );
        const data = await response.json();

        // Check if the response contains valid address data
        if (!data.address) {
          throw new Error("No address data returned");
        }

        // Extract address components
        const { city, town, village, neighbourhood, suburb, county, state, country } = data.address;

        // Build a human-readable location string
        let area = "";
        if (neighbourhood || suburb) {
          area = `${neighbourhood || suburb}, ${city || town || village || county || state}`;
        } else if (city || town || village) {
          area = `${city || town || village}, ${country || state || county}`;
        } else {
          area = `${state || county || country || "Unknown location"}`;
        }

        // Fallback if no meaningful data is found
        if (!area || area.includes("undefined")) {
          area = "Unknown location";
        }

        // Update location state
        setLocation(area);
        setIsLocationLoading(false);

        toast({
          title: "Location detected",
          description: `Your current location is ${area}.`,
        });
      } catch (error) {
        setIsLocationLoading(false);
        toast({
          title: "Error fetching location details",
          description: "Could not retrieve area details. Please try again or enter manually.",
          variant: "destructive",
        });
      }
    },
    (error) => {
      setIsLocationLoading(false);
      toast({
        title: "Error detecting location",
        description: `${error.message}. Please enter your location manually.`,
        variant: "destructive",
      });
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a report",
        variant: "destructive",
      });
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
      // Generate a report ID with format WR-YYYY-MM-DD-XXX
      const date = new Date();
      const reportId = `WR-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // Submit the report to Supabase
      const { data, error } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          location,
          coordinates: coordinates ? coordinates : null,
          status: 'pending',
          user_id: user.id,
          user_name: user.name,
          user_area: user.area,
          image_url: images.length > 0 ? images[0] : null
        })
        .select() as any;
        
      if (error) throw error;
      
      // Create a notification for officials/admins about this new report
      await supabase
        .from('notifications')
        .insert({
          title: 'New Waste Report Submitted',
          message: `A new waste report "${title}" has been submitted in ${location}`,
          type: 'report',
          for_all: true,
          created_by: user.id
        }) as any;
      
      toast({
        title: "Report submitted successfully",
        description: "Your waste report has been received and will be processed.",
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setLocation(user?.area || "");
      setWasteType("");
      setImages([]);
      setCoordinates(null);
      
      // Redirect to the reports page
      navigate('/reports');
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
