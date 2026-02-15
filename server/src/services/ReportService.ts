import PunchModel, { IPunch } from "../models/PunchModel";
import { EmployeeDayModel } from "../models/EmployeeDay";
import AbsentModel from "../models/AbsentModel";
import {
  ReportEmployee,
  ReportDailyRecord,
  ReportDailyStatus,
  ReportMonthlyMatrixOptions,

} from "../types";
import { EmployeeService } from "./EmployeeService";


const FULL_DAY_HOURS = 8;

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] ?? "").toUpperCase() + (parts[parts.length - 1][0] ?? "").toUpperCase();
  }
  return (name[0] ?? "?").toUpperCase();
}

/** Normalize DB date (Date or string) to YYYY-MM-DD for consistent matching. */
function toDateStr(d: Date | string): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  const s = String(d);
  const i = s.indexOf("T");
  return i >= 0 ? s.slice(0, i) : s.slice(0, 10);
}

export class ReportService {
  private employeeService = new EmployeeService();

  /**
   * Get employees in the format expected by the frontend Reports section.
   * id = emp_code (string), employeeNumber = emp_code for display.
   */
  async getReportEmployees(options?: {
    search?: string;
  }): Promise<{ data: ReportEmployee[]; count: number }> {
    const response = await this.employeeService.getEmployees();
    const list = (response?.data ?? []) as Array<{
      emp_code: number;
      first_name: string;
      isExcluded?: boolean;
      isDeleted?: boolean;
      raw?: Record<string, unknown>;
    }>;

    const valid = list.filter(
      (e) =>
        typeof e.emp_code === "number" &&
        !e.isDeleted &&
        !e.isExcluded
    );
    if (!valid.length) {
      return { data: [], count: 0 };
    }

    let employees: ReportEmployee[] = valid.map((e) => {
      const name = e.first_name || (e.raw?.first_name as string) || "Unknown";
      const empId = String(e.emp_code);
      return {
        id: empId,
        name,
        employeeId: empId,
        emp_code: e.emp_code,
        avatar: initials(name),
      };
    });

    if (options?.search?.trim()) {
      const q = options.search.trim().toLowerCase();
      employees = employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          String(e.emp_code).toLowerCase().includes(q)
      );
    }

