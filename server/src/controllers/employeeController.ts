import { NextFunction, Request, Response } from "express";

import { Request as AuthRequest } from "express-jwt";
import { Logger } from "winston";

import { SearchParams } from "../types";
import { EmployeeService } from "../services/EmployeeService";

interface ErrorResponse {
  response?: {
    status?: number;
    data?: any;
  };
  message?: string;
}



export class EmployeeController {

  constructor (
        private logger: Logger,
        private EmployeeService : EmployeeService

  ){}

getEmployees = async (req: Request, res: Response) => {
  try {
    const data = await this.EmployeeService.getEmployees();

    res.json({
      ok: true,
      count: data.count,
      data: data.data,
    });

  } catch (err) {
    
    const errorObj = err as ErrorResponse;
    const status = errorObj?.response?.status || 500;
    const errorData = errorObj?.response?.data || { message: errorObj?.message || 'Unknown error' };
    res.status(status).json(errorData);
  }
};

getSingleEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;

    try {
        const data = await this.EmployeeService.getSingleEmployee(id);
        res.status(200).json(data); 
    } catch (error) {
        return next(error);
    }
};


excludeToggle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
       
       if (!id || id === 'undefined') 
        {
          return res.status(400).json({ errors: [{ msg: "Missing or invalid id param" }] });
      }
      const employeeId = Number(id);
      
      if (isNaN(employeeId)) {
          return res.status(400).json({ errors: [{ msg: "Invalid employee ID format" }] });
      }
      
        const employee = await this.EmployeeService.isExclude(employeeId);

        res.status(200).json({
             message: `Employee ${employee.isExcluded ? "Excluded" : "Un-Excluded"} successfully`,
            status: employee.isExcluded,
             data: { emp_code: employee._id }
        });

    } catch (error) {
        this.logger.error("Error in exclude toggle", { error });
        next(error);
    }
};

  searchEmployee = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction,
    ) => {
        try {
          const body = req.body as Partial<SearchParams>;
           const searchParams: SearchParams = {
            query: body.query ?? '',
            categoryId: body.categoryId,
            role: body.role,
            page: Number(body.page ?? 1),
            limit: Math.min(Number(body.limit ?? 10), 100), // prevent huge limits
        };
            const results =
                await this.EmployeeService.searchEmployees(searchParams);

            res.status(200).json(results);
        } catch (error) {
            this.logger.error(error);
            return next(error);
        }
    };



  }