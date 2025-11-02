import { NextFunction, Request, Response } from "express";
import { Request as AuthRequest } from "express-jwt";
import { Logger } from "winston";
import bcrypt from "bcryptjs";
import { UserService } from "../services/UserService";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { TokenService } from "../services/TokenService";
import { VerificationTokenService } from "../services/VerificationTokenService";
import { handleAuthTokens } from "../../utils/authUtils";

export class AuthController {
    constructor(
        private logger: Logger,
        private userService: UserService,
        private credentialService: CredentialService,
        private tokenService: TokenService,
        private verifyTokenService: VerificationTokenService,
    ) {}

    register = async (req: Request, res: Response, next: NextFunction) => {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {
            firstName,
            lastName,
            email,
            password,
            address,
            mobileNo,
            role,
        } = req.body;

        this.logger.debug("New request to register a user", {
            firstName,
            lastName,
            email,
            password: "******",
            address,
            mobileNo,
            role,
        });

        try {
            const data = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                address,
                mobileNo,
                role,
            });

            res.status(201).json({
                message: `Hey ${data.user.firstName} ${data.user.lastName} An Email sent to your account please verify and continue.`,
            });
        } catch (error) {
            return next(error);
        }
    };

    verifyUser = async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const token = req.params.token;

        try {
            const user = await this.userService.findById(userId);

            if (!user) {
                const error = createHttpError(
                    400,
                    "User with the token could not find",
                );
                next(error);
                return;
            }

            const tokenData = await this.verifyTokenService.findOne(token);

            if (!tokenData) {
                const error = createHttpError(404, "Invalid link");
                next(error);
                return;
            }

            await this.userService.verifyUser(user._id);

            await this.verifyTokenService.delete(tokenData._id);

            res.status(200).json({
                message: "Email verified successfully",
                sessionURL: tokenData.sessionURL,
            });
        } catch (error) {
            return next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        // Validation
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {  email, password, FCMToken, isRemebered } = req.body;
       
        this.logger.debug("New request to login a user", {
            email,
            password: "******",
        });

         const rememberMe = isRemebered ? isRemebered : false;
         
        try {
            const user = await this.userService.findByEmailWithPassword(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "Email or password does not match.",
                );
                next(error);
                return;
            }

            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    "Email or password does not match.",
                );
                next(error);
                return;
            }

            if (FCMToken) {
                await this.userService.savedFCMToken(user._id, FCMToken);
            }

         const tokens =  await handleAuthTokens(
            user, 
            this.tokenService, 
            res,
            rememberMe
        );

        // record login activity (non-blocking)
            // (async () => {
            //     try {
            //         const { AuditService } = await import("../services/AuditService");
            //         const audit = new AuditService();
            //         await audit.record({ entityType: "auth", entityId: String(user._id), action: "login", userId: String(user._id), userName: user.email, meta: { ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress, userAgent: req.headers["user-agent"] } });
            //     } catch {}
            // })();


              res.json({
                id: user.id,
                role: user.role,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
        } catch (error) {
            return next(error);
        }
    };

    self = async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.auth || !req.auth.sub) {
            return next(createHttpError(400, "No user found."));
        }

        const userId: string = req.auth.sub;

        try {
            // token req.auth.id
            const user = await this.userService.findById(userId);

            if (!user) {
                return next(createHttpError(400, "No user found."));
            }

            res.status(200).json(user);
        } catch (error) {
            return next(error);
        }
    };

    refresh = async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.auth || !req.auth.sub) {
            return next(createHttpError(400, "Something went wrong."));
        }

        try {
            const user = await this.userService.findById(req.auth.sub);

            if (!user) {
                const error = createHttpError(
                    400,
                    "User with the token could not find",
                );
                next(error);
                return;
            }

            // Delete old refresh token
            await this.tokenService.deleteRefreshToken(String(req.auth.id));

            const rememberMe = true;
            
              await handleAuthTokens(user, this.tokenService, res, rememberMe);

            this.logger.info("User has been logged in", { id: user.id });
            res.json({ id: user.id });
        } catch (err) {
            next(err);
            return;
        }
    };

    logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.auth || !req.auth.sub) {
            return next(createHttpError(400, "Something went wrong."));
        }

        const { isMobile } = req.body;

        try {
            await this.tokenService.deleteRefreshToken(String(req.auth.jti));

            if (isMobile) {
                await this.userService.removedFCMToken(String(req.auth.sub));
            }

            this.logger.info("Refresh token has been deleted", {
                id: req.auth.id,
            });

            this.logger.info("User has been logged out", { id: req.auth.sub });

             // record logout activity (non-blocking)
            // (async () => {
            //     try {
            //         const { AuditService } = await import("../services/AuditService");
            //         const audit = new AuditService();
            //         await audit.record({ entityType: "auth", entityId: String(req.auth!.sub), action: "logout", userId: String(req.auth!.sub), userName: undefined, meta: { userAgent: req.headers["user-agent"] } });
            //     } catch {}
            // })();

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.json({ message: "Successfully logged out" });
        } catch (err) {
            next(err);
            return;
        }
    };

    sendPasswordLink = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { email } = req.body;

        try {
            const user = await this.userService.findByEmailWithPassword(email);

            if (!user) {
                const error = createHttpError(
                    400,
                    "The email you entered does not match any of our registered users.",
                );
                next(error);
                return;
            }

            const token = await this.verifyTokenService.create(user._id);

            this.logger.info("User has been logged out", token);

            res.status(200).json({
                message: "Password reset link sent to your email account",
            });
        } catch (error) {
            return next(error);
        }
    };

    updatePassword = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { id, password, token } = req.body;

        try {
            const user = await this.userService.findById(id);

            if (!user) {
                const error = createHttpError(
                    400,
                    "The email you entered does not match any of our registered users.",
                );
                next(error);
                return;
            }

            const tokenData = await this.verifyTokenService.findOne(token);

            if (!tokenData) {
                const error = createHttpError(404, "Invalid link");
                next(error);
                return;
            }

            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await this.userService.updatePassword(hashedPassword, user._id);

            await this.verifyTokenService.delete(tokenData._id);

            res.status(200).json({ message: "Password reset sucessfully" });
        } catch (error) {
            return next(error);
        }
    };
}
