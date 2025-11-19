import { NextFunction, Request, Response } from "express";
import { bioGet } from "../bioClient";
import { Request as AuthRequest } from "express-jwt";
import { Logger } from "winston";

import { SearchParams } from "../types";
import { EmployeeService } from "../services/employeeService";


export class EmployeeController {

  constructor (
        private logger: Logger,
        private EmployeeService : EmployeeService

  ){}

  getEmployees = async (req: Request, res: Response) => {
  try {
    const data = await bioGet("/personnel/api/employee/", req.query);
    res.json(data);
  } catch (err: any) {
    this.logger.error("Error fetching employees:", err);
    
    // Handle axios errors and other errors safely
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const statusCode = err.response?.status || 500;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const responseData = err.response?.data;
    const message = err instanceof Error ? err.message : 'Unknown error';
    
    res.status(statusCode).json(responseData || { message });
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