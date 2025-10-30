import mongoose from "mongoose";
import request from "supertest";
import crypto from "crypto";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { Config } from "../../src/config";
import userModel from "../../src/models/userModel";
import verifyTokenModel from "../../src/models/verifyTokenModel";

describe("GET /auth/:id/verify/:token", () => {
    beforeEach(async () => {
        await mongoose.connect(Config.MONGO_URI!);
        await mongoose.connection.db.dropDatabase();
    });

    afterEach(async () => {
        await mongoose.connection.close();
    });

    describe("Given all fields", () => {
        it("should return isVerified true and the status code 200", async () => {
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan@mokshasolution.com",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            const user = await userModel.create({
                ...userData,
                role: Roles.COMPANY,
            });

            const token = await verifyTokenModel.create({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            });

            const response = await request(app).get(
                `/auth/${user.id}/verify/${token.token}`,
            );

            const findUser = await userModel.find();

            const findToken = await verifyTokenModel.find();

            expect(response.statusCode).toBe(200);
            expect(findUser[0].isVerified).toBe(true);
            expect(findToken).toHaveLength(0);
        });
    });
    describe("Fields are missing", () => {
        it("should return 400 status code if user not found is worng", async () => {
            const response = await request(app).get(
                `/auth/652f9f2ed57f42418e7837d5/verify/xyz-token`,
            );

            const token = await verifyTokenModel.find();

            expect(response.statusCode).toBe(400);
            expect(token).toHaveLength(0);
        });
    });
});
