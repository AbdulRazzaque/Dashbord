import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { Config } from "../../src/config";
import userModel from "../../src/models/userModel";
import verifyTokenModel from "../../src/models/verifyTokenModel";

describe("POST /auth/update-password", () => {
    beforeEach(async () => {
        await mongoose.connect(Config.MONGO_URI!);
        await mongoose.connection.db.dropDatabase();
    });

    afterEach(async () => {
        await mongoose.connection.close();
    });

    describe("Given all fields", () => {
        it("should reset the password return the 200 status code", async () => {
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

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const data = await userModel.create({
                ...userData,
                password: hashedPassword,
                role: Roles.COMPANY,
                isVerified: true,
            });

            await request(app)
                .post("/auth/send-password-link")
                .send({ email: userData.email, isSupportPortal: false });

            const token = await verifyTokenModel.find();

            const reqBody = {
                id: data._id,
                password: "NewPasswaord@123",
                token: token[0].token,
            };

            const response = await request(app)
                .patch("/auth/update-password")
                .send(reqBody);

            const searchToken = await verifyTokenModel.find();

            const serchUser = await userModel.find();

            expect(response.statusCode).toBe(200);
            expect(serchUser[0].password).not.toBe(data.password);
            expect(searchToken).toHaveLength(0);
        });
    });
    describe("Fields are missing", () => {
        it("should return 400 status code if user data is worng", async () => {
            const reqBody = {
                email: "faisal@gmail.com",
                isSupportPortal: false,
            };

            const response = await request(app)
                .patch("/auth/update-password")
                .send(reqBody);

            const token = await verifyTokenModel.find();

            expect(response.statusCode).toBe(400);
            expect(token).toHaveLength(0);
        });
    });
});
