"use client";

import BreadCrumb from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/lib/http/api";
import {  SummaryRow, } from "@/types";
import EmployeeTable from "@/components/employees/employee-tabel";

const AttendancePage = () => {
  const breadcrumbItems = [
    { title: "Employees", link: "/dashboard/employees" },
  ];
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<SummaryRow[]>({
    queryKey: [
      "getEmployees"],
    queryFn: async () => {
    
      const res = await getEmployees(

      );
  
      return res.data.data;
    },
  });
  
  const employees = data || [];


  // ⭐ frontend filtering + searching
 const filteredEmployees = useMemo<SummaryRow[]>(() => {
  const list = Array.isArray(employees) ? employees : [];
  let result = [...list];

  if (search.trim()) {
    const s = search.toLowerCase();
    result = result.filter(
      (emp) =>
        emp.name.toLowerCase().includes(s) ||
        String(emp.employeeId).toLowerCase().includes(s)
    );
  }

  return result;
}, [employees, search]);

 

  return (
    <>
      <div className="flex items-center justify-between py-5">
        <BreadCrumb items={breadcrumbItems} />
      </div>
      <Card>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search Employee Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          
          </div>
         
        </div>
        <EmployeeTable
          data={filteredEmployees || []}
          isLoading={isLoading }
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          totalEmployee={0}
        />
      </Card>
    </>
  );
};
export default AttendancePage;
