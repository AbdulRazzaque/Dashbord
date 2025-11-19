import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import { asyncWrapper } from "../../utils/wrapper";
import logger from "../config/logger";

import { EmployeeController } from "../controllers/employeeController";
import { EmployeeService } from "../services/employeeService";

const employeeService = new EmployeeService

const employeeController  = new EmployeeController(
    logger,
    employeeService
)
const router = Router();

router.get(
    "/employees",
    authenticate,
    asyncWrapper(employeeController.getEmployees),
);
router.post(
    "/employee/search",
    authenticate,
    asyncWrapper(employeeController.searchEmployee),
);

export default router;