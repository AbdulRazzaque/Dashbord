export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  password: string;
  mobileNo: number;
  role: string;
  status: string;
  isVerified?: boolean;
  isActive?: boolean;
  stripeCustomerId?: string;
  designation?: string;
  FCMToken?: string;
  address: [
    {
      id: string;
      flatBuildingCompany: string;
      streetArea: string;
      landmark: string;
      pincode: string;
      cityDistrict: string;
      country: string;
      state: string;
      firstName: string;
      lastName: string;
      phoneCountryCode: string;
      phone: number;
      tag: string;
      isDefault: boolean;
    }
  ];
  addedBy?: UserData;
  createdAt: Date;
  updatedAt: Date;
}

export interface BioTimePunch {
  id: number;
  emp: number;
  first_name:string;
  punch_time: string;
  punch_state_display?: string;
  upload_time?: string;
  [key: string]: any;
}
export interface Counts {
  totalEmployee: number;
  TodyPresent: number;
  TodyLateEmployee: number;
  TodyAbsentEmployee: number;
}


export interface Notification {
  _id: string;
  recipientId: UserData;
  recipientRole: string;

  type: string;
  message: string;
  isRead: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface SummaryRow {
  emp_code: number;
  first_name: string;
  id: number;
  row: object;
  isExcluded?: boolean;
  date: string;
  checkIn: { time: string; status: string } | null;
  checkOut: { time: string; status: string } | null;
  totalHours: number;
  status: string;
};

export interface AbsentEmployee {
  _id: string;
  emp_code: number;
  status:string,
  first_name: string;
  date:string;
  reason:string;
}

