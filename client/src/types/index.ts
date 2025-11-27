

export interface BioTimePunch {
  id: number;
  emp: number;
  first_name:string;
  punch_time: string;
  punch_state_display?: string;
  upload_time?: string;
  [key: string]: any;
}

export interface TodayAttendanceResponse {
  ok: boolean;
  saved: number;
  page: number;
  limit: number;
  total: number;
  data: SummaryRow[];
}



export interface SummaryRow {
  employeeId: string;
  id: number;
  name: string;
  date:string;
  checkIn: {time:string; status:string} | null;
  checkOut: {time:string; status:string} | null;
  totalHours: number;
  status: string;
};


