// controllers/AbsentController.ts
import { Request, Response } from "express";
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
}
