import { bioGet } from "../bioClient";
import PunchModel, { IPunch } from "../models/PunchModel";
import { BioTimePunch, EmployeeDay, FetchPunchesOptions, TimeStatus } from "../types";
import logger from "../config/logger";
import { EmployeeDayModel } from "../models/EmployeeDay";
import { EmployeeService } from "./EmployeeService";
import { AbsentService } from "./AbsentService";
import { getUtcDay } from "../../utils/dateUtils";


// Helper function to safely extract employee name as string
function extractEmployeeName(punch: any): string {
  if (!punch) return "Unknown";
  
  // Try direct first_name field
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof punch.first_name === "string" && punch.first_name.trim()) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return punch.first_name.trim() as string;
  }
  
  // Try raw object
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (punch.raw) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof punch.raw.full_name === "string" && punch.raw.full_name.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return punch.raw.full_name.trim() as string;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof punch.raw.format_name === "string" && punch.raw.format_name.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return punch.raw.format_name.trim() as string;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof punch.raw.first_name === "string" && punch.raw.first_name.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const firstName = punch.raw.first_name.trim() as string;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const lastName = typeof punch.raw.last_name === "string" ? (punch.raw.last_name.trim() as string) : "";
      return lastName ? `${firstName} ${lastName}` : firstName;
    }
  }
  
  return "Unknown";
}


// helper format
const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

function sanitizeEmployeeDay(record: EmployeeDay): EmployeeDay {
  if (record.checkIn && record.checkOut && record.checkIn.time === record.checkOut.time) {
    return { ...record, checkOut: null, totalHours: 0 };
  }
  return record;
}


export class PunchService {
  fetchAndSaveTodayPunches = async (options: FetchPunchesOptions = {}): Promise<number> => {
    const today = new Date().toISOString().slice(0, 10);
    const start = options.start_time || `${today} 00:00:00`;
    const end = options.end_time || `${today} 23:59:59`;
    const pageSize = options.page_size || 200;
    const maxPages = options.maxPages || 200; // guard against infinite loops

    let totalSaved = 0;
    for (let page = 1; page <= maxPages; page++) {
      const res = await bioGet<BioTimePunch>("/iclock/api/transactions/", {
        start_time: start,
        end_time: end,
        page,
        page_size: pageSize,
      });

      if (!Array.isArray(res.data) || res.data.length === 0) break;

      for (const rec of res.data) {
        const punchId = rec.id ?? rec.punch_id;
        if (typeof punchId !== "number") continue;
        const toSave: Partial<IPunch> = {
          ...rec,
          punch_id: punchId,
          punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
          upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
          raw: rec,
        };
        await PunchModel.updateOne({ punch_id: punchId }, { $set: toSave }, { upsert: true });
        totalSaved++;
      }

      if (!res.next) break;
    }

    // if (totalSaved > 0) logger.info(`Saved/Updated ${totalSaved} punches`);
    try {
      await this.getEmployeeHours({
        start_time: options.start_time || `${today}T00:00:00Z`,
        end_time: options.end_time || `${today}T23:59:59Z`,
      })
    } catch (error) {
       logger.error("Error generating EmployeeDay after saving punches:", error);
    }
    return totalSaved;
  };

  
 // Validate checkout for display
  // Validate checkout (only consider punches after 10AM)
  validateCheckout(checkOut: Date | null): Date | null {
    
const CHECKOUT_VALID_HOUR = 10; // 10:00 AM
    if (!checkOut) return null;
    const cutoff = new Date(checkOut);
    cutoff.setHours(CHECKOUT_VALID_HOUR, 0, 0, 0);
    return checkOut > cutoff ? checkOut : null;
  }

 

async getEmployeeHours(
  options: FetchPunchesOptions = {}
): Promise<EmployeeDay[]> {

  // ===== CONFIG =====
  const CHECKIN_CUTOFF_HOUR = 8;
  const CHECKIN_CUTOFF_MIN = 30;
  const CHECKOUT_DECISION_HOUR = 10; // 🔥 YOUR RULE

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
    const dateKey = new Date(d.punch_time).toISOString().split("T")[0];

    if (!employeesMap[empId]) employeesMap[empId] = {};
    if (!employeesMap[empId][dateKey]) employeesMap[empId][dateKey] = [];

    employeesMap[empId][dateKey].push(d);
  }

  const result: EmployeeDay[] = [];

