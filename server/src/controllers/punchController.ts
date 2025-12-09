import { NextFunction, Request, Response } from "express";

import PunchModel  from "../models/PunchModel";
import { Logger } from "winston";

import { PunchService } from "../services/punchService";
import { Request as AuthRequest } from "express-jwt";

export class PunchController {
  constructor(private logger: Logger, private punchService: PunchService) {}

  fetchToday = async (req: Request, res: Response) => {
    try {
      // Ensure sync from BioTime
      const saved = await this.punchService.fetchAndSaveTodayPunches();

      // Query params
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const search = (req.query.search as string | undefined)?.trim() || "";
      const state = (req.query.state as string | undefined)?.trim() || "";

      const today = new Date().toISOString().slice(0, 10);
      const start = new Date(`${today}T00:00:00.000Z`);
      const end = new Date(`${today}T23:59:59.999Z`);

      const criteria: Record<string, any> = { punch_time: { $gte: start, $lte: end } };
      if (search) {
        const regex = new RegExp(search, "i");
        criteria.$or = [
          { "raw.first_name": regex },
          { "raw.emp_code": regex },
          { emp: Number.isNaN(Number(search)) ? -1 : Number(search) },
        ];
      }
      if (state) {
        criteria["raw.punch_state_display"] = state;
      }

      const total = await PunchModel.countDocuments(criteria);
      const docs: any[] = await PunchModel.find(criteria)
        .sort({ punch_time: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      const data = docs.map((d: any) => ({
        _id: d._id,
        id: d.id,
        emp_code: d.raw?.emp_code,
        first_name: d.first_name ?? d.raw?.first_name,
        punch_state_display: d.punch_state_display ?? d.raw?.punch_state_display,
        punch_time: d.punch_time,
        upload_time: d.upload_time,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        raw: d.raw,
      }));
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */

      res.json({ ok: true, saved, page, limit, total, data });
    } catch (err: any) {
      this.logger.error("Error fetching today's punches:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, message });
    }
  };

    fetchHours = async (req: Request, res: Response) => {
    try {
      const data = await this.punchService.getEmployeeHours();
      
      // Ensure all name fields are strings (defensive programming)
      const sanitizedData = data.map(employee => ({
        ...employee,
        name: typeof employee.name === 'string' ? employee.name : 'Unknown',
        employeeId: Number(employee.employeeId) || 0,
        totalHours: Number(employee.totalHours) || 0,
        date: String(employee.date || ''),
        department: String(employee.department || 'Unknown'),
        position: String(employee.position || 'Unknown')
      }));
      
      res.json({ success: true, data: sanitizedData });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err || "Internal Server Error" });
    }
  };
 searchEmployeeDash = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = String(req.auth!.sub);
        const search = (req.query.q as string) || "";
        const filter = (req.query.filter as string) || "all";

        const data = await this.punchService.searchEmployeeDash(
            userId,
            search,
            filter
        );

        res.status(200).json(data);
    } catch (error) {
        return next(error);
    }
};

  webhookPunch = async (req: Request, res: Response) => {
    try {
      const saved = await this.punchService.saveWebhookPunch(req.body);
      res.json({ ok: true, saved });
    } catch (err: any) {
      this.logger.error("Webhook error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, message });
    }
  };

 
}
