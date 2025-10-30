import mongoose from "mongoose";
import { VerificationToken } from "../types";
import { Roles } from "../constants";

const verificationSchema = new mongoose.Schema<VerificationToken>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        token: {
            type: String,
        },
        sessionURL: {
            type: String,
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        role: {
            type: String,
            enum: [
                Roles.SUPER_ADMIN,
                Roles.ADMIN,
                Roles.VENDOR,
                Roles.RETAILER,
                Roles.DELIVERY_PERSON,
            ],
            default: Roles.RETAILER,
        },
    },
    { timestamps: true, toJSON: { getters: true } },
);

export default mongoose.model<VerificationToken>(
    "VerificationToken",
    verificationSchema,
);
