import { Request, Response } from "express";

import PunchModel, { IPunch } from "../models/PunchModel";
import { Logger } from "winston";
import { PunchSummaryDTO } from "../types";
import { PunchService } from "../services/punchService";

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
        emp: d.emp,
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

  // Returns per-employee daily summary similar to the table shown in UI
  fetchTodaySummary = async (req: Request, res: Response) => {
    try {
      const saved = await this.punchService.fetchAndSaveTodayPunches();

      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
      const search = (req.query.search as string | undefined)?.trim() || "";
      const stateFilter = (req.query.state as string | undefined)?.trim() || "";

      const today = new Date().toISOString().slice(0, 10);
      const start = new Date(`${today}T00:00:00.000Z`);
      const end = new Date(`${today}T23:59:59.999Z`);

      const docs = await PunchModel.find({
        punch_time: { $gte: start, $lte: end },
      })
        .select({
          emp: 1,
          first_name: 1,
          punch_time: 1,
          punch_state_display: 1,
          raw: 1,
        })
        .sort({ punch_time: 1 })
        .lean<IPunch[]>();

      // Group by employee id
      const byEmp = new Map<number, IPunch[]>();
      for (const d of docs) {
        if (typeof d.emp !== "number") continue;
        const arr = byEmp.get(d.emp) || [];
        arr.push(d as IPunch);
        byEmp.set(d.emp, arr);
      }

      const results: PunchSummaryDTO[] = [];
      for (const [emp, records] of byEmp.entries()) {
        if (records.length === 0) continue;

        // records are sorted by punch_time ascending
        const name = records[0].first_name || records[0].raw?.first_name || "Unknown";

        const firstEvent: Date | null = records[0].punch_time ?? null;
        const checkIn: Date | null = firstEvent; // arrival time is first event
        // Determine explicit checkout (only consider 'Check Out' state)
        const checkoutEvents = records.filter((r) => r.punch_state_display === "Check Out" && r.punch_time);
        const checkOut: Date | null = checkoutEvents.length
          ? checkoutEvents[checkoutEvents.length - 1].punch_time!
          : null;

        // Total minutes between first and last event
        const totalMinutes = checkIn && checkOut
          ? Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / 60000))
          : 0;
        const netMinutes = totalMinutes; // No break calculation per new requirement

        // Compute status based on business rules
        // - If checkout exists: Out if >= 15:30, else Early Out
        // - Else if checkin exists: Late if > 08:30, else Present
        // - Else Unknown
        const status = (() => {
          if (checkOut) {
            const cutoffOut = new Date(checkOut);
            cutoffOut.setHours(15, 30, 0, 0); // 15:30 local
            return checkOut.getTime() < cutoffOut.getTime() ? "Early Out" : "Out";
          }
          if (checkIn) {
            const cutoffLate = new Date(checkIn);
            cutoffLate.setHours(8, 30, 0, 0); // 08:30 local
            return checkIn.getTime() > cutoffLate.getTime() ? "Late" : "Present";
          }
          return "Unknown";
        })();

        const item: PunchSummaryDTO = {
          id: emp,
          emp,
          name,
          checkIn,
          checkOut,
          totalMinutes,
          netMinutes,
          status,
        };
        results.push(item);
      }

      // Filtering by search and state
      let filtered = results;
      if (search) {
        const searchNum = Number(search);
        const isNum = !Number.isNaN(searchNum);
        filtered = filtered.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) || (isNum && r.emp === searchNum)
        );
      }
      if (stateFilter) {
        filtered = filtered.filter((r) => r.status === stateFilter);
      }

      const total = filtered.length;
      const startIdx = (page - 1) * limit;
      const data = filtered.slice(startIdx, startIdx + limit);

      res.json({ ok: true, saved, page, limit, total, data });
    } catch (err: any) {
      this.logger.error("Error fetching today summary:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, message });
    }
  };
}
