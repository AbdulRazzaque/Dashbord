"use client";

import DatePickerWithRange from "@/components/date-picker-with-range";
import EcommerceStats from "@/components/ecommerce-stats";

import RevinueChart from "@/components/revinue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";
// import { Counts } from "@/types";
import AttendanceSummaryTable from "@/components/attendance/attendance-summary-table";
import { data } from "@/components/top-customers/data";
import { TodayAttendanceResponse } from "@/types";
import { getTodayAttendanceSummary } from "@/lib/http/api";

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

  const { data, isLoading } = useQuery<TodayAttendanceResponse>({
    queryKey: [
      "getTodayAttendanceSummary",
      page,
      rowsPerPage,
      search,
      stateFilter === "ALL" ? "" : stateFilter,
    ],
    queryFn: async () => {
      const effectiveStateFilter =
        stateFilter === "ALL" || stateFilter === "" ? undefined : stateFilter;
      const res = await getTodayAttendanceSummary(
        page,
        rowsPerPage,
        search || undefined,
        effectiveStateFilter
      );
      return res.data;
    },
  });

  const rows = Array.isArray(data?.data) ? data!.data : [];
  const total = data?.total || 0;

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
            <EcommerceStats data={1} />
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
        <AttendanceSummaryTable
          data={rows|| []}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          totalEmployee={total}
        />

        </div>
      </div>
    </div>
  );
};

export default Page;
