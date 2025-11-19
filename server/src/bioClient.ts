import axios from "axios";
import { BioTimeResponse } from "./types";
import logger from "./config/logger";

const BASE = process.env.BIOTIME_URL || "http://192.168.1.51";
const client = axios.create({
  baseURL: BASE,
  timeout: 15000,
});

let lastLoginAt = 0;
let jwtToken: string | null = null;

const setAuthHeader = (token: string, scheme: "JWT" | "Bearer" = "JWT") => {
  client.defaults.headers.common.Authorization = `${scheme} ${token}`;
};

const loginWithJwt = async () => {
  const username = process.env.BIOTIME_USER || "";
  const password = process.env.BIOTIME_PASS || "";

  logger.debug(`JWT login attempt with user: ${username}`);
  const resp = await client.post(
    "/jwt-api-token-auth/",
    { username, password },
    {
      headers: { "Content-Type": "application/json" },
      // Accept 200 only; other codes will throw
      validateStatus: (s: number) => s === 200,
    }
  );

  // Support common token field names
  const data = resp.data as unknown as Record<string, unknown>;
  const token = (data?.token || data?.access || data?.access_token) as string | undefined;
  if (!token) {
    throw new Error("JWT login succeeded but no token returned");
  }
  jwtToken = token;
  setAuthHeader(jwtToken, "JWT");
  lastLoginAt = Date.now();
  logger.info("BioTime JWT login successful");
};

const ensureLogin = async (force = false) => {
  if (!force && jwtToken && Date.now() - lastLoginAt < 30 * 60 * 1000) {
    return;
  }
  try {
    await loginWithJwt();
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger.error("Login failed:", e?.message || e);
    throw e;
  }
};

export const bioGet = async <T = any>(path: string, params = {}): Promise<BioTimeResponse<T>> => {
  await ensureLogin();
  try {
    const res = await client.get(path, { params });
    return res.data as BioTimeResponse<T>;
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const status = err?.response?.status as number | undefined;
    if (status === 401 || status === 403) {
      logger.warn(`Authentication failed (${status}), retrying JWT login`);
      await ensureLogin(true);
      const res = await client.get(path, { params });
      return res.data as BioTimeResponse<T>;
    }
    throw err;
  }
};