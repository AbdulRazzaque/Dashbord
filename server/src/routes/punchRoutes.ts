import { Router } from "express";
import {  PunchController } from "../controllers/punchController";
import authenticate from "../middlewares/authenticate";
import { asyncWrapper } from "../../utils/wrapper";
import logger from "../config/logger";
import { PunchService } from "../services/punchService";

const punchService = new PunchService();
const punchController = new PunchController(
    logger,
    punchService
);
const router = Router();

router.get(
    "/fetch-today",
    authenticate,
    asyncWrapper(punchController.fetchToday),
);

router.get(
    "/fetch-today-summary",
    authenticate,
    asyncWrapper(punchController.fetchTodaySummary),
);

router.post(
    "/webhook/punch",
    authenticate,
    asyncWrapper(punchController.webhookPunch),
);
export default router;