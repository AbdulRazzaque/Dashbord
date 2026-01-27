import { bioGet } from "../bioClient";
import { EmployeeDayModel } from "../models/EmployeeDay";

import EmployeeModel from "../models/EmployeeModel";
import PunchModel from "../models/PunchModel";
import { IEmployee, SearchParams, BioTimeResponse } from "../types";

export class EmployeeService{

async getEmployees() {
    let allEmployees: IEmployee[] = [];
    let nextUrl: string | null = "/personnel/api/employee/";

    // 1️⃣ ZKTeco se employees lao
    while (nextUrl) {
      const res: BioTimeResponse<IEmployee> = await bioGet(nextUrl);
      allEmployees = allEmployees.concat(res.data);
      nextUrl = res.next;
    }

    if (!allEmployees.length) {
      return { count: 0, data: [] };
    }

    // 2️⃣ emp_code normalize + map
    const zktEmployees = allEmployees
      .map(emp => ({
        emp_code: emp.emp_code ? Number(emp.emp_code) : null,
        first_name: emp.first_name,
        raw: emp,
      }))
      .filter(
        (e): e is { emp_code: number; first_name: string; raw: any } =>
          typeof e.emp_code === "number"
      );

    const empCodes = zktEmployees.map(e => e.emp_code);

    // 3️⃣ Local DB se existing employees lao (ONE QUERY)
    const localEmployees = await EmployeeModel.find(
      { emp_code: { $in: empCodes } },
      { emp_code: 1, isExcluded: 1, isDeleted: 1 }
    ).lean();

    const localMap = new Map(
      localEmployees.map(e => [e.emp_code, e])
    );

    // 4️⃣ Upsert employees (MIN fields + RAW)
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

    // 5️⃣ Final response (merge flags)
    const finalList:IEmployee[] = zktEmployees.map(emp => {
      const local = localMap.get(emp.emp_code);

       return {
      id: emp.raw?.id ?? 0,
    emp_code: emp.emp_code,
    first_name: emp.first_name,
    isExcluded: local?.isExcluded ?? false, // ✅ ADD THIS
    isDeleted: local?.isDeleted ?? false,
    raw: emp.raw, // ✅ SAFE: no spread, no any issue
    };
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
  return await EmployeeModel.countDocuments();
}

}