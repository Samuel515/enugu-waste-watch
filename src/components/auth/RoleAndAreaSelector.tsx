
import { UserRole } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import enuguLocations from "@/data/locations";

interface RoleAndAreaSelectorProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  area: string;
  setArea: (area: string) => void;
  isLoading: boolean;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  verificationValid: boolean;
}

export const RoleAndAreaSelector = ({
  role,
  setRole,
  area,
  setArea,
  isLoading,
  verificationCode,
  setVerificationCode,
  verificationValid
}: RoleAndAreaSelectorProps) => {
  const [showVerification, setShowVerification] = useState(false);
  
  // Update showVerification whenever role changes
  useEffect(() => {
    setShowVerification(role === "official" || role === "admin");
  }, [role]);

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
      
      {showVerification && (
        <div className="space-y-2">
          <Label htmlFor="verificationCode" className="flex items-center">
            Verification Code 
            <span className="text-xs text-muted-foreground ml-2">(Required for Officials & Admins)</span>
          </Label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <Input
              id="verificationCode"
              type="password"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className={`pl-10 ${!verificationValid && verificationCode ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
          </div>
          {!verificationValid && verificationCode && (
            <p className="text-sm text-red-500">Invalid verification code</p>
          )}
        </div>
      )}
      
      {role === "resident" && (
        <div className="space-y-2">
          <Label htmlFor="area">Your Area</Label>
          <Select
            value={area}
            onValueChange={(value) => setArea(value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full relative">
              <SelectValue placeholder="Select your area" />
              <MapPin className="absolute right-8 top-2.5 h-5 w-5 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent>
              {enuguLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
};
