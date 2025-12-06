"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import BreadCrumb from "@/components/ui/breadcrumb";
import { getSingleEmployee } from "@/lib/http/api";
import SingleEmployeeTable from "@/components/employees/singleEmployeeTable";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export default function Page() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const params = useSearchParams();
  const id = params.get("id");

  const { data, isLoading } = useQuery({
    queryKey: ["getSingleEmployee", id],
    queryFn: async () => {
      return await getSingleEmployee(id!).then((res) => res.data);
    },
  });

const employees = data || [];

  // ⭐ frontend filtering + searching
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // search filter
    if (search.trim()) {
  const s = search.toLowerCase();

  result = result.filter((emp) =>
    emp.name.toLowerCase().includes(s) ||
    String(emp.employeeId).toLowerCase().includes(s)
  );
}


    // status filter
   if (filter !== "all") {
  result = result.filter(emp => {
    const inStatus = emp?.checkIn?.status;
    const outStatus = emp?.checkOut?.status;

    return inStatus === filter || outStatus === filter;
  });
}


    return result;
  }, [employees, search, filter]);

  const breadcrumbItems = [
    { title: "Employees", link: "/dashboard/employees" },
    { title: "Employee Details", link: "#" },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <BreadCrumb items={breadcrumbItems} />

      <div className="space-y-6">
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
             
              <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="State filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
                <SelectItem value="Checkout">Checkout</SelectItem>
                <SelectItem value="Early Out">Early Out</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>

          <SingleEmployeeTable
            data={filteredEmployees}
            isLoading={isLoading}
            page={page}
            setPage={setPage}
            totalEmployee={filteredEmployees.length}
          />
        </Card>
      </div>
    </div>
  );
}
