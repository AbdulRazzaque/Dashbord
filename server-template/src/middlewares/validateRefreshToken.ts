import { expressjwt } from "express-jwt";
import { Config } from "../config";
import { Request } from "express";
import { AuthCookie } from "../types";
import logger from "../config/logger";
import refreshTokenModel from "../models/refreshTokenModel";

export default expressjwt({
    secret: Config.REFRESH_SECRET!,
    algorithms: ["HS256"],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie;
        return refreshToken;
    },
    async isRevoked(request: Request, token) {
        try {
            const refreshToken = await refreshTokenModel.findById(
                token?.payload.sub,
            );
            return refreshToken === null;
        } catch (err) {
            logger.error("Error while getting the refresh token", {
                userId: String(token?.payload.sub),
            });
        }
        return true;
    },
});
