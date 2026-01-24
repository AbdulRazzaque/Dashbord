import { Router } from "express";
import { AbsentController } from "../controllers/AbsentController";
import { AbsentService } from "../services/AbsentService";
import logger from "../config/logger";
import { asyncWrapper } from "../../utils/wrapper";
const router = Router();

const absentService = new AbsentService();
const absentController = new AbsentController(
  logger,
  absentService
);


router.post(
  "/run",
  // isAdmin,   // ✅ strongly recommended
 asyncWrapper(() => absentController.markTodayAbsent)
);

export default router;
