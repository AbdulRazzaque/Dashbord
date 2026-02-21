"use client";
import { AbsentEmployee, SummaryRow } from "@/types";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
interface Props {
  data: AbsentEmployee[];
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
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";



export default function SingleAbsentEmployeeTable({
  data = [],
  isLoading,
  page = 1,
  setPage,
  rowsPerPage = 50,
  totalEmployee = 0,
}: Props) {


  return (
    <div className="w-full">
      <div className="overflow-x-auto">
      <Table>
          <TableHeader>
            <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Sr No</TableHead>
              <TableHead className="font-semibold">Employee</TableHead>
              <TableHead className="font-semibold">Employee ID</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Reason</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No absent records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((employee, index) => (
                <TableRow
                  key={`${employee.emp_code}-${employee.date}-${index}`}
                  className="hover:bg-muted/30"
                >
                  <TableCell className="font-medium text-card-foreground/80">
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    <div className="flex gap-3 items-center">
                      <Avatar className="rounded-full h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {(employee.first_name || "NA")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-card-foreground">
                        {employee.first_name || "NA"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.emp_code}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    {formatDate(employee.date) || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.reason || "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full border bg-red-100 text-red-800 border-red-200">
                      {employee.status || "Absent"}
                    </span>
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
