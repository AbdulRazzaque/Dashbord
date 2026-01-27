"use client";
import { AbsentEmployee } from "@/types";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { formatDate } from "@/lib/utils";
interface Props {
  data: AbsentEmployee[];
  isLoading?: boolean;
  page?: number;
  setPage: (page: number) => void;
  rowsPerPage?: number;
  totalEmployee?: number;
}


export default function AbsentTable({
  data,
  isLoading,
  page = 1,
  setPage,
  rowsPerPage = 50,
  totalEmployee = 0,
}: Props) {
  const totalPages = Math.ceil(totalEmployee / rowsPerPage);
    const router = useRouter();


  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr No</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>

              <TableHead>Actions</TableHead>
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
                  No absent records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((employee, index) => (
                <TableRow key={`${employee.emp_code}-${employee.date}-${index}`}>
                  <TableCell className="font-medium text-card-foreground/80">
                    {(page - 1) * rowsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    <div className="flex gap-3 items-center">
                      <Avatar className="rounded-full">
                        <AvatarFallback>
                          {(employee.first_name || "NA")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-card-foreground">
                        {employee.first_name  || "NA"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.emp_code}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    {/* {new Date(employee.date).toDateString() || "N/A"} */}
                    {formatDate(employee.date) || "N/A"}

                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.reason || "N/A"}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.status || "N/A"}
                  </TableCell>
                  <TableCell className="flex">
                  <div className="flex gap-3">
                 
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      color="secondary"
                      onClick={() => {
                        const id = employee.emp_code;
                        router.push(`/dashboard/absent/view?id=${id}`);
                      }}
                    >
                      <Icon icon="heroicons:eye" className="h-4 w-4" />
                    </Button>
                   
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1 || isLoading}
          >
            Previous
          </Button>
          <span className="flex items-center px-3 text-sm">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= (totalPages || 1) || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
