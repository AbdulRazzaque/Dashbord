import mongoose from "mongoose";
import { RefreshToken } from "../types";

const refreshSchema = new mongoose.Schema<RefreshToken>(
    {
        token: { type: String },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        expiresAt: Date,
    },
    { timestamps: true, toJSON: { getters: true } },
);

export default mongoose.model<RefreshToken>("RefreshToken", refreshSchema);
