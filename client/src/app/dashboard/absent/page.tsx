"use client";

import BreadCrumb from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AttendanceSummaryTable from "@/components/attendance/attendance-summary-table";
import { useQuery } from "@tanstack/react-query";
import { getTodayAttendanceSummary } from "@/lib/http/api";
import {  SummaryRow, } from "@/types";

const AbsentPage = () => {
  const breadcrumbItems = [
    { title: "Attendance", link: "/dashboard/attendance" },
  ];


  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const { data, isLoading } = useQuery<SummaryRow[]>({
    queryKey: [
      "getTodayAttendanceSummary"],
    queryFn: async () => {
    
      const res = await getTodayAttendanceSummary(

      );
      return res.data.data;
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
    emp.first_name.toLowerCase().includes(s) ||
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
        <AttendanceSummaryTable
          data={filteredEmployees || []}
          isLoading={isLoading }
          page={page}
          setPage={setPage}
          totalEmployee={0}
        />
      </Card>
    </>
  );
};
export default AbsentPage;
