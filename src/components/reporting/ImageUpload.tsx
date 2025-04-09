
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, X } from "lucide-react";

interface ImageUploadProps {
  images: string[];
  setImages: (images: string[]) => void;
  disabled?: boolean;
}

const ImageUpload = ({ images, setImages, disabled = false }: ImageUploadProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    const newFiles = Array.from(e.target.files);
    
    // Check file size (max 5MB)
    const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Some image(s) exceed the maximum size of 5MB",
        variant: "destructive",
      });
    }
    
    // Filter out oversized files
    const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024);
    
    // Check total images (max 4)
    if (images.length + validFiles.length > 4) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 4 images",
        variant: "destructive",
      });
    }
    
    // Get only up to the remaining slots
    const filesToProcess = validFiles.slice(0, 4 - images.length);
    
    // Process each file
    Promise.all(
      filesToProcess.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      })
    ).then(newImages => {
      setImages([...images, ...newImages]);
      setIsUploading(false);
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={image}
              alt={`Uploaded ${index + 1}`}
              className="w-full h-full object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full"
              onClick={() => removeImage(index)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        {images.length < 4 && (
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center aspect-square">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={disabled || isUploading}
              className="h-full w-full bg-transparent flex flex-col items-center justify-center gap-2"
            >
              <Camera className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {isUploading ? "Uploading..." : "Add Photo"}
              </span>
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={disabled || isUploading}
              className="hidden"
            />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Upload up to 4 photos (max 5MB each)
      </p>
    </div>
  );
};

export default ImageUpload;
