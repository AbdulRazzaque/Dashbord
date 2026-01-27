// controllers/AbsentController.ts
import { NextFunction, Request, Response } from "express";
import { AbsentService } from "../services/AbsentService";
import { Logger } from "winston";

export class AbsentController {
  constructor(
    private logger: Logger,
    private absentService: AbsentService
  ) {}

  
  markTodayAbsent = async (req: Request, res: Response) => {
    try {
      const result = await this.absentService.markTodayAbsent();
      res.status(200).json({
        ok: true,
        message: "Absent process completed",
        data: result,
      });
    } catch (error) {
      this.logger.error("Absent marking failed", { error });
      res.status(500).json({
        ok: false,
        message: "Failed to mark absents",
      });
    }
  };

  getAllAbsent = async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 100;
  
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : undefined;
  
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : undefined;
  
      const result = await this.absentService.getAllAbsent({
        page,
        limit,
        startDate,
        endDate,
      });
  
      res.status(200).json({
        ok: true,
        message: "Absent records fetched successfully",
        data: result.data,
        pagination: {
          total: result.total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      this.logger.error("Failed to fetch absent records", { error });
      res.status(500).json({
        ok: false,
        message: "Failed to fetch absent records",
      });
    }
  };

  getSingleAbsentEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const { id } = req.params;
  
    try {
        const data = await this.absentService.SingleAbsentEmployee(id);
        res.status(200).json(data); 
    } catch (error) {
        return next(error);
    }
};
}