import mongoose, { Schema, Document } from "mongoose";
import { BioTimePunch } from "../types";


export interface IPunch extends Document, Omit<BioTimePunch, "punch_time" | "upload_time"> {
  punch_time: Date | null;
  upload_time: Date | null;
  raw: BioTimePunch;
}

const punchSchema = new Schema<IPunch>(
  {
    id: { type: Number, unique: true, required: true, index: true },
    emp: Number,
    first_name:String,
    punch_time: Date,
    punch_state_display: String,
    upload_time: Date,
    raw: Object,
  },
  { timestamps: true }
);

export default mongoose.model<IPunch>("Punch", punchSchema);