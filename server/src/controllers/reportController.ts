import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { ReportService } from "../services/ReportService";
import { ReportMonthlyMatrixFilters } from "../types";

export class ReportController {
  constructor(
    private logger: Logger,
    private reportService: ReportService
  ) {}

  getReportEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = (req.query.search as string | undefined)?.trim();
      const data = await this.reportService.getReportEmployees({
        ...(search ? { search } : {}),
      });
      res.status(200).json({
        ok: true,
        count: data.count,
        data: data.data,
      });
    } catch (err) {
      this.logger.error("Report getReportEmployees error", { error: err });
      next(err);
    }
  };

  getMonthlyMatrix = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = Number(req.query.year);
      const month = Number(req.query.month);
      const employeeId = (req.query.employeeId as string | undefined)?.trim();
      const page = req.query.page != null ? Number(req.query.page) : undefined;
      const limit = req.query.limit != null ? Number(req.query.limit) : undefined;

      if (!Number.isInteger(year) || !Number.isInteger(month)) {
        res.status(400).json({
          ok: false,
          message: "Query params 'year' and 'month' are required and must be integers.",
        });
        return;
      }
      if (month < 0 || month > 11) {
        res.status(400).json({
          ok: false,
          message: "Month must be 0-11 (January = 0).",
        });
        return;
      }

      const filters: ReportMonthlyMatrixFilters | undefined = {};
      const search = (req.query.search as string | undefined)?.trim();
      const status = (req.query.status as string | undefined)?.trim();
      if (search) filters.search = search;
      if (status) {
        const valid = ["present", "absent", "all"];
        if (valid.includes(status)) {
          filters.status = status as ReportMonthlyMatrixFilters["status"];
        }
      }

      const result = await this.reportService.getMonthlyMatrix({
        year,
        month,
        ...(employeeId ? { employeeId } : {}),
        ...(Object.keys(filters).length ? { filters } : {}),
        ...(page != null && page >= 1 ? { page } : {}),
        ...(limit != null && limit >= 1 ? { limit } : {}),
      });

      res.status(200).json({
        ok: true,
        employees: result.employees,
        dailyRecords: result.dailyRecords,
        totalEmployees: result.totalEmployees,
        totalRecords: result.totalRecords,
      });
    } catch (err) {
      this.logger.error("Report getMonthlyMatrix error", { error: err });
      next(err);
    }
  };

  getAttendanceChart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.reportService.getAttendanceChartData();
      res.status(200).json({
        ok: true,
        ...result,
      });
    } catch (err) {
      this.logger.error("Report getAttendanceChart error", { error: err });
      next(err);
    }
  };
}
