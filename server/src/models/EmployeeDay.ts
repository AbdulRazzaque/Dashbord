import mongoose, { Schema } from "mongoose";
import { EmployeeDay } from "../types";

const EmployeeDaySchema = new Schema ({
  emp_code: Number,
  first_name: { type: String, required: true },
  department: { type: String, default: "Unknown" },
  position: { type: String, default: "Unknown" },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["Present"],
    default: "Present",
    required: true,
  },

  checkIn: {
    time: String,
    status: String,
  },
  checkOut: {
    time: String,
    status: String,
  },
  
  totalHours: { type: Number, default: 0 },
   raw: { type: Object, default: {} },
}, { strict: true });

export const EmployeeDayModel = mongoose.model<EmployeeDay>("EmployeeDay", EmployeeDaySchema);
