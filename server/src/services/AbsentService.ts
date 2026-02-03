import { getUtcDay } from "../../utils/dateUtils";
import AbsentModel  from "../models/AbsentModel";
import { EmployeeDayModel } from "../models/EmployeeDay";
import { AbsentSearchOptions, AbsentType } from "../types";
import { EmployeeService } from "./EmployeeService";

interface RawEmployee {
  emp_code: number | null;
  first_name: string;
}


const employeeService = new EmployeeService();

export class AbsentService {
  async markTodayAbsent(): Promise<{ inserted: number }> {

    // ✅ UTC DAY (00:00:00.000Z)
    const todayDate = getUtcDay();

    // 1️⃣ Get employees
    const response = await employeeService.getEmployees();
    const employees: RawEmployee[] = response?.data ?? [];
    if (!employees.length) return { inserted: 0 };

    // 2️⃣ Valid employees only
    const validEmployees = employees.filter(
      (e): e is RawEmployee & { emp_code: number } =>
        typeof e.emp_code === "number"
    );
    if (!validEmployees.length) return { inserted: 0 };

    const empCodes = validEmployees.map(e => e.emp_code);

    // 3️⃣ PRESENT employees — STATUS BASED ONLY
    const presentRecords = await EmployeeDayModel.find(
      {
        emp_code: { $in: empCodes },
        date: todayDate,
        status: "Present",
      },
      { emp_code: 1 }
    ).lean();

    const presentSet = new Set<number>(
      presentRecords.map(r => r.emp_code)
    );

    // 4️⃣ Build ABSENT records
    const absents = validEmployees
      .filter(e => !presentSet.has(e.emp_code))
      .map(e => ({
        emp_code: e.emp_code,
        first_name: e.first_name,
        date: todayDate,
        status: "Absent",
        reason: "No Present Status",
      }));

    if (!absents.length) return { inserted: 0 };

    // 5️⃣ UPSERT (DUPLICATE-SAFE, CRON-SAFE)
    const ops = absents.map(a => ({
      updateOne: {
        filter: { emp_code: a.emp_code, date: a.date },
        update: { $setOnInsert: a },
        upsert: true,
      },
    }));

    const result = await AbsentModel.bulkWrite(ops, { ordered: false });

    return { inserted: result.upsertedCount };
  }
  
  

  async getAllAbsent(
    options?: AbsentSearchOptions
  ): Promise<{ data: AbsentType[]; total: number }> {
  
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 100;
    const skip = (page - 1) * limit;
  
    const query: Record<string, unknown> = {};
  
    // Parse date string (e.g. "2026-2-1" or "2026-02-01") to UTC midnight so frontend date = backend date
    const parseDateToUtc = (dateInput: Date | string): Date => {
      const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      const y = d.getFullYear();
      const m = d.getMonth();
      const day = d.getDate();
      return new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
    };
  
    // ===== DEFAULT: TODAY (UTC MIDNIGHT) =====
    if (!options?.startDate && !options?.endDate) {
      query.date = getUtcDay();
    }
    // ===== DATE RANGE =====
    else {
      query.date = {};
      if (options.startDate) {
        (query.date as Record<string, Date>).$gte = parseDateToUtc(options.startDate);
      }
      if (options.endDate) {
        (query.date as Record<string, Date>).$lte = new Date(
          parseDateToUtc(options.endDate).getTime() + 24 * 60 * 60 * 1000 - 1
        );
      }
    }
  
    // Exclude absent records where employee had present day (check-in/check-out) on that date
    const excludePresentPipeline = [
      {
        $lookup: {
          from: "employeedays",
          let: { ec: "$emp_code", d: "$date" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$emp_code", "$$ec"] },
                    { $eq: ["$date", "$$d"] },
                    { $eq: ["$status", "Present"] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "presentDay",
        },
      },
      { $match: { presentDay: { $size: 0 } } },
      { $project: { presentDay: 0 } },
    ];
  
    // Keep absent records even when employee not in employees collection (preserveNullAndEmptyArrays)
    const [data, totalAgg] = await Promise.all([
      AbsentModel.aggregate([
        { $match: query },
        ...excludePresentPipeline,
        {
          $lookup: {
            from: "employees",
            localField: "emp_code",
            foreignField: "emp_code",
            as: "employee",
          },
        },
        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { employee: null },
              { employee: { $exists: false } },
              { "employee.isExcluded": { $ne: true } },
            ],
          },
        },
        { $sort: { date: -1, emp_code: 1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { employee: 0 } },
      ]),
  
      AbsentModel.aggregate([
        { $match: query },
        ...excludePresentPipeline,
        {
          $lookup: {
            from: "employees",
            localField: "emp_code",
            foreignField: "emp_code",
            as: "employee",
          },
        },
        { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
        {
          $match: {
            $or: [
              { employee: null },
              { employee: { $exists: false } },
              { "employee.isExcluded": { $ne: true } },
            ],
          },
        },
        { $count: "total" },
      ]),
    ]);
  
    const total = (totalAgg[0] as { total?: number } | undefined)?.total ?? 0;
    return {
      data,
      total,
    };
  }
  
  async SingleAbsentEmployee(empCode: any) {
    const absents = await AbsentModel.find({
      emp_code: Number(empCode),
    })
      .sort({ date: -1 })
      .lean();

    // Exclude dates where employee had check-in or check-out
    const presentDays = await EmployeeDayModel.find(
      {
        emp_code: Number(empCode),
        $or: [
          { "checkIn.time": { $exists: true, $ne: "" } },
          { "checkOut.time": { $exists: true, $ne: "" } },
        ],
      },
      { date: 1 }
    ).lean();

    const presentDateSet = new Set(
      presentDays.map((d) => (typeof d.date === "string" ? d.date : new Date(d.date).toISOString().slice(0, 10)))
    );

    return absents.filter((a) => {
      const dateStr = a.date instanceof Date ? a.date.toISOString().slice(0, 10) : String(a.date).slice(0, 10);
      return !presentDateSet.has(dateStr);
    });
  }
  
}
