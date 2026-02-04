"use client"

import { useState } from "react"
import { EmployeeSelector } from "@/components/report/employee-selector"
import { AttendanceMatrix } from "@/components/report/attendance-matrix"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Table2 } from "lucide-react"

export default function EmployeeDashboard() {
  const [selectedEmployee, setSelectedEmployee] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState<"matrix" | "detail">("matrix")

  return (
    <div className="min-h-screen bg-background">
      <main className=" mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Employee Monthly Data
            </h1>
            <p className="text-muted-foreground">
              View complete day-wise attendance and performance data
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          
            <EmployeeSelector
              selectedEmployee={selectedEmployee}
              onEmployeeChange={setSelectedEmployee}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
              showEmployeeFilter={viewMode === "detail"}
            />
          </div>
        </div>

        {viewMode === "matrix" ? (
          <AttendanceMatrix selectedMonth={selectedMonth} />
        ) : (
          <>
            {/* <StatsCards selectedEmployee={selectedEmployee} selectedMonth={selectedMonth} /> */}
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
               
              </div>
              <div className="lg:col-span-2">
              
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
