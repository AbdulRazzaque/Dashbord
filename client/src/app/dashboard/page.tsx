"use client";

import DatePickerWithRange from "@/components/date-picker-with-range";
import EcommerceStats from "@/components/ecommerce-stats";

import RevinueChart from "@/components/revinue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

import { useEffect, useMemo, useState } from "react";
// import { Counts } from "@/types";
import AttendanceSummaryTable from "@/components/attendance/attendance-summary-table";
import { getTodayAttendanceSummary } from "@/lib/http/api";
import { SummaryRow } from "@/types";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const Page = () => {


  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setUTCHours(0, 0, 0, 0); // Set to 12:00:00 AM UTC
  const endOfDay = new Date(currentDate);

  const [startDate, setStartDate] = useState(startOfDay);
  const [endDate, setEndDate] = useState(endOfDay);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  // Use a non-empty sentinel value ("ALL") instead of empty string for Radix Select
  const [stateFilter, setStateFilter] = useState("");
  const [search, setSearch] = useState("");
 const [filter, setFilter] = useState("all");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="text-2xl font-medium text-default-800">Dashboard</div>
        {/* Pass startDate, endDate, and setEndDate */}
        <DatePickerWithRange
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <EcommerceStats data={{ totalSales: 0, todaysOrders: 0, completedOrders: 0, pendingOrders: 0 }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <Card>
            <CardHeader className="border-none pb-0 mb-0">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Average Revenue
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <RevinueChart />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
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
        <CardContent className="p-4">
      <AttendanceSummaryTable
          data={filteredEmployees|| []}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          totalEmployee={0}
        />
        </CardContent>
      </Card>

        </div>
      </div>
    </div>
  );
};

export default Page;
