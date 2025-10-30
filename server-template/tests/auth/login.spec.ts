import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { Config } from "../../src/config";
import { isJwt } from "../utils";
import userModel from "../../src/models/userModel";

describe("POST /auth/login", () => {
    beforeEach(async () => {
        await mongoose.connect(Config.MONGO_URI!);
        await mongoose.connection.db.dropDatabase();
    });

    /* Closing database connection after each test. */
    afterEach(async () => {
        await mongoose.connection.close();
    });

    describe("Given all fields", () => {
        it("should return the access token and refresh token inside a cookie", async () => {
            // Arrange
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

            await userModel.create({
                ...userData,
                password: hashedPassword,
                role: Roles.COMPANY,
                isVerified: true,
            });

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });

            interface Headers {
                ["set-cookie"]: string[];
            }
            // Assert
            let accessToken: string | null = null;
            let refreshToken: string | null = null;

            const cookies =
                (response.headers as unknown as Headers)["set-cookie"] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }

                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });
        it("should return the 400 if email or password is wrong", async () => {
            // Arrange
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

            await userModel.create({
                ...userData,
                password: hashedPassword,
                role: Roles.COMPANY,
                isVerified: true,
            });

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: "wrongPassword" });

            // Assert
            expect(response.statusCode).toBe(400);
        });
        it("should return the 400 if user is not verified", async () => {
            // Arrange
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

            const user = await userModel.create({
                ...userData,
                password: hashedPassword,
                role: Roles.COMPANY,
            });

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send({ email: userData.email, password: userData.password });

            // Assert
            expect(response.statusCode).toBe(400);
            expect(user.isVerified).toBe(false);
        });
    });
});
