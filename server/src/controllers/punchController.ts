import { NextFunction, Request, Response } from "express";

import PunchModel, { IPunch }  from "../models/PunchModel";
import { Logger } from "winston";

import { PunchService } from "../services/punchService";
import { Request as AuthRequest } from "express-jwt";
import { EmployeeDay, FetchPunchesOptions, TimeStatus } from "../types";
import { EmployeeDayModel } from "../models/EmployeeDay";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function extractEmployeeName(punch: IPunch | { first_name?: string; raw?: Record<string, unknown> }): string {
  if (!punch) return "Unknown";
  if (typeof punch.first_name === "string" && punch.first_name.trim()) {
    return punch.first_name.trim();
  }
  const raw = punch.raw as Record<string, unknown> | undefined;
  if (raw) {
    if (typeof raw.full_name === "string" && raw.full_name.trim()) return raw.full_name.trim();
    if (typeof raw.format_name === "string" && raw.format_name.trim()) return raw.format_name.trim();
    if (typeof raw.first_name === "string" && raw.first_name.trim()) {
      const firstName = raw.first_name.trim();
      const lastName = typeof raw.last_name === "string" ? String(raw.last_name).trim() : "";
      return lastName ? `${firstName} ${lastName}` : firstName;
    }
  }
  return "Unknown";
}

export class PunchController {
  constructor(private logger: Logger, private punchService: PunchService) {}

  fetchToday = async (req: Request, res: Response) => {
    try {
      
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
      res.json({ ok: true, page, limit, total, data });
     
    } catch (err: any) {
      this.logger.error("Error fetching today's punches:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, message });
    }
  };
  async getEmployeeHours(
    options: FetchPunchesOptions = {}
  ): Promise<EmployeeDay[]> {
  
    // ===== CONFIG =====
    const CHECKIN_CUTOFF_HOUR = 8;
    const CHECKIN_CUTOFF_MIN = 30;
    const CHECKOUT_DECISION_HOUR = 10;
  
    // ===== DATE RANGE =====
    const today = new Date().toISOString().slice(0, 10);
    const start = options.start_time
      ? new Date(options.start_time)
      : new Date(`${today}T00:00:00.000Z`);
    const end = options.end_time
      ? new Date(options.end_time)
      : new Date(`${today}T23:59:59.999Z`);
  
    // ===== FETCH PUNCHES =====
    const docs = await PunchModel.find({
      punch_time: { $gte: start, $lte: end },
    })
      .sort({ punch_time: 1 })
      .lean<IPunch[]>();
  
    // ===== GROUP BY EMP + DATE =====
    const employeesMap: Record<string, Record<string, IPunch[]>> = {};
  
    for (const d of docs) {
      if (!d.punch_time || !d.emp_code) continue;
  
      const empId = String(d.emp_code);
      // ⚠️ Timezone fix: ISO string se date lo
      const dateKey = new Date(d.punch_time).toISOString().split("T")[0];
  
      if (!employeesMap[empId]) employeesMap[empId] = {};
      if (!employeesMap[empId][dateKey]) employeesMap[empId][dateKey] = [];
  
      employeesMap[empId][dateKey].push(d);
    }
  
    const result: EmployeeDay[] = [];
  
    // ===== PROCESS =====
    for (const empId in employeesMap) {
      for (const dateKey in employeesMap[empId]) {
        
        const punches = employeesMap[empId][dateKey];
        const firstPunch = punches[0];
        const lastPunch = punches[punches.length - 1]; // 🔥 Aakhri punch bhi lo
        
        const firstPunchTime = new Date(firstPunch.punch_time!);
        const lastPunchTime = new Date(lastPunch.punch_time!);
  
        let checkIn: TimeStatus | null = null;
        let checkOut: TimeStatus | null = null;
  
        // ===== CHECKIN LOGIC (first punch before 10 AM) =====
        if (firstPunchTime.getHours() < CHECKOUT_DECISION_HOUR) {
          const isLate =
            firstPunchTime.getHours() > CHECKIN_CUTOFF_HOUR ||
            (firstPunchTime.getHours() === CHECKIN_CUTOFF_HOUR &&
              firstPunchTime.getMinutes() > CHECKIN_CUTOFF_MIN);
  
          checkIn = {
            time: formatTime(firstPunchTime),
            status: isLate ? "Late" : "Present",
          };
        }
  
        // ===== CHECKOUT: only when (a) 2+ punches with different times, or (b) 1 punch after 10 AM =====
        // Single punch or duplicate same-time → never show both In and Out
        const hasRealCheckout =
          (punches.length > 1 && lastPunchTime.getTime() > firstPunchTime.getTime()) ||
          (punches.length === 1 && firstPunchTime.getHours() >= CHECKOUT_DECISION_HOUR);

        if (hasRealCheckout) {
          const checkoutTime = lastPunchTime;
          const isEarly =
            checkoutTime.getHours() < 15 ||
            (checkoutTime.getHours() === 15 && checkoutTime.getMinutes() < 30);
  
          checkOut = {
            time: formatTime(checkoutTime),
            status: isEarly ? "Early Out" : "Checkout",
          };
        }
  
        // ===== TOTAL HOURS CALCULATION =====
        let totalHours = 0;
        if (checkIn && checkOut) {
          const diffMs = lastPunchTime.getTime() - firstPunchTime.getTime();
          totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // 2 decimal places
        }

        // ===== CLEAR FAKE CHECKOUT (same time as checkIn) =====
        let finalCheckOut = checkOut;
        if (checkIn && checkOut && checkIn.time === checkOut.time) {
          finalCheckOut = null;
          totalHours = 0;
        }
  
        // ===== SAVE TO DB =====
        const dayRecord: EmployeeDay = {
          emp_code: Number(empId),
          first_name: extractEmployeeName(firstPunch),
          department: firstPunch.raw?.department || "Department",
          position: firstPunch.raw?.position || "Unknown",
          date: new Date(dateKey),
          checkIn,
          checkOut: finalCheckOut,
          totalHours,
          raw: firstPunch.raw || {},
        };

        // Cannot use $set and $unset on same path in one update — use only $unset when clearing checkOut
        if (finalCheckOut === null) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentionally omit checkOut for $unset
          const { checkOut: _omit, ...setFields } = dayRecord;
          await EmployeeDayModel.updateOne(
            { emp_code: Number(empId), date: dateKey },
            { $set: setFields, $unset: { checkOut: 1 } },
            { upsert: true }
          );
        } else {
          await EmployeeDayModel.updateOne(
            { emp_code: Number(empId), date: dateKey },
            { $set: dayRecord },
            { upsert: true }
          );
        }
  
        result.push(dayRecord);
      }
    }
  
    return result;
  }

  fetchHours = async (req: Request, res: Response) => {
    try {
      const start_time = (req.query.start_time as string) || undefined;
      const end_time = (req.query.end_time as string) || undefined;
      const data = await this.punchService.getEmployeeHours({ start_time, end_time });
      res.json({ ok: true, data });
    } catch (err: any) {
      this.logger.error("Error fetching employee hours:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ ok: false, message });
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
