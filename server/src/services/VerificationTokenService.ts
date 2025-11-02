import crypto from "crypto";
import verifyTokenModel from "../models/verifyTokenModel";
import { Types } from "mongoose";

export class VerificationTokenService {
    async create(userId: string, sessionURL?: string) {
        let token = await verifyTokenModel.findOne({
            userId,
        });

        if (!token) {
            token = await verifyTokenModel.create({
                userId: userId,
                token: crypto.randomBytes(32).toString("hex"),
                projectId: null,
                companyId: null,
                sessionURL: sessionURL ? sessionURL : null,
            });
        }

        return token;
    }

    async findOne(token: string) {
        return await verifyTokenModel.findOne({
            token,
        });
    }

    async delete(tokenId: Types.ObjectId) {
        return await verifyTokenModel.deleteOne({ _id: tokenId });
    }
}
