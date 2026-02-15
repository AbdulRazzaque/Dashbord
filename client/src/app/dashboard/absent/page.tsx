"use client";

import BreadCrumb from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";


import { useQuery } from "@tanstack/react-query";
import { getAbsentEmployee } from "@/lib/http/api";
import { AbsentEmployee } from "@/types";
import AbsentTable from "@/components/absent/absent-tabel";
import DatePickerWithRange from "@/components/date-picker-with-range";

const AbsentPage = () => {
  const breadcrumbItems = [
    { title: "Absent", link: "/dashboard/absent" },
  ];


  // Get today's date in Qatar time
  const getTodayDate = () => {
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Qatar" })
    );
    now.setHours(0, 0, 0, 0);
    return now;
  };

  // Get yesterday's date in Qatar time
  const getYesterdayDate = () => {
    const yesterday = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Qatar" })
    );
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
  };

  // Convert Date to YYYY-M-D string (no leading zeros)
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is zero-based
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  };


  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  // By default, show from yesterday to today
  const [startDate, setStartDate] = useState<Date>(getYesterdayDate());
  const [endDate, setEndDate] = useState<Date>(getTodayDate());
  const router = useRouter();

  const { data, isLoading, error } = useQuery<{
    data: AbsentEmployee[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>({
    queryKey: ["getAbsentEmployee", page, limit, formatDateToString(startDate), formatDateToString(endDate)],
    queryFn: async () => {
      const startDateStr = formatDateToString(startDate);
      const endDateStr = formatDateToString(endDate);
      const res = await getAbsentEmployee(page, limit, startDateStr, endDateStr);
      return res.data;
      
    },
  });

  
  const employees = data?.data || [];
  console.log("employees", data?.pagination.total)    
  const pagination = data?.pagination;

  // ⭐ frontend filtering + searching
  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    // search filter
    if (search.trim()) {
  const s = search.toLowerCase();

  result = result.filter((emp) =>
    emp.first_name.toLowerCase().includes(s) ||
    String(emp.emp_code).toLowerCase().includes(s)
  );
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
            <div className="flex flex-col gap-1">
          
              <DatePickerWithRange
                startDate={startDate}
                setStartDate={(date) => {
                  setStartDate(date);
                  setPage(1); // Reset to first page when date changes
                }}
                endDate={endDate}
                setEndDate={(date) => {
                  setEndDate(date);
                  setPage(1); // Reset to first page when date changes
                }}
                maxDate={getTodayDate()}
              />
            </div>
            <Input
              placeholder="Search Employee Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
         
        </div>
        {error && (
          <div className="p-4 text-red-500">
            Error loading absent employees. Please try again.
          </div>
        )}
        <AbsentTable
          data={filteredEmployees || []}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          totalEmployee={pagination?.total || 0}
          rowsPerPage={limit}
        />
      </Card>
    </>
  );
};
export default AbsentPage;
