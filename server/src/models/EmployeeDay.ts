import mongoose, { Schema } from "mongoose";
import { EmployeeDay } from "../types";

const EmployeeDaySchema = new Schema <EmployeeDay>({
  employeeId: Number,
  name: String,
  isExcluded: { type: Boolean, default: false },
  department: String,
  position: String,
  date: String,
  checkIn: {
    time: String,
    status: String,
  },
  checkOut: {
    time: String,
    status: String,
  },
  
  totalHours: Number,
   raw: Object,
});

export const EmployeeDayModel = mongoose.model<EmployeeDay>("EmployeeDay", EmployeeDaySchema);
