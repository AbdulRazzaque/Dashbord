import mongoose, { Schema, Document } from "mongoose";
import { BioTimePunch } from "../types";

/**
 * Plain Punch Object (Lean / Business Layer)
 */
export interface IPunch {
  punch_id: number;
  emp_code: number;
  first_name?: string;
  punch_time: Date | null;
  punch_state_display?: string;
  upload_time: Date | null;
  raw: BioTimePunch;
}

/**
 * Mongoose Document (DB Layer)
 */
export interface IPunchDocument extends Document {
  punch_id: number;
  emp_code: number;
  first_name?: string;
  punch_time: Date | null;
  punch_state_display?: string;
  upload_time: Date | null;
  raw: BioTimePunch;
}

const punchSchema = new Schema<IPunchDocument>(
  {
    punch_id: { type: Number, unique: true, required: true, index: true },
    emp_code: Number,
    first_name: String,
    punch_time: Date,
    punch_state_display: String,
    upload_time: Date,
    raw: Object,
  },
  { timestamps: true }
);

export default mongoose.model<IPunchDocument>("Punch", punchSchema);
