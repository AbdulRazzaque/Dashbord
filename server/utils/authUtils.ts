import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserData } from "../src/types";
import { Config } from "../src/config";
import { TokenService } from "../src/services/TokenService";

export async function handleAuthTokens(
    user: UserData,
    tokenService: TokenService,
    res: Response,
    rememberMe: boolean,
) {
    const payload: JwtPayload = {
        sub: String(user._id),
        role: user.role,
    };

    const accessToken = tokenService.generateAccessToken(payload);

    const newRefreshToken = await tokenService.persistRefreshToken(user._id);

    const refreshToken = tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
    });

    // In local dev we want cookies to work over http://localhost without Secure and with SameSite=lax
     const isDev = (process.env.NODE_ENV || Config.NODE_ENV) === "dev";

       // Decide SameSite mode:
    // - In dev: use 'lax' (same-site between localhost:3000 and localhost:5501 still counts as same-site)
    // - In prod: default to 'none' only when truly cross-site; otherwise 'lax'
    let sameSiteMode: "lax" | "none" = isDev ? "lax" : "lax";
    if (!isDev) {
        try {
            if (process.env.FRONTEND_URL && process.env.BACKEND_URL) {
                const f = new URL(process.env.FRONTEND_URL);
                const b = new URL(process.env.BACKEND_URL);
                // Treat different origins as potential cross-site; in production require SameSite=None
                if (f.origin !== b.origin) {
                    sameSiteMode = "none";
                }
            }
        } catch {
            // ignore URL parse issues and keep default
        }
    }

       // Cookie options
    const baseOptions: any = {
        httpOnly: true,
        path: "/",
        sameSite: sameSiteMode,
        // Secure must be true when SameSite=None per browser requirements; keep false in dev for http
        secure: !isDev && (sameSiteMode === "none" || process.env.NODE_ENV === "production"),
    };
     const accessOptions = {
        ...baseOptions,
        // access token TTL aligns with JWT (1 day)
        ...(rememberMe && { maxAge: 1000 * 60 * 60 * 24 }),
    } as any;

    const refreshOptions = {
        ...baseOptions,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    } as any;

        // Only set Domain when using a real registrable domain. Avoid 'localhost' in dev (host-only cookies work on both ports).
    if (Config.MAIN_DOMAIN && Config.MAIN_DOMAIN !== "localhost") {
        accessOptions.domain = Config.MAIN_DOMAIN;
        refreshOptions.domain = Config.MAIN_DOMAIN;
    }
      // Set cookies
    res.cookie("accessToken", accessToken, accessOptions);
    res.cookie("refreshToken", refreshToken, refreshOptions);

    return { accessToken, refreshToken, role: user.role };
}
