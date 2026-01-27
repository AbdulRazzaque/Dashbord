import mongoose, { Schema } from "mongoose";
import { IEmployee } from "../types";

const EmployeeSchema = new Schema(
  {
    emp_code: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    first_name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

   

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
     isExcluded: {
      type: Boolean,
      default: false,
      index: true,
    },
    // ✅ FULL ZKT DATA STORED HERE
    raw: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IEmployee>(
  "Employee",
  EmployeeSchema
);
