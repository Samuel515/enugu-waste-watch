
import { UserRole } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

interface RoleAndAreaSelectorProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  area: string;
  setArea: (area: string) => void;
  isLoading: boolean;
}

export const RoleAndAreaSelector = ({
  role,
  setRole,
  area,
  setArea,
  isLoading
}: RoleAndAreaSelectorProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={role}
          onValueChange={(value) => setRole(value as UserRole)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="resident">Resident</SelectItem>
            <SelectItem value="official">Waste Management Official</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {role === "resident" && (
        <div className="space-y-2">
          <Label htmlFor="area">Your Area</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="area"
              type="text"
              placeholder="e.g., Independence Layout"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
      )}
    </>
  );
};
