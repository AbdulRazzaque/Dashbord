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

    // ✅ Qatar date (NOT UTC)
    const qatarNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Qatar" })
    );

    const todayString = qatarNow.toISOString().slice(0, 10);

    qatarNow.setHours(0, 0, 0, 0);
    const todayDate = new Date(qatarNow);

    // 1️⃣ Get employees
    const response = await employeeService.getEmployees();
    const employees: RawEmployee[] = response?.data ?? [];

    if (!employees.length) {
      return { inserted: 0 };
    }

    // 2️⃣ Valid employees only
    const validEmployees = employees.filter(
      (e): e is RawEmployee & { emp_code: number } =>
        typeof e.emp_code === "number"
    );

    if (!validEmployees.length) {
      return { inserted: 0 };
    }

    const empCodes = validEmployees.map(e => e.emp_code);

    // 3️⃣ PRESENT employees (REAL check-in only)
    const presentRecords = await EmployeeDayModel.find(
      {
        emp_code: { $in: empCodes },
        date: todayString,
        "checkIn.time": { $type: "string", $ne: "" }, // ✅ FIX
        isExcluded: { $ne: true },
      },
      { emp_code: 1 }
    ).lean();

    const presentSet = new Set<number>(
      presentRecords.map(r => r.emp_code)
    );

    // 4️⃣ ABSENT employees
    const absents = validEmployees
      .filter(e => !presentSet.has(e.emp_code))
      .map(e => ({
        emp_code: e.emp_code,
        first_name: e.first_name,
        date: todayDate,
        status: "Absent",
        reason: "No CheckIn",
      }));

  

    if (!absents.length) {
      return { inserted: 0 };
    }

    // 5️⃣ INSERT (DUPLICATE SAFE)
    let inserted = 0;

    try {
      const result = await AbsentModel.insertMany(absents, {
        ordered: false,
      });
      inserted = result.length;
    } catch (error: any) {
      if (error.code === 11000) {
        inserted = error.result?.nInserted ?? 0;
      } else {
        throw error;
      }
    }

    return { inserted };
  }


  async getAllAbsent(
    options?: AbsentSearchOptions
  ): Promise<{ data: AbsentType[]; total: number }> {
  
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 100;
    const skip = (page - 1) * limit;
  
    const getStartOfDay = (date: Date): Date => {
      const dateStr = date.toISOString().slice(0, 10);
      return new Date(`${dateStr}T00:00:00.000Z`);
    };
  
    const getEndOfDay = (date: Date): Date => {
      const dateStr = date.toISOString().slice(0, 10);
      return new Date(`${dateStr}T23:59:59.999Z`);
    };
  
    const query: {
      date?: {
        $gte?: Date;
        $lte?: Date;
      };
    } = {};
  
    // ===== DEFAULT: TODAY =====
    if (!options?.startDate && !options?.endDate) {
      const today = new Date();
      query.date = {
        $gte: getStartOfDay(today),
        $lte: getEndOfDay(today),
      };
    }
  
    // ===== SAME DAY =====
    else if (
      options.startDate &&
      options.endDate &&
      options.startDate.toISOString().slice(0, 10) ===
        options.endDate.toISOString().slice(0, 10)
    ) {
      query.date = {
        $gte: getStartOfDay(options.startDate),
        $lte: getEndOfDay(options.startDate),
      };
    }
  
    // ===== DATE RANGE =====
    else {
      query.date = {};
  
      if (options.startDate) {
        query.date.$gte = getStartOfDay(options.startDate);
      }
  
      if (options.endDate) {
        query.date.$lte = getEndOfDay(options.endDate);
      }
    }
  
    const [data, totalAgg] = await Promise.all([
      AbsentModel.aggregate([
        { $match: query },
  
        {
          $lookup: {
            from: "employees", // EmployeeModel collection name
            localField: "emp_code",
            foreignField: "emp_code",
            as: "employee",
          },
        },
  
        { $unwind: "$employee" },
  
        {
          $match: {
            "employee.isExcluded": { $ne: true },
          },
        },
  
        { $sort: { date: -1, emp_code: 1 } },
        { $skip: skip },
        { $limit: limit },
  
        {
          $project: {
            employee: 0,
          },
        },
      ]),
  
      AbsentModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "employees",
            localField: "emp_code",
            foreignField: "emp_code",
            as: "employee",
          },
        },
        { $unwind: "$employee" },
        {
          $match: {
            "employee.isExcluded": { $ne: true },
          },
        },
        { $count: "total" },
      ]),
    ]);
  
    const total = totalAgg[0]?.total ?? 0;
  
    return { data, total };
  }
  
  async SingleAbsentEmployee(empCode: any) {
    return await AbsentModel.find({
      emp_code: Number(empCode),
    }).sort({ date: -1 });
  }
  
}
