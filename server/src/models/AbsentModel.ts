import mongoose, { Schema, Document } from "mongoose";

export interface AbsentDocument extends Document {
  emp_code: number;
  first_name: string;
  date: string; // YYYY-MM-DD
  reason: string;
    isExcluded: boolean;
}

const AbsentSchema = new Schema<AbsentDocument>(
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
      type: String,
      required: true,
    },
    reason: {
      type: String,
      default: "No CheckIn",
    },
    isExcluded: {
      type: Boolean,
     required:true
    },
  },
  { timestamps: true }
);

// ✅ UNIQUE INDEX (VERY IMPORTANT)
AbsentSchema.index(
  { emp_code: 1, date: 1 },
  { unique: true }
);

const AbsentModel = mongoose.model<AbsentDocument>(
  "Absent",
  AbsentSchema
);

export default AbsentModel;
