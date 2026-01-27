import { Router } from "express";
import { AbsentController } from "../controllers/AbsentController";
import { AbsentService } from "../services/AbsentService";
import logger from "../config/logger";
import { asyncWrapper } from "../../utils/wrapper";
import authenticate from "../middlewares/authenticate";

const router = Router();

const absentService = new AbsentService();
const absentController = new AbsentController(
  logger,
  absentService
);


router.post(
  "/run",
  authenticate,
  // isAdmin,   // ✅ strongly recommended
  asyncWrapper(absentController.markTodayAbsent)
);

router.get(
  "/absentEmployee",
  authenticate,
  asyncWrapper(absentController.getAllAbsent)
);

router.get(
  "/singleAbsentEmployee/:id",
  authenticate,
  asyncWrapper(absentController.getSingleAbsentEmployee),
);
export default router;
