import request from "supertest";
import mongoose from "mongoose";
import axios from "axios";
import app from "../../src/app";
import { Config } from "../../src/config";
import { UserData } from "../../src/types";
import { Roles } from "../../src/constants";
import userModel from "../../src/models/userModel";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("POST /auth/register", () => {
    beforeEach(async () => {
        await mongoose.connect(Config.MONGO_URI!);
        await mongoose.connection.db.dropDatabase();
    });

    /* Closing database connection after each test. */
    afterEach(async () => {
        await mongoose.connection.close();
    });

    describe("Given all fields", () => {
        it("should return the 201 status code", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan@mokshasolution.com",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                timeZone: [],
                planId: "66d30bb8e54f80b3de57a72a",
            };

            // Mock the axios call
            mockedAxios.post.mockResolvedValueOnce({
                data: { sessionURL: "http://localhostdcdd" },
            });

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });
        it("should return valid json response", async () => {
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

            // Mock the axios call
            mockedAxios.post.mockResolvedValueOnce({
                data: { sessionURL: "http://localhostdcdd" },
            });

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);
            // Assert application/json utf-8
            expect(
                (response.headers as Record<string, string>)["content-type"],
            ).toEqual(expect.stringContaining("json"));
        });
        it("should persist the user in the database", async () => {
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

            // Mock the axios call
            mockedAxios.post.mockResolvedValueOnce({
                data: { sessionURL: "http://localhostdcdd" },
            });

            // Act
            await request(app).post("/auth/register").send(userData);
            // Assert
            // Retrieve the data from MongoDB
            const users: UserData[] = await userModel.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
        it("should assign a company role", async () => {
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

            // Mock the axios call
            mockedAxios.post.mockResolvedValueOnce({
                data: { sessionURL: "http://localhostdcdd" },
            });

            // Act
            await request(app).post("/auth/register").send(userData);
            // Assert
            const users: UserData[] = await userModel.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(Roles.COMPANY);
        });
        it("should store the hashed password in the database", async () => {
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

            // Mock the axios call
            mockedAxios.post.mockResolvedValueOnce({
                data: { sessionURL: "http://localhostdcdd" },
            });

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const users: UserData[] = await userModel
                .find()
                .select("+password")
                .exec();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2[a|b]\$\d+\$/);
        });
        it("should return 400 status code if email is already exists", async () => {
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

            await userModel.create({
                firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan@mokshasolution.com",
                password: "Ktguru@123",
            });

            // Mock the axios call
            mockedAxios.post.mockResolvedValueOnce({
                data: { sessionURL: "http://localhostdcdd" },
            });

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            const users: UserData[] = await userModel.find();
            // Assert
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });
    describe("Fields are missing", () => {
        it("should return 400 status code if email field is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                // email: "faisal.khan@mokshasolution.com",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const users: UserData[] = await userModel.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if firstName is missing", async () => {
            // Arrange
            const userData = {
                // firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan@mokshasolution.com",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const users: UserData[] = await userModel.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if lastName is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                // lastName: "Khan",
                email: "faisal.khan@mokshasolution.com",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const users: UserData[] = await userModel.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password is missing", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan@mokshasolution.com",
                // password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const users: UserData[] = await userModel.find();
            expect(users).toHaveLength(0);
        });
    });
    describe("Fields are not in proper format", () => {
        it("should trim the email field", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan@mokshasolution.com  ",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const users: UserData[] = await userModel.find();
            const user = users[0];

            expect(user.email).toBe("faisal.khan@mokshasolution.com");
        });
        it("should lower case the email field", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                email: "Faisal.Khan@MokshaSolution.com",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const users: UserData[] = await userModel.find();
            const user = users[0];

            expect(user.email).toBe("faisal.khan@mokshasolution.com");
        });
        it("should return 400 status code if email is not a valid email", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan.emil",
                password: "Ktguru@123",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const users: UserData[] = await userModel.find();
            expect(users).toHaveLength(0);
        });
        it("should return 400 status code if password length is less than 6 chars", async () => {
            // Arrange
            const userData = {
                firstName: "Faisal",
                lastName: "Khan",
                email: "faisal.khan.emil",
                password: "Ktguru",
                companyName: "Mokshasolution",
                country: "India",
                countryISOCode: "IN",
                planId: "123",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(400);
            const users: UserData[] = await userModel.find();
            expect(users).toHaveLength(0);
        });
    });
});
