import { bioGet } from "../bioClient";
import { EmployeeDayModel } from "../models/EmployeeDay";
import PunchModel from "../models/PunchModel";
import { IEmployee, SearchParams, BioTimeResponse } from "../types";

export class EmployeeService{

async getEmployees() {
  let allEmployees: IEmployee[] = [];
  let nextUrl: string | null = "/personnel/api/employee/";

  while (nextUrl) {
    const res: BioTimeResponse<IEmployee> = await bioGet(nextUrl);
    allEmployees = allEmployees.concat(res.data);
    nextUrl = res.next;
  }

  // Merge local DB exclude status
  const finalList = await Promise.all(
    allEmployees.map(async (emp) => {
      const emp_code = emp.emp_code ? Number(emp.emp_code) : null;

      const record = emp_code ? await EmployeeDayModel.findOne({ emp_code }) : null;

      return {
        ...emp,
        emp_code, // Add emp_code field for frontend
        isExcluded: record?.isExcluded ?? false, // better null-safe operator
      };
    })
  );

  return {
    count: finalList.length,
    data: finalList,
  };
}

async getSingleEmployee(employeeId: any) {

  const query = { emp_code: Number(employeeId) };

  return await EmployeeDayModel.find(query);
}
    

async isExclude(empCode: number) {
  // Find by emp_code
  let employee = await EmployeeDayModel.findOne({ emp_code: empCode });

  // If employee doesn't exist in DB, create a new record
  if (!employee) {
    employee = new EmployeeDayModel({
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


}