
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { enuguLocations } from "@/utils/locationData";

interface RoleAndAreaSelectorProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  area: string;
  setArea: (area: string) => void;
  isLoading: boolean;
  verificationCode?: string;
  setVerificationCode?: (code: string) => void;
  verificationValid?: boolean;
}

export const RoleAndAreaSelector = ({
  role,
  setRole,
  area,
  setArea,
  isLoading,
  verificationCode,
  setVerificationCode,
  verificationValid = true,
}: RoleAndAreaSelectorProps) => {
  const [showVerificationField, setShowVerificationField] = useState(
    role === "official" || role === "admin"
  );

  // Show verification field when role is official or admin
  useEffect(() => {
    setShowVerificationField(role === "official" || role === "admin");
  }, [role]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Role</Label>
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
            <SelectItem value="official">Waste Official</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {role === "resident" && (
        <div className="space-y-2">
          <Label htmlFor="area">Your Area</Label>
          <Select
            value={area}
            onValueChange={setArea}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your area" />
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

      {showVerificationField && setVerificationCode && (
        <div className="space-y-2">
          <Label
            htmlFor="verification"
            className={!verificationValid ? "text-destructive" : ""}
          >
            Verification Code
          </Label>
          <Input
            id="verification"
            type="text"
            placeholder="Enter verification code"
            value={verificationCode || ""}
            onChange={(e) => setVerificationCode(e.target.value)}
            className={`${
              !verificationValid ? "border-destructive" : ""
            }`}
            disabled={isLoading}
          />
          {!verificationValid && (
            <p className="text-xs text-destructive">
              Invalid verification code
            </p>
          )}
        </div>
      )}
    </div>
  );
};
