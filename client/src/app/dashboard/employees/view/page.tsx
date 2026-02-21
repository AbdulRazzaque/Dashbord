"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import BreadCrumb from "@/components/ui/breadcrumb";
import { EmployeeSelector } from "@/components/report/employee-selector";
import { AttendanceMatrix } from "@/components/report/attendance-matrix";
import { EmployeeDayDetailsTable } from "@/components/report/employee-day-details-table";
import SingleAbsentEmployeeTable from "@/components/absent/singleAbsnetEmployeeTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReportMonthlyMatrix, singleAbsentEmployee, type ReportDailyRecord, type ReportEmployee } from "@/lib/http/api";
import type { AbsentEmployee } from "@/types";

export default function Page() {
  const params = useSearchParams();
  const id = params.get("id");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dailyRecords, setDailyRecords] = useState<ReportDailyRecord[]>([]);
  const [employees, setEmployees] = useState<ReportEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [absentData, setAbsentData] = useState<AbsentEmployee[]>([]);
  const [absentLoading, setAbsentLoading] = useState(true);

  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getReportMonthlyMatrix({
      year,
      month,
      employeeId: id,
      status: statusFilter !== "all" ? statusFilter : undefined,
    })
      .then((res) => {
        if (res.data?.ok) {
          setEmployees(res.data.employees ?? []);
          setDailyRecords(res.data.dailyRecords ?? []);
        } else {
          setEmployees([]);
          setDailyRecords([]);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message ?? "Failed to load attendance");
        setEmployees([]);
        setDailyRecords([]);
      })
      .finally(() => setLoading(false));
  }, [id, year, month, statusFilter]);

  useEffect(() => {
    if (!id) return;
    setAbsentLoading(true);
    singleAbsentEmployee(id)
      .then((res) => setAbsentData(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAbsentData([]))
      .finally(() => setAbsentLoading(false));
  }, [id]);

  const breadcrumbItems = [
    { title: "Employees", link: "/dashboard/employees" },
    { title: "Employee attendance", link: "#" },
  ];

  if (!id) {
    return (
      <div className="container mx-auto py-6 px-4">
        <BreadCrumb items={breadcrumbItems} />
        <p className="text-muted-foreground mt-4">
          No employee selected.{" "}
          <Link href="/dashboard/employees" className="text-primary underline">
            Back to Employees
          </Link>
        </p>
      </div>
    );
  }

  const initialData = useMemo(
    () => ({ employees, dailyRecords }),
    [employees, dailyRecords]
  );

  return (
    <div className="mx-auto py-6 px-4">
      <BreadCrumb items={breadcrumbItems} />

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-1" asChild>
            <Link href="/dashboard/employees">
              <ArrowLeft className="h-4 w-4" />
              Back to Employees
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Employee attendance
          </h1>
          <p className="text-muted-foreground">
            Attendance and absent records for employee ID {id}. Change month to view other months.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <EmployeeSelector
            employees={[]}
            employeesLoading={false}
            selectedEmployee={id}
            onEmployeeChange={() => {}}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            showEmployeeFilter={false}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-destructive mb-4">{error}</p>
      )}

      <div className="space-y-6">
        <div>
          <AttendanceMatrix
            selectedMonth={selectedMonth}
            selectedEmployeeId={id}
            initialData={initialData}
            hideStatusFilter
          />
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold">Attendance</h2>
            <p className="text-sm text-muted-foreground">Day-wise check in / out and hours for the selected month.</p>
          </div>
          <EmployeeDayDetailsTable
            dailyRecords={dailyRecords}
            loading={loading}
            embedded
          />
          <div className="flex items-center justify-between p-4 border-t text-sm text-muted-foreground">
            <span>
              Showing {loading ? 0 : dailyRecords.length} attendance record{dailyRecords.length !== 1 ? "s" : ""} for this month.
            </span>
          </div>
        </Card>

        
      </div>
    </div>
  );
}