  // ===== PROCESS (first punch = checkIn, last punch = checkOut) =====
  for (const empId in employeesMap) {
    for (const dateKey in employeesMap[empId]) {

      const punches = employeesMap[empId][dateKey];
      const firstPunch = punches[0];
      const lastPunch = punches[punches.length - 1];

      const firstPunchTime = new Date(firstPunch.punch_time!);
      const lastPunchTime = new Date(lastPunch.punch_time!);

      let checkIn: TimeStatus | null = null;
      let checkOut: TimeStatus | null = null;

      // ===== CHECKIN (first punch before 10 AM) =====
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
      // Single punch or duplicate same-time punches → never set both In and Out
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

      // ===== TOTAL HOURS =====
      let totalHours = 0;
      if (checkIn && checkOut) {
        const diffMs = lastPunchTime.getTime() - firstPunchTime.getTime();
        totalHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
      }

      // ===== BUILD RECORD (clear fake checkout: same time as checkIn) =====
      let finalCheckOut = checkOut;
      if (checkIn && checkOut && checkIn.time === checkOut.time) {
        finalCheckOut = null;
        totalHours = 0;
      }

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

      // Use Date for date field so EmployeeDay matches AbsentService/cron (getUtcDay()) and report queries
      const dateAsDate = new Date(dateKey);
      if (finalCheckOut === null) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentionally omit checkOut for $unset
        const { checkOut: _omit, ...setFields } = dayRecord;
        await EmployeeDayModel.updateOne(
          { emp_code: Number(empId), date: dateAsDate },
          { $set: setFields, $unset: { checkOut: 1 } },
          { upsert: true }
        );
      } else {
        await EmployeeDayModel.updateOne(
          { emp_code: Number(empId), date: dateAsDate },
          { $set: dayRecord },
          { upsert: true }
        );
      }

      result.push(dayRecord);
    }
  }

  return result.map(sanitizeEmployeeDay);
}

  saveWebhookPunch = async (payload: unknown): Promise<number> => {
    const records = Array.isArray(payload) ? (payload as BioTimePunch[]) : [payload as BioTimePunch];
    let saved = 0;
    for (const rec of records) {
      const punchId = rec?.id ?? rec?.punch_id;
      if (!rec || typeof punchId !== "number") continue;
      const toSave: Partial<IPunch> = {
        ...rec,
        punch_id: punchId,
        punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
        upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
        raw: rec,
      };
      await PunchModel.updateOne({ punch_id: punchId }, { $set: toSave }, { upsert: true });
      saved++;
    }
    return saved;
  };

  /** Manual add punch: save check-in (and optional check-out), update EmployeeDay, remove from absent. */
  addManualPunch = async (params: {
    emp_code: number;
    date: string; // YYYY-MM-DD
    checkInTime: string; // HH:mm
    checkOutTime?: string; // HH:mm optional
  }): Promise<{ punchesSaved: number; absentRemoved: number }> => {
    const { emp_code, date, checkInTime, checkOutTime } = params;
    const employeeService = new EmployeeService();
    const absentService = new AbsentService();
    const [y, m, d] = date.split("-").map(Number);
    if (!y || !m || !d) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    // Use local date/time so 12:00 PM stays 12:00 PM when displayed (formatTime uses toLocaleTimeString)
    const parseTime = (time: string): Date => {
      const [hh, mm] = time.split(":").map(Number);
      return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0);
    };
    const baseDay = new Date(y, m - 1, d, 0, 0, 0, 0);
    const checkInDate = parseTime(checkInTime);
    const checkOutDate = checkOutTime ? parseTime(checkOutTime) : null;
    const res = await employeeService.getEmployees();
    const employees = (res?.data ?? []) as Array<{ emp_code: number; first_name: string }>;
    const emp = employees.find((e) => e.emp_code === emp_code);
    const first_name = emp?.first_name ?? "Unknown";
    const baseId = -Math.floor(Date.now() * 1000);
    const rawBase: BioTimePunch = {
      punch_id: baseId,
      emp_code,
      first_name,
      punch_time: checkInDate.toISOString(),
      punch_state_display: "Check In",
      raw: {} as BioTimePunch,
    };
    const toSaveIn: Partial<IPunch> = {
      punch_id: baseId,
      emp_code,
      first_name,
      punch_time: checkInDate,
      upload_time: new Date(),
      raw: rawBase,
    };
    await PunchModel.updateOne({ punch_id: baseId }, { $set: toSaveIn }, { upsert: true });
    let punchesSaved = 1;
    if (checkOutDate && checkOutDate.getTime() > checkInDate.getTime()) {
      const outId = baseId - 1;
      const rawOut: BioTimePunch = {
        ...rawBase,
        punch_id: outId,
        punch_time: checkOutDate.toISOString(),
        punch_state_display: "Check Out",
      };
      const toSaveOut: Partial<IPunch> = {
        punch_id: outId,
        emp_code,
        first_name,
        punch_time: checkOutDate,
        upload_time: new Date(),
        raw: rawOut,
      };
      await PunchModel.updateOne({ punch_id: outId }, { $set: toSaveOut }, { upsert: true });
      punchesSaved = 2;
    }
    const start = new Date(baseDay);
    const end = new Date(baseDay.getTime() + 24 * 60 * 60 * 1000 - 1);
    await this.getEmployeeHours({
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });
    const utcDayForAbsent = getUtcDay(new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0)));
    const { deleted } = await absentService.removeAbsentForEmployee(emp_code, utcDayForAbsent);
    return { punchesSaved, absentRemoved: deleted };
  };

  searchEmployeeDash = async (userId: string, search: string, filter: string) => {
    interface QueryType {
      first_name?: { $regex: string; $options: string };
      $or?: Array<any>;
    }

    const query: QueryType = {};

    if (search) {
      query.first_name = { $regex: search, $options: "i" };
    }

    if (filter && filter !== "all") {
      query.$or = [
        { "checkIn.status": filter },
        { "checkOut.status": filter },
      ];
    }

    const total = await EmployeeDayModel.countDocuments(query);

    const employees = await EmployeeDayModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean();

    const sanitized = (employees as EmployeeDay[]).map(sanitizeEmployeeDay);

    return {
      employees: sanitized,
      total,
    };
  };
}

