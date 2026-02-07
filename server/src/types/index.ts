import { Request } from "express";
import mongoose from "mongoose";

export interface UserData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: number;
    avatar: string;
    password: string;
    role: string;
    address: string;
    isVerified?: boolean;
    isActive?: boolean;
    FCMToken?: string;
    addedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface RefreshToken {
    token: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
        tenant: string;
        firstName: string;
        lastName: string;
        email: string;
        jti: any;
    };
}

export interface VerificationToken {
    userId: mongoose.Types.ObjectId;
    addedBy: mongoose.Types.ObjectId;
    token: string;
    sessionURL: string;
    projectId: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    createdAt: Date;
    role: string;
}



export interface BioTimePunch {
   punch_id: number;
  emp_code: number;
  first_name:string;
  punch_time: string;
  punch_state_display?: string;
  upload_time?: string;
  [key: string]: any;
  raw:object
}

export interface BioTimeResponse<T = any> {
  data: T[];
  next: string | null;
  previous:string
  count?: number;
}

  export interface SearchParams {
      query?: string;
      role?: string;
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
  }



export interface FetchPunchesOptions {
  start_time?: string;
  end_time?: string;
  page_size?: number;
  maxPages?: number;
}

export interface TimeStatus {
  time: string;
  status: string;
}

export interface EmployeeDay {
      emp_code: number;
      first_name: string;
      department: string;
      position: string;
      date: Date;
      checkIn: TimeStatus | null;
      checkOut: TimeStatus | null;
      totalHours: number;
      raw:object;
    
    }

export interface IEmployee {

  emp_code: number;
  first_name: string;
  isExcluded: boolean;   // 🔴 REQUIRED
  isDeleted: boolean;
  raw: Record<string, any>;
}

export interface AbsentType {
  _id: string;
  emp_code: number;
  first_name: string;
  date: Date;
  status: "ABSENT";
  reason: string;
}

export interface AbsentSearchOptions extends SearchParams {}

// ----- Report module (frontend Report section) -----
// Present and absent only (no Leave policy). Weekend is returned for blank cells.
export type ReportDailyStatus = "present" | "absent" | "weekend";

export interface ReportEmployee {
  id: string;
  name: string;
  employeeId: string;
  emp_code: number;
  avatar: string;
}

export interface ReportDailyRecord {
  date: string;
  employeeId: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: ReportDailyStatus;
  overtime: number;
  tasks: number;
  performance: number;
}

export interface ReportMonthlyMatrixFilters {
  search?: string;
  status?: ReportDailyStatus | "all";
}

export interface ReportMonthlyMatrixOptions {
  year: number;
  month: number;
  employeeId?: string;
  filters?: ReportMonthlyMatrixFilters;
  page?: number;
  limit?: number;
}