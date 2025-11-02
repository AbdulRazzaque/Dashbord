import { Request } from "express";
import mongoose from "mongoose";

export interface UserData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: number;
    avatar: string;
    password: string;
    role: string;
    address: string;
    isVerified?: boolean;
    isActive?: boolean;
    FCMToken?: string;
    addedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface RefreshToken {
    token: string;
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
        tenant: string;
        firstName: string;
        lastName: string;
        email: string;
        jti: any;
    };
}

export interface VerificationToken {
    userId: mongoose.Types.ObjectId;
    addedBy: mongoose.Types.ObjectId;
    token: string;
    sessionURL: string;
    projectId: mongoose.Types.ObjectId;
    chatId: mongoose.Types.ObjectId;
    companyId: mongoose.Types.ObjectId;
    createdAt: Date;
    role: string;
}
