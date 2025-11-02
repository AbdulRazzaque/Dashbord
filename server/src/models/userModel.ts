import mongoose from "mongoose";
import { Roles } from "../constants";
import { UserData } from "../types";

const userSchema = new mongoose.Schema<UserData>(
    {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        mobileNo: {
            type: Number,
        },
        password: {
            type: String,
            select: false,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            required: true,
            enum: [
                Roles.SUPER_ADMIN,
                Roles.ADMIN,
                Roles.USER,
            ],
            default: Roles.USER,
        },
        avatar: {
            type: String,
        },
        address: {
            type: String,
        },
        FCMToken: {
            type: String,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true },
);

export default mongoose.model<UserData>("User", userSchema);
