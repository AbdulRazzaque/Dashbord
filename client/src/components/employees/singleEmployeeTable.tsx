"use client";
import { SummaryRow } from "@/types";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface Props {
  data: SummaryRow[];
  isLoading?: boolean;
  page?: number;
  setPage?: (page: number) => void;
  rowsPerPage?: number;
  totalEmployee?: number;
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formatHours = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Present":
      return "bg-green-100 text-green-800 border border-green-200";
    case "Out":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "Late":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "Early Out":
      return "bg-orange-100 text-orange-800 border border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

export default function getSingleEmployeeTable({
  data = [],
  isLoading,
  page = 1,
  setPage,
  rowsPerPage = 10,
  totalEmployee = 0,
}: Props) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Check In / Out</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((employee) => (
                <TableRow key={`${employee.emp_code}-${employee.date}`}>
                  <TableCell className="font-medium text-card-foreground/80">
                  <div className="flex gap-3 items-center">
                    <Avatar className="rounded-full">
                      <AvatarFallback>  {(employee.first_name || "NA")
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()}
            </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-card-foreground">
                      {employee.first_name}
                    </span>
                  </div>
                </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.date}
                  </TableCell>

                  <TableCell>{employee.first_name}</TableCell>

                  <TableCell>{employee.emp_code}</TableCell>

                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">●</span>
                        In: {employee.checkIn?.time || "-"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">●</span>
                        Out: {employee.checkOut?.time || "-"}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{formatHours(employee.totalHours)}</TableCell>

                  <TableCell className="flex flex-col  w-max">
                    <div
                      className={`inline-flex px-2 py-1 mb-1 text-xs font-semibold rounded-full 
                ${getStatusColor(employee?.checkIn?.status || "No Status")}`}
                    >
                      {employee?.checkIn?.status ||""}
                    </div>

                    <div
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                ${getStatusColor(employee?.checkOut?.status || "No Status")}`}
                    >
                      {employee?.checkOut?.status ||""}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between p-4">
        <span>
          Showing {data.length === 0 ? 0 : (page - 1) * rowsPerPage + 1}-
          {(page - 1) * rowsPerPage + data.length} of {totalEmployee}
        </span>
        <div className="flex gap-2">
     
        </div>
      </div>
    </div>
  );
}
