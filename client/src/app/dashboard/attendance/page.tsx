"use client";

import BreadCrumb from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input";
import { Button } from 'react-day-picker';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AttendanceTable from '@/components/attendance/attendance-table'
import { useQuery } from '@tanstack/react-query';

import { getTodayAttendance } from '@/lib/http/api';

interface TodayAttendanceResponse {
  ok: boolean;
  saved: number;
  page: number;
  limit: number;
  total: number;
  data: any[];
}

const AttendancePage = () => {
      const breadcrumbItems = [
    { title: "Attendance", link: "/dashboard/attendance" },
  ];
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(1);
      // Use a non-empty sentinel value ("ALL") instead of empty string for Radix Select
      const [stateFilter, setStateFilter] = useState("");
        const [search, setSearch] = useState("");
      const router = useRouter();
  
  const { data, isLoading } = useQuery<TodayAttendanceResponse>({
    queryKey: ["getTodayAttendance", page, rowsPerPage, search, stateFilter === "ALL" ? "" : stateFilter],
    queryFn: async () => {
      const effectiveStateFilter = (stateFilter === "ALL" || stateFilter === "") ? undefined : stateFilter;
      const res = await getTodayAttendance(page, rowsPerPage, search || undefined, effectiveStateFilter);
      return res.data;
    },
  });

  const punches = Array.isArray(data?.data) ? data!.data : [];
  const total = data?.total || 0;

  
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
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="State filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All States</SelectItem>
                <SelectItem value="Check In">Check In</SelectItem>
                <SelectItem value="Check Out">Check Out</SelectItem>
                <SelectItem value="Break">Break</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => setRowsPerPage(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <AttendanceTable
          data={punches}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          rowsPerPage={rowsPerPage}
          totalEmployee={total}
        />
      </Card>
    </>
  )
}
export default AttendancePage