
import { bioGet } from "../bioClient";
import PunchModel, { IPunch } from "../models/PunchModel";
import { BioTimePunch,EmployeeDay, FetchPunchesOptions, TimeStatus } from "../types";
import logger from "../config/logger";
import { EmployeeDayModel } from "../models/EmployeeDay";

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
// ---------------- Helper: Format Time ----------------


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
        if (typeof rec?.id !== "number") continue;
        const toSave: Partial<IPunch> = {
          ...rec,
          punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
          upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
          raw: rec,
        };
        await PunchModel.updateOne({ id: rec.id }, { $set: toSave }, { upsert: true });
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

 
async getEmployeeHours(options: FetchPunchesOptions = {}): Promise<EmployeeDay[]> {
  const CHECKIN_CUTOFF_HOUR = 8;
  const CHECKIN_CUTOFF_MIN = 30;
  const CHECKOUT_CUTOFF_HOUR = 15;
  const CHECKOUT_CUTOFF_MIN = 30;

  const today = new Date().toISOString().slice(0, 10);
  const start = options.start_time || new Date(`${today}T00:00:00Z`);
  const end = options.end_time || new Date(`${today}T23:59:59Z`);

  // fetch punches within start & end time
  const docs = await PunchModel.find({
    punch_time: { $gte: start, $lte: end },
  })
    .sort({ punch_time: 1 })
    .lean();

  const employeesMap: Record<string, Record<string, IPunch[]>> = {};

  for (const d of docs) {
    const empId = String(d.emp_code);
    if (!d.punch_time || !empId) continue;

    const dateKey = new Date(d.punch_time).toISOString().split("T")[0];
    if (!employeesMap[empId]) employeesMap[empId] = {};
    if (!employeesMap[empId][dateKey]) employeesMap[empId][dateKey] = [];
    employeesMap[empId][dateKey].push(d as unknown as IPunch);
  }

  const result: EmployeeDay[] = [];

  for (const empId in employeesMap) {
    for (const dateKey in employeesMap[empId]) {
      const punches = employeesMap[empId][dateKey];

      // ensure punches sorted
          punches.sort(
          (a, b) =>
            (a.punch_time ? new Date(a.punch_time).getTime() : 0) -
            (b.punch_time ? new Date(b.punch_time).getTime() : 0)
        );
      
      const checkInPunch = punches[0] || null;

      let checkOutPunch: IPunch | null = null;
      if (checkInPunch?.punch_time) {
        for (let i = punches.length - 1; i >= 0; i--) {
          const punchTime = punches[i].punch_time;
          if (!punchTime) continue;
          const pTime = new Date(punchTime);
          const inTime = new Date(checkInPunch.punch_time);
          if (pTime.getTime() <= inTime.getTime()) continue;
          if (this.validateCheckout(pTime)) {
            checkOutPunch = punches[i];
            break;
          }
        }
      }

      // Check-in
      let checkIn: TimeStatus | null = null;
      if (checkInPunch?.punch_time) {
        const t = new Date(checkInPunch.punch_time);
        const isLate =
          t.getHours() > CHECKIN_CUTOFF_HOUR ||
          (t.getHours() === CHECKIN_CUTOFF_HOUR && t.getMinutes() > CHECKIN_CUTOFF_MIN);
        checkIn = { time: formatTime(t), status: isLate ? "Late" : "Present" };
      }

      // Check-out & total hours
      let checkOut: TimeStatus | null = null;
      let totalHours = 0;
      if (checkInPunch?.punch_time && checkOutPunch?.punch_time) {
        const inTime = new Date(checkInPunch.punch_time);
        const outTime = new Date(checkOutPunch.punch_time);

        const isEarly =
          outTime.getHours() < CHECKOUT_CUTOFF_HOUR ||
          (outTime.getHours() === CHECKOUT_CUTOFF_HOUR && outTime.getMinutes() < CHECKOUT_CUTOFF_MIN);
        checkOut = { time: formatTime(outTime), status: isEarly ? "Early Out" : "Checkout" };

        // convert to total minutes (correct)
        const diffMs = outTime.getTime() - inTime.getTime();
        totalHours = Math.floor(diffMs / 60000)
      }
        const dayRecord: EmployeeDay = {
          employeeId: Number(empId),
          first_name: extractEmployeeName(checkInPunch),
          department: checkInPunch?.raw?.department || "Department",
          position: checkInPunch?.raw?.position || "Unknown",
          isExcluded:false,
          date: dateKey,
          checkIn,
          checkOut,
          totalHours,
          raw: checkInPunch?.raw || {}
        };

  try {
    await EmployeeDayModel.updateOne(
      { employeeId: empId, date: dateKey },
      { $set: dayRecord },
      { upsert: true }
    );
  } catch (err) {
    logger.error(`Failed to save EmployeeDay for ${empId} on ${dateKey}:`, err);
  }
     result.push(dayRecord);
    }
  }

  return result;
}


  saveWebhookPunch = async (payload: unknown): Promise<number> => {
    const records = Array.isArray(payload) ? (payload as BioTimePunch[]) : [payload as BioTimePunch];
    let saved = 0;
    for (const rec of records) {
      if (!rec || typeof rec.id !== "number") continue;
      const toSave: Partial<IPunch> = {
        ...rec,
        punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
        upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
        raw: rec,
      };
      await PunchModel.updateOne({ id: rec.id }, { $set: toSave }, { upsert: true });
      saved++;
    }
    return saved;
  };

async searchEmployeeDash(userId: string, search: string, filter: string) {
 
       interface QueryType {
        name?: { $regex: string; $options: string };
        $or?: Array<any>;
    }


    // INITIAL EMPTY QUERY
    const query: QueryType = {};

       // SEARCH BY EMPLOYEE NAME
    if (search) {
        query.name = { $regex: search, $options: "i" };
    }

    // filter logic
      if (filter && filter !== "all") {
        query.$or = [
            { "checkIn.status": filter },
            { "checkOut.status": filter }
        ];
    }

       const total = await EmployeeDayModel.countDocuments(query);

    const employees = await EmployeeDayModel
        .find(query)
        .sort({ createdAt: -1 });

    return {
        employees,
        total,
    };
}

}

