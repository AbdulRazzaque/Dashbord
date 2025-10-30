import express from "express";
import { UserService } from "../services/UserService";
import logger from "../config/logger";
import registerValidator from "../validators/register-validator";
import { AuthController } from "../controllers/AuthController";
import { TokenService } from "../services/TokenService";
import { VerificationTokenService } from "../services/VerificationTokenService";
import parseRefreshToken from "../middlewares/parseRefreshToken";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import loginValidator from "../validators/login-validator";
import authenticate from "../middlewares/authenticate";
import { CredentialService } from "../services/CredentialService";
import { asyncWrapper } from "../../utils/wrapper";

const router = express.Router();

const userService = new UserService();
const credentialService = new CredentialService();
const resfreshTokenService = new TokenService();
const verifyTokenService = new VerificationTokenService();

const authController = new AuthController(
    logger,
    userService,
    credentialService,
    resfreshTokenService,
    verifyTokenService,
);

/**
 * register user endpoint
 */
router.post(
    "/register",
    registerValidator,
    asyncWrapper(authController.register),
);

/**
 * verify user endpoint
 */
router.get("/:id/verify/:token", asyncWrapper(authController.verifyUser));

/**
 * login user endpoint
 */
router.post("/login", loginValidator, asyncWrapper(authController.login));

/**
 * refresh token endpoint
 */
router.post(
    "/refresh",
    validateRefreshToken,
    asyncWrapper(authController.refresh),
);

/**
 * get profile endpoint
 */
router.get("/me", authenticate, asyncWrapper(authController.self));

/**
 * logout endpoint
 */
router.post(
    "/logout",
    authenticate,
    parseRefreshToken,
    asyncWrapper(authController.logout),
);

/**
 * send password reset link endpoint
 */
router.post(
    "/send-password-link",
    asyncWrapper(authController.sendPasswordLink),
);

/**
 * update password endpoint
 */
router.patch("/update-password", asyncWrapper(authController.updatePassword));

export default router;
