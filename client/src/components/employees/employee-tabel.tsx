"use client";
import { SummaryRow } from "@/types";
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { Icon } from "@iconify/react";
import { isExclude } from "@/lib/http/api";
interface Props {
  data: SummaryRow[];
  isLoading?: boolean;
  page?: number;
  setPage: (page: number) => void;
  rowsPerPage?: number;
  totalEmployee?: number;
}


export default function EmployeeTable({
  data,
  isLoading,
  page = 1,
  setPage,
  rowsPerPage = 50,
  totalEmployee = 0,
}: Props) {
  const totalPages = Math.ceil(totalEmployee / rowsPerPage);
    const router = useRouter();

      const queryClient = useQueryClient();
  const { mutate: mutateApprove, isPending: pending } = useMutation({
    mutationKey: ["isExclude"],
    mutationFn: async (id: number) => {
      return await isExclude(id);
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      // Invalidate the employees query to refetch the data
      return queryClient.invalidateQueries({ queryKey: ["getEmployees"] });
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.errors[0].msg);
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Employee ID</TableHead>
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
                <TableRow key={`${employee.id}`}>
                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.id}
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground/80">
                    <div className="flex gap-3 items-center">
                      <Avatar className="rounded-full">
                        <AvatarFallback>
                       
                          {/* {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()} */}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-card-foreground">
                        {employee.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium text-card-foreground/80">
                    {employee.employeeId }
                  </TableCell>
                   <TableCell>
                   <Button
                      onClick={() => {
                        const id = employee.employeeId;
                        if (id) {
                          mutateApprove(id);
                        } else {
                          toast.error("Invalid employee ID");
                        }
                      }}
                      variant="soft"
                      color={employee.isExcluded ? "destructive" : "success"}
                      size="sm"
                      disabled={pending}
                    >
                      {employee.isExcluded ? "Excluded" : "UnExcluded"}
                    </Button>
                  </TableCell>
                  <TableCell className="flex">
                  <div className="flex gap-3">
                 
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      color="secondary"
                      onClick={() => {
                        const id = employee.employeeId;
                        router.push(`/dashboard/employees/view?id=${id}`);
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
          Showing {(page - 1) * rowsPerPage + 1}-
          {(page - 1) * rowsPerPage + data.length} of {totalEmployee}
        </span>
      </div>
    </div>
  );
}
