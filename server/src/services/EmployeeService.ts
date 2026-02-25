import { bioGet } from "../bioClient";
import { EmployeeDayModel } from "../models/EmployeeDay";

import EmployeeModel from "../models/EmployeeModel";
import PunchModel from "../models/PunchModel";
import { IEmployee, SearchParams } from "../types";

interface BioTimeEmployeeRaw {
  emp_code?: number | string;
  id?: number | string;
  employee_no?: number | string;
  first_name?: string;
  emp_name?: string;
  name?: string;
  [key: string]: unknown;
}

export class EmployeeService{

async getEmployees() {
    let allEmployees: BioTimeEmployeeRaw[] = [];
    let nextUrl: string | null = "/personnel/api/employee/";

    // 1️⃣ BioTime /personnel/api/employee/ se saari employees lao (pagination handle)
    while (nextUrl) {
      const res = await bioGet<BioTimeEmployeeRaw>(nextUrl);
      const raw = res as { data?: BioTimeEmployeeRaw[]; results?: BioTimeEmployeeRaw[]; next?: string | null };
      const list = Array.isArray(raw.data) ? raw.data : Array.isArray(raw.results) ? raw.results : [];
      allEmployees = allEmployees.concat(list);
      nextUrl = raw.next && String(raw.next).trim() ? raw.next : null;
    }

    if (!allEmployees.length) {
      return { count: 0, data: [] };
    }

    // 2️⃣ emp_code: BioTime me emp_code ya id dono ho sakte hain; normalize + map
    const zktEmployees = allEmployees
      .map((emp: BioTimeEmployeeRaw) => {
        const code = emp.emp_code ?? emp.id ?? emp.employee_no;
        const num = code != null ? Number(code) : NaN;
        const name = emp.first_name ?? emp.emp_name ?? emp.name ?? "";
        if (Number.isNaN(num) || num < 0) return null;
        return { emp_code: num, first_name: String(name), raw: emp };
      })
      .filter(
        (e): e is { emp_code: number; first_name: string; raw: BioTimeEmployeeRaw } => e != null
      );

    const empCodes = zktEmployees.map(e => e.emp_code);

    // 3️⃣ Local DB se existing employees lao
    const localEmployees = await EmployeeModel.find(
      { emp_code: { $in: empCodes } },
      { emp_code: 1, isExcluded: 1, isDeleted: 1 }
    ).lean();

    const localMap = new Map<number, { emp_code: number; isExcluded?: boolean; isDeleted?: boolean }>(
      localEmployees.map(e => [e.emp_code, e])
    );

    // 4️⃣ Upsert: jo BioTime me hain unhe DB me create/update (isDeleted: false)
    await Promise.all(
      zktEmployees.map(emp =>
        EmployeeModel.updateOne(
          { emp_code: emp.emp_code },
          {
            $set: {
              first_name: emp.first_name,
              isDeleted: false,
              raw: emp.raw,
            },
          },
          { upsert: true }
        )
      )
    );

    // 4b️⃣ Jo BioTime me nahi hain unhe DB me isDeleted: true mark karo (soft delete)
    // await EmployeeModel.updateMany(
    //   { emp_code: { $nin: empCodes } },
    //   { $set: { isDeleted: true } }
    // );
    await EmployeeModel.updateMany(
      {
        isDeleted: false,
        emp_code: { $nin: empCodes }
      },
      {
        $set: { isDeleted: true }
      }
    );
    // 5️⃣ Final response (merge flags)
    const finalList: IEmployee[] = zktEmployees.map(emp => {
      const local = localMap.get(emp.emp_code);
      const rawId = emp.raw?.id;
      return {
        id: typeof rawId === "number" ? rawId : Number(rawId) || 0,
        emp_code: emp.emp_code,
        first_name: emp.first_name,
        isExcluded: local?.isExcluded ?? false,
        isDeleted: local?.isDeleted ?? false,
        raw: emp.raw,
      } as IEmployee;
    });

    return {
      count: finalList.length,
      data: finalList,
    };
  }




    async getSingleEmployee(empCode: any) {
  return await EmployeeDayModel.find({
    emp_code: Number(empCode),
  }).sort({ date: -1 });
}

async isExclude(empCode: number) {
  // Find by emp_code
  let employee = await EmployeeModel.findOne({ emp_code: empCode });

  // If employee doesn't exist in DB, create a new record
  if (!employee) {
    employee = new EmployeeModel({
      emp_code: empCode,
      isExcluded: true, // Set to true on first exclusion
    });
  } else {
    // Toggle if exists
    employee.isExcluded = !employee.isExcluded;
  }
  
  await employee.save();
  return employee;
}

 async searchEmployees({
  query = "",
  page = 1,
  limit = 10,
}: SearchParams) {

  const pipeline: any[] = [];

  // ---- FILTER (Search First Name) ----
  if (query) {
    pipeline.push({
      $match: {
        first_name: { $regex: query, $options: "i" },
      },
    });
  }

  // ---- Pagination ----
  const skip = (page - 1) * limit;
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  // ---- Correct Model ----
  const employees = await PunchModel.aggregate(pipeline);

  // ---- Count ----
  const totalCount = query
    ? await PunchModel.countDocuments({
        first_name: { $regex: query, $options: "i" },
      })
    : await PunchModel.estimatedDocumentCount();

  return {
    employees,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      itemsPerPage: limit,
    },
  };
}

async getEmployeeCount(): Promise<number> {
  return await EmployeeModel.countDocuments({ isDeleted: { $ne: true } });
}

}