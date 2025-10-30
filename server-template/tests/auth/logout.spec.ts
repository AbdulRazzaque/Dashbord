import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import createJWKSMock from "mock-jwks";
import { sign } from "jsonwebtoken";
import app from "../../src/app";
import { Roles } from "../../src/constants";
import { Config } from "../../src/config";
import userModel from "../../src/models/userModel";
import refreshTokenModel from "../../src/models/refreshTokenModel";

describe("POST /auth/logout", () => {
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeEach(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        jwks.start();
        await mongoose.connect(Config.MONGO_URI!);
        await mongoose.connection.db.dropDatabase();
    });

    afterEach(async () => {
        await mongoose.connection.close();
        jwks.stop();
    });

    describe("Given all fields", () => {
        it("should return the 200 status code and clear the cookies", async () => {
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

            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            });

            const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365;

            const newRefreshToken = await refreshTokenModel.create({
                userId: data._id,
                expiresAt: new Date(Date.now() + MS_IN_YEAR), // 1 year expiration date
            });

            const refreshTokenPayload = {
                sub: String(data.id),
                role: data.role,
                id: newRefreshToken.id,
            };

            const refreshToken = sign(
                refreshTokenPayload,
                Config.REFRESH_SECRET!,
                {
                    algorithm: "HS256",
                    expiresIn: "1y",
                    issuer: "auth-service",
                    jwtid: String(newRefreshToken.id),
                },
            );

            const response = await request(app)
                .post("/auth/logout")
                .set("Cookie", [
                    `accessToken=${accessToken};`,
                    `refreshToken=${refreshToken};`,
                ])
                .send();

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual({
                message: "Successfully logged out",
            });
            expect(response.headers["set-cookie"]).toEqual([
                expect.stringContaining("accessToken=;"),
                expect.stringContaining("refreshToken=;"),
            ]);
        });
    });
});
