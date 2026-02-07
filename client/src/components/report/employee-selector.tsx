"use client"

import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ReportEmployee } from "@/lib/http/api"

interface EmployeeSelectorProps {
  employees: ReportEmployee[]
  employeesLoading?: boolean
  selectedEmployee: string
  onEmployeeChange: (value: string) => void
  selectedMonth: Date
  onMonthChange: (date: Date) => void
  showEmployeeFilter?: boolean
}

export function EmployeeSelector({
  employees,
  employeesLoading = false,
  selectedEmployee,
  onEmployeeChange,
  selectedMonth,
  onMonthChange,
  showEmployeeFilter = true,
}: EmployeeSelectorProps) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]

  const handlePrevMonth = () => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(newDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(newDate.getMonth() + 1)
    onMonthChange(newDate)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handlePrevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous month</span>
        </Button>
        <span className="min-w-[140px] text-center text-sm font-medium text-foreground">
          {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>

      {showEmployeeFilter && (
        <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
          <SelectTrigger className="w-full sm:w-[200px] border-border bg-card">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] border-border bg-card">
            <SelectItem value="all">All Employees</SelectItem>
            {employeesLoading
              ? (
                  <SelectItem value="_loading" disabled>
                    Loading...
                  </SelectItem>
                )
              : employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
