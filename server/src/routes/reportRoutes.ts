import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import { asyncWrapper } from "../../utils/wrapper";
import logger from "../config/logger";
import { ReportController } from "../controllers/reportController";
import { ReportService } from "../services/ReportService";

const reportService = new ReportService();
const reportController = new ReportController(logger, reportService);
const router = Router();

router.get(
  "/reports/employees",
  authenticate,
  asyncWrapper(reportController.getReportEmployees)
);

router.get(
  "/reports/monthly-matrix",
  authenticate,
  asyncWrapper(reportController.getMonthlyMatrix)
);

router.get(
  "/reports/attendance-chart",
  authenticate,
  asyncWrapper(reportController.getAttendanceChart)
);

export default router;
