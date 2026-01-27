import { Router } from "express";
import authenticate from "../middlewares/authenticate";
import { asyncWrapper } from "../../utils/wrapper";
import logger from "../config/logger";

import { EmployeeController } from "../controllers/employeeController";
import { EmployeeService } from "../services/EmployeeService";

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
router.get(
    "/employeeCount",
    authenticate,
    asyncWrapper(employeeController.getEmployeeCount),
);
router.get(
    "/singleEmployee/:id",
    authenticate,
    asyncWrapper(employeeController.getSingleEmployee),
);
router.post(
    "/employee/search",
    authenticate,
    asyncWrapper(employeeController.searchEmployee),
);

router.get(
    "/isExclude/:id",
    authenticate,
    asyncWrapper(employeeController.excludeToggle),
);
export default router;