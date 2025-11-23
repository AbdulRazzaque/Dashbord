

export interface BioTimePunch {
  id: number;
  emp: number;
  first_name:string;
  punch_time: string;
  punch_state_display?: string;
  upload_time?: string;
  [key: string]: any;
}

export interface AttendanceSummaryRow {
  id: number;
  emp: number;
  name: string;
  checkIn: string | null | Date;
  checkOut: string | null | Date;
  totalMinutes: number;
  netMinutes: number;
  status: string; // Present | Late | Out | Early Out | Unknown
}





