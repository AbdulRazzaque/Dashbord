"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { EmployeeSelector } from "@/components/report/employee-selector"
import { AttendanceMatrix } from "@/components/report/attendance-matrix"
import { getReportEmployees, type ReportEmployee } from "@/lib/http/api"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function EmployeeDashboard() {
  const searchParams = useSearchParams()
  const employeeIdFromUrl = searchParams.get("employeeId")
  const monthFromUrl = searchParams.get("month")
  const yearFromUrl = searchParams.get("year")

  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<"matrix" | "detail">("matrix")
  const [reportEmployees, setReportEmployees] = useState<ReportEmployee[]>([])
  const [employeesLoading, setEmployeesLoading] = useState(true)

  useEffect(() => {
    if (employeeIdFromUrl) setSelectedEmployee(employeeIdFromUrl)
    if (yearFromUrl && monthFromUrl) {
      const y = parseInt(yearFromUrl, 10)
      const m = parseInt(monthFromUrl, 10)
      if (!Number.isNaN(y) && !Number.isNaN(m) && m >= 0 && m <= 11) {
        setSelectedMonth(new Date(y, m, 1))
      }
    }
  }, [employeeIdFromUrl, yearFromUrl, monthFromUrl])

  useEffect(() => {
    getReportEmployees()
      .then((res) => {
        if (res.data?.ok && Array.isArray(res.data.data)) {
          setReportEmployees(res.data.data)
        }
      })
      .catch(() => setReportEmployees([]))
      .finally(() => setEmployeesLoading(false))
  }, [])

  const isSingleEmployeeView = Boolean(employeeIdFromUrl)
  const singleEmployeeName = isSingleEmployeeView
    ? reportEmployees.find((e) => e.id === employeeIdFromUrl)?.name ?? null
    : null

  return (
    <div className="min-h-screen bg-background">
      <main className=" mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {isSingleEmployeeView && (
              <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-1" asChild>
                <Link href="/dashboard/employees">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Employees
                </Link>
              </Button>
            )}
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {isSingleEmployeeView && singleEmployeeName
                ? `Attendance – ${singleEmployeeName}`
                : "Employee Monthly Data"}
            </h1>
            <p className="text-muted-foreground">
              {isSingleEmployeeView
                ? "Day-wise attendance for this employee. Change month or view all employees."
                : "View complete day-wise attendance and performance data"}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <EmployeeSelector
              employees={reportEmployees}
              employeesLoading={employeesLoading}
              selectedEmployee={selectedEmployee}
              onEmployeeChange={setSelectedEmployee}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              showEmployeeFilter={viewMode === "detail" && !isSingleEmployeeView}
            />
            {isSingleEmployeeView && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/report">View all employees</Link>
              </Button>
            )}
          </div>
        </div>

        {viewMode === "matrix" ? (
          <AttendanceMatrix selectedMonth={selectedMonth} selectedEmployeeId={selectedEmployee} />
        ) : (
          <>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1" />
              <div className="lg:col-span-2" />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
