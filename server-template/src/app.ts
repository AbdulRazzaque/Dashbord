import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Config } from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";

import authRouter from "./routes/auth";
import helmet from "helmet";

const app = express();
app.use(helmet());
const ALLOWED_DOMAINS = [Config.FRONTEND_URL];
app.use(
    cors({
        origin: ALLOWED_DOMAINS as string[],
        credentials: true,
    }),
);

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.use("/api/auth", authRouter);

app.use(globalErrorHandler);

export default app;
