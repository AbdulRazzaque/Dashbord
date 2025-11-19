import PunchModel from "../models/PunchModel";
import { SearchParams } from "../types";

export class EmployeeService{



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