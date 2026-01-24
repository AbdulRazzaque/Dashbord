import AbsentModel from "../models/AbsentModel";
import { EmployeeDayModel } from "../models/EmployeeDay";
import { EmployeeService } from "./EmployeeService";

interface RawEmployee {
  emp_code: number | null;
  first_name: string;
   isExcluded: boolean;
}

// Router change nahi karna tha – isliye yahan instance
const employeeService = new EmployeeService();

export class AbsentService {
  async markTodayAbsent(): Promise<{ inserted: number }> {
    const today = new Date().toISOString().slice(0, 10);

    // 1️⃣ Employees lao
    const response = await employeeService.getEmployees();
    const employees: RawEmployee[] = response?.data ?? [];

    if (!employees.length) return { inserted: 0 };

    // 2️⃣ Valid employees
    const validEmployees = employees.filter(
      (e): e is RawEmployee & { emp_code: number } =>
        typeof e.emp_code === "number"
    );

    if (!validEmployees.length) return { inserted: 0 };

    const empCodes = validEmployees.map(e => e.emp_code);

    // 3️⃣ Present employees nikalo
    const presentRecords = await EmployeeDayModel.find(
      {
        emp_code: { $in: empCodes },
        date: today,
        "checkIn.time": { $exists: true, $ne: null },
        isExcluded: { $ne: true },
      },
      { emp_code: 1 }
    ).lean();

    const presentSet = new Set<number>(
      presentRecords.map(r => r.emp_code)
    );

    // 4️⃣ Absent list banao
    const absents = validEmployees
      .filter(e => !presentSet.has(e.emp_code))
      .map(e => ({
        emp_code: e.emp_code,
        first_name: e.first_name,
        date: today,
        reason: "No CheckIn",
        isExcluded: e.isExcluded
      }));

    if (!absents.length) return { inserted: 0 };

    // 5️⃣ INSERT (DUPLICATE SAFE)
    let insertedCount = 0;

    try {
      const result = await AbsentModel.insertMany(absents, {
        ordered: false,
      });
      insertedCount = result.length;
    } catch (error) {
      const err = error as {
        code?: number;
        result?: { nInserted?: number };
      };

      if (err.code === 11000) {
        // duplicate ignore
        insertedCount = err.result?.nInserted ?? 0;
      } else {
        throw error;
      }
    }

    return { inserted: insertedCount };
  }
}
