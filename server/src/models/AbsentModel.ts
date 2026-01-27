import mongoose, { Schema } from "mongoose";
import { AbsentType } from "../types";



const AbsentSchema = new Schema(
  {
    emp_code: {
      type: Number,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      default: "No CheckIn",
    },
    status: {
      type: String,
      enum: ["Absent"],
      default: "Absent",
      required: true,
    },

  },
  { timestamps: true },

);

// ✅ UNIQUE INDEX (VERY IMPORTANT)
AbsentSchema.index(
  { emp_code: 1, date: 1 },
  { unique: true }
);

const AbsentModel = mongoose.model<AbsentType>(
  "Absent",
  AbsentSchema
);

export default AbsentModel;
