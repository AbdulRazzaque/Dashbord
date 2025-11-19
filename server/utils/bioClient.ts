// src/bioClient.ts ← ULTIMATE WORKING VERSION (November 2025)
import axios, { AxiosInstance } from "axios";
import logger from "../src/config/logger";

// Simple client without cookie jar for now
const client: AxiosInstance = axios.create({
  baseURL: (process.env.BIOTIME_URL || "http://192.168.1.51").replace(/\/+$/, ""),
  timeout: 15000,
  withCredentials: true, // This handles cookies automatically
});

let lastLoginAt = 0;

const extractCsrf = (html: string): string | null => {
  const match = html.match(/name=["']csrfmiddlewaretoken["']\s+value=["']([^"']+)["']/i);
  return match ? match[1] : null;
};

const ensureLogin = async (force = false) => {
  if (!force && Date.now() - lastLoginAt < 25 * 60 * 1000) return;

  try {
    const loginPage = await client.get("/login/");
    const csrfToken = extractCsrf(loginPage.data);
    if (!csrfToken) throw new Error("CSRF token not found");

    const form = new URLSearchParams();
    form.append("username", process.env.BIOTIME_USER!);
    form.append("password", process.env.BIOTIME_PASS!);
    form.append("csrfmiddlewaretoken", csrfToken);

    await client.post("/login/", form, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: `${client.defaults.baseURL}/login/`,
      },
      maxRedirects: 0,
    });

    lastLoginAt = Date.now();
    logger.info("BioTime login successful");
  } catch (err: any) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error("Login failed:", message);
    throw err;
  }
};

export const bioGet = async <T = any>(path: string, params = {}): Promise<T> => {
  await ensureLogin();
  try {
    const res = await client.get<T>(path, { params });
    return res.data;
  } catch (err: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (err.response?.status === 401) {
      await ensureLogin(true);
      const res = await client.get<T>(path, { params });
      return res.data;
    }
    throw err;
  }
};

export { client };