    return { data: employees, count: employees.length };
  }

  /**
   * Build monthly attendance matrix from Punches + Absents.
   * Returns employees and daily records in the exact format expected by the frontend.
   */
  async getMonthlyMatrix(
    opts: ReportMonthlyMatrixOptions
  ): Promise<{
    employees: ReportEmployee[];
    dailyRecords: ReportDailyRecord[];
    totalEmployees: number;
    totalRecords: number;
  }> {
    const { year, month, employeeId, filters, page = 1, limit } = opts;
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    const [employeesRes, punches, absents, employeeDays] = await Promise.all([
      this.getReportEmployees({
        search: filters?.search,
      }),
      PunchModel.find({
        punch_time: { $gte: start, $lte: end },
      })
        .sort({ punch_time: 1 })
        .lean<IPunch[]>(),
      AbsentModel.find({
        date: { $gte: start, $lte: end },
      }).lean(),
      EmployeeDayModel.find({
        date: { $gte: start, $lte: end },
        status: "Present",
      })
        .select("emp_code date")
        .lean(),
    ]);

    let employees = employeesRes.data;
    if (employeeId && employeeId !== "all") {
      employees = employees.filter((e) => e.id === employeeId);
    }

    const absentSet = new Set<string>();
    for (const a of absents) {
      const dateStr = toDateStr(a.date as Date | string);
      absentSet.add(`${a.emp_code}-${dateStr}`);
    }

    const presentSet = new Set<string>();
    for (const ed of employeeDays) {
      const row = ed as { emp_code: number; date: Date | string };
      presentSet.add(`${row.emp_code}-${toDateStr(row.date)}`);
    }

    const CHECKOUT_DECISION_HOUR = 10;

    const empPunches: Record<string, Record<string, IPunch[]>> = {};
    for (const p of punches) {
      if (!p.punch_time || !p.emp_code) continue;
      const ec = String(p.emp_code);
      const dateKey = new Date(p.punch_time).toISOString().split("T")[0];
      if (!empPunches[ec]) empPunches[ec] = {};
      if (!empPunches[ec][dateKey]) empPunches[ec][dateKey] = [];
      empPunches[ec][dateKey].push(p);
    }

    const dailyRecords: ReportDailyRecord[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const now = new Date();
    const todayYear = now.getUTCFullYear();
    const todayMonth = now.getUTCMonth();
    const todayDate = now.getUTCDate();
    const isFutureMonth = year > todayYear || (year === todayYear && month > todayMonth);
    const isCurrentMonth = year === todayYear && month === todayMonth;
    const lastDayToShow = isFutureMonth ? 0 : isCurrentMonth ? todayDate : daysInMonth;

    for (let day = 1; day <= daysInMonth; day++) {
      const isFutureDay = day > lastDayToShow;
      const date = new Date(Date.UTC(year, month, day));
      const dateStr = date.toISOString().slice(0, 10);

      for (const emp of employees) {
        if (isFutureDay) continue;

        const ec = String(emp.emp_code);
        const absentKey = `${ec}-${dateStr}`;
        const isAbsent = absentSet.has(absentKey);

        let status: ReportDailyStatus;
        let checkIn = "";
        let checkOut = "";
        let hoursWorked = 0;
        let overtime = 0;

        if (presentSet.has(`${ec}-${dateStr}`)) {
          status = "present";
          const dayPunches = empPunches[ec]?.[dateStr];
          if (dayPunches?.length) {
            const firstPunch = new Date(dayPunches[0].punch_time!);
            const lastPunch = new Date(dayPunches[dayPunches.length - 1].punch_time!);
            if (firstPunch.getUTCHours() < CHECKOUT_DECISION_HOUR) checkIn = formatTime(firstPunch);
            const hasCheckout =
              (dayPunches.length > 1 && lastPunch.getTime() > firstPunch.getTime()) ||
              (dayPunches.length === 1 && firstPunch.getUTCHours() >= CHECKOUT_DECISION_HOUR);
            if (hasCheckout) checkOut = formatTime(lastPunch);
            if (checkIn && checkOut) {
              const diffMs = lastPunch.getTime() - firstPunch.getTime();
              hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
              if (hoursWorked > FULL_DAY_HOURS) overtime = Math.round((hoursWorked - FULL_DAY_HOURS) * 10) / 10;
            }
          }
        } else if (isAbsent) {
          status = "absent";
        } else {
          const dayPunches = empPunches[ec]?.[dateStr];
          if (!dayPunches || dayPunches.length === 0) {
            status = "absent";
          } else {
            const firstPunch = new Date(dayPunches[0].punch_time!);
            const lastPunch = new Date(dayPunches[dayPunches.length - 1].punch_time!);

            if (firstPunch.getUTCHours() < CHECKOUT_DECISION_HOUR) {
              checkIn = formatTime(firstPunch);
            }
            const hasCheckout =
              (dayPunches.length > 1 && lastPunch.getTime() > firstPunch.getTime()) ||
              (dayPunches.length === 1 && firstPunch.getUTCHours() >= CHECKOUT_DECISION_HOUR);
            if (hasCheckout) {
              checkOut = formatTime(lastPunch);
            }

            if (checkIn && checkOut) {
              const diffMs = lastPunch.getTime() - firstPunch.getTime();
              hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
              if (hoursWorked > FULL_DAY_HOURS) {
                overtime = Math.round((hoursWorked - FULL_DAY_HOURS) * 10) / 10;
              }
            }

            status = "present";
          }
        }

        dailyRecords.push({
          date: dateStr,
          employeeId: ec,
          checkIn,
          checkOut,
          hoursWorked,
          status,
          overtime,
          tasks: 0,
          performance: 0,
        });
      }
    }

    if (filters?.status && filters.status !== "all") {
      const empIdsWithStatus = new Set(
        dailyRecords.filter((r) => r.status === filters.status).map((r) => r.employeeId)
      );
      employees = employees.filter((e) => empIdsWithStatus.has(String(e.emp_code)));
    }

    let paginatedEmployees = employees;
    let recordsForPage = dailyRecords;
    if (limit != null && limit > 0) {
      const skip = (page - 1) * limit;
      paginatedEmployees = employees.slice(skip, skip + limit);
      const paginatedIds = new Set(paginatedEmployees.map((e) => String(e.emp_code)));
      recordsForPage = dailyRecords.filter((r) => paginatedIds.has(r.employeeId));
    }

    return {
      employees: paginatedEmployees,
      dailyRecords: recordsForPage,
      totalEmployees: employees.length,
      totalRecords: dailyRecords.length,
    };
  }

  /**
   * Last 12 months aggregated counts for chart: Present, Absent, Late, Early Out.
   */
  async getAttendanceChartData(): Promise<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }> {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const categories: string[] = [];
    const presentData: number[] = [];
    const absentData: number[] = [];
    const lateData: number[] = [];
    const earlyOutData: number[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      categories.push(monthNames[month]);

      const [present, absent, late, earlyOut] = await Promise.all([
        EmployeeDayModel.countDocuments({ date: { $gte: start, $lte: end }, status: "Present" }),
        AbsentModel.countDocuments({ date: { $gte: start, $lte: end } }),
        EmployeeDayModel.countDocuments({ date: { $gte: start, $lte: end }, "checkIn.status": "Late" }),
        EmployeeDayModel.countDocuments({ date: { $gte: start, $lte: end }, "checkOut.status": "Early Out" }),
      ]);

      presentData.push(present);
      absentData.push(absent);
      lateData.push(late);
      earlyOutData.push(earlyOut);
    }

    return {
      categories,
      series: [
        { name: "Present Employee", data: presentData },
        { name: "Absent Employee", data: absentData },
        { name: "Late Employee", data: lateData },
        { name: "Early Out Employee", data: earlyOutData },
      ],
    };
  }
}
