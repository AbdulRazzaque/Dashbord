import { config } from "dotenv";
import path from "path";

config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

const {
    NODE_ENV,
    PORT,
    MONGO_URI,
    FRONTEND_URL,
    JWKS_URI,
    REFRESH_SECRET,
    ACCESS_SECRET,
    MAIN_DOMAIN,
    BIOTIME_URL,
    BIOTIME_USER,
    BIOTIME_PASS,
} = process.env;

export const Config = {
    NODE_ENV,
    PORT,
    MONGO_URI,
    FRONTEND_URL,
    JWKS_URI,
    REFRESH_SECRET,
    ACCESS_SECRET,
    MAIN_DOMAIN,
    BIOTIME_URL,
    BIOTIME_USER,
    BIOTIME_PASS,
};
