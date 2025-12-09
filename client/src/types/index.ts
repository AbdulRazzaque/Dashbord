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




export interface SummaryRow {
  employeeId: number;
  name: string;
  id: number;
  row: object 
  isExcluded?: boolean;
  date:string;
  checkIn: {time:string; status:string} | null;
  checkOut: {time:string; status:string} | null;
  totalHours: number;
  status: string;
};




export interface ProductData {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  variants?: Array<{
    rate: number;
    discount: number;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  [key: string]: any;
}

export interface ILanding {
  _id: string;
  title: string;
  image?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface SubCategory {
  _id: string;
  name: string;
  category?: string;
  image?: string;
  isActive?: boolean;
  [key: string]: any;
}

export interface RetailerDetails {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  isVerified?: boolean;
  [key: string]: any;
}

export interface Order {
  _id: string;
  orderId?: string;
  customer?: any;
  items?: any[];
  total?: number;
  status?: string;
  createdAt?: string;
  [key: string]: any;
}