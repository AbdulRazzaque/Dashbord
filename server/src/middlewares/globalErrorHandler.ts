import { HttpError } from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import { Config } from "../config";

const getCookieOpts = (): { path: string; domain?: string } => {
    const opts: { path: string; domain?: string } = { path: "/" };
    if (Config.MAIN_DOMAIN && Config.MAIN_DOMAIN !== "localhost") {
        opts.domain = Config.MAIN_DOMAIN;
    }
    return opts;
};

/** Clear only access token so client can still use refresh token to get new tokens. */
function clearAccessTokenCookie(res: Response): void {
    res.clearCookie("accessToken", getCookieOpts());
}

/** Clear both auth cookies (e.g. when refresh fails or on logout). */
function clearAuthCookies(res: Response): void {
    const opts = getCookieOpts();
    res.clearCookie("accessToken", opts);
    res.clearCookie("refreshToken", opts);
}

export const globalErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const errorId = uuidv4();

    const statusCode = err.status || 500;
    const isProduction = process.env.NODE_ENV === "production";
    const message = isProduction
        ? `An unexpected error occurred.`
        : err.message;

    // On 401: clear only accessToken so client can call /api/auth/refresh with refreshToken cookie.
    // If this 401 is from the refresh endpoint itself, refresh token is bad → clear both cookies.
    if (statusCode === 401 || (err as { name?: string }).name === "UnauthorizedError") {
        if (req.path === "/api/auth/refresh" || req.originalUrl?.includes("/api/auth/refresh")) {
            clearAuthCookies(res);
        } else {
            clearAccessTokenCookie(res);
        }
    }

    // Log 401 (auth) as warn to avoid noise; other errors as error
    const logFn = statusCode === 401 ? logger.warn : logger.error;
    logFn(err.message, {
        id: errorId,
        ...(statusCode !== 401 && { error: err.stack }),
        path: req.path,
        method: req.method,
    });

    res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                type: err.name,
                msg: message,
                path: req.path,
                location: "server",
                stack: isProduction ? null : err.stack,
            },
        ],
    });
};
