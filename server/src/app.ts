import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Config } from "./config";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import authRouter from "./routes/auth";
import dotenv from "dotenv";
// import helmet from "helmet";
import punchRoutes from "./routes/punchRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import healthRoutes from "./routes/healthRoutes";


dotenv.config();
const app = express();
// app.use(helmet());
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
app.use("/api", healthRoutes);
app.use("/api", employeeRoutes);
app.use("/api", punchRoutes);
app.get("/api/proxy", async (req, res) => {
  const path = req.query.path as string;
  if (!path?.startsWith("/")) return res.status(400).json({ ok: false, message: "Invalid path" });

  const params = { ...req.query };
  delete params.path;

  try {
    const data = await import("./bioClient").then(m => m.bioGet(path, params));
    res.json(data);
  } catch (err: any) {
    // Handle axios errors and other errors safely
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const statusCode = err.response?.status || 500;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const responseData = err.response?.data;
    const message = err instanceof Error ? err.message : 'Unknown error';
    
    res.status(statusCode).json(responseData || { message });
  }
});
app.use(globalErrorHandler);

export default app;
