
export type ReportStatus = "pending" | "in-progress" | "resolved";

export interface Report {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  image_url?: string;
  user_id: string;
  user_name?: string;
  user_area?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface ReportFormData {
  title: string;
  description: string;
  location: string;
  image?: File;
}

export interface PickupSchedule {
  id: string;
  area: string;
  pickup_date: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  created_by: string;
  created_at: string;
  updated_at: string;
}
