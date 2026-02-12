import { HttpError } from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { NextFunction, Request, Response } from "express";
import logger from "../config/logger";
import { Config } from "../config";

/** Clear auth cookies so expired/invalid JWT does not leave stale cookies. */
function clearAuthCookies(res: Response): void {
    const opts: { path: string; domain?: string } = { path: "/" };
    if (Config.MAIN_DOMAIN && Config.MAIN_DOMAIN !== "localhost") {
        opts.domain = Config.MAIN_DOMAIN;
    }
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

    // When JWT is expired or invalid (401 / UnauthorizedError), clear auth cookies so client does not keep sending them
    if (statusCode === 401 || (err as { name?: string }).name === "UnauthorizedError") {
        clearAuthCookies(res);
    }

    logger.error(err.message, {
        id: errorId,
        error: err.stack,
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
