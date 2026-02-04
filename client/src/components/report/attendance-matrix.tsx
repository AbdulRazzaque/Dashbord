"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Check, X, Clock, Palmtree, CalendarOff } from "lucide-react"
import { employees, getMonthlyData, type DailyRecord } from './employee-data'

interface AttendanceMatrixProps {
  selectedMonth: Date
}

const statusConfig = {
  present: { icon: Check, color: "bg-emerald-500/20 text-emerald-400", short: "P" },
  absent: { icon: X, color: "bg-red-500/20 text-red-400", short: "A" },
  // "half-day": { icon: Clock, color: "bg-amber-500/20 text-amber-400", short: "H" },
  // leave: { icon: Palmtree, color: "bg-blue-500/20 text-blue-400", short: "L" },
  // holiday: { icon: CalendarOff, color: "bg-purple-500/20 text-purple-400", short: "HO" },
  // weekend: { icon: CalendarOff, color: "bg-muted text-muted-foreground", short: "W" },
}

export function AttendanceMatrix({ selectedMonth }: AttendanceMatrixProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const year = selectedMonth.getFullYear()
  const month = selectedMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const allRecords = useMemo(() => getMonthlyData(year, month), [year, month])

  const recordsByEmployee = useMemo(() => {
    const map = new Map<string, Map<number, DailyRecord>>()
    for (const record of allRecords) {
      const day = new Date(record.date).getDate()
      if (!map.has(record.employeeId)) {
        map.set(record.employeeId, new Map())
      }
      map.get(record.employeeId)?.set(day, record)
    }
    return map
  }, [allRecords])

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department))],
    []
  )

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDept = departmentFilter === "all" || emp.department === departmentFilter
      
      if (statusFilter === "all") {
        return matchesSearch && matchesDept
      }
      
      const empRecords = recordsByEmployee.get(emp.id)
      if (!empRecords) return false
      
      const hasStatus = Array.from(empRecords.values()).some(
        (r) => r.status === statusFilter
      )
      return matchesSearch && matchesDept && hasStatus
    })
  }, [searchTerm, departmentFilter, statusFilter, recordsByEmployee])

  const getStatusForDay = (employeeId: string, day: number): DailyRecord["status"] | null => {
    return recordsByEmployee.get(employeeId)?.get(day)?.status || null
  }

  const monthName = selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">
              All Employees Attendance - {monthName}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 bg-secondary pl-9"
              />
            </div>
           
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-secondary">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="leave">Leave</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">Legend:</span>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Badge key={key} variant="outline" className={`${config.color} text-xs`}>
              {config.short} - {key.charAt(0).toUpperCase() + key.slice(1)}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <div className="min-w-[1200px]">
            <div className="sticky top-0 z-10 flex border-b border-border bg-secondary">
              <div className="sticky left-0 z-20 flex w-52 flex-shrink-0 items-center border-r border-border bg-secondary px-3 py-2">
                <span className="text-xs font-semibold text-foreground">Employee Name</span>
              </div>
              <div className="flex">
                {days.map((day) => {
                  const date = new Date(year, month, day)
                  const dayName = date.toLocaleString("default", { weekday: "short" })
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6
                  return (
                    <div
                      key={day}
                      className={`flex w-10 flex-shrink-0 flex-col items-center justify-center border-r border-border py-2 ${
                        isWeekend ? "bg-muted/50" : ""
                      }`}
                    >
                      <span className="text-[10px] text-muted-foreground">{dayName}</span>
                      <span className="text-xs font-medium text-foreground">{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {filteredEmployees.map((emp, idx) => (
                <div
                  key={emp.id}
                  className={`flex border-b border-border ${
                    idx % 2 === 0 ? "bg-card" : "bg-secondary/30"
                  } hover:bg-secondary/50`}
                >
                  <div className="sticky left-0 z-10 flex w-52 flex-shrink-0 items-center gap-2 border-r border-border bg-inherit px-3 py-2">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                      {emp.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{emp.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {days.map((day) => {
                      const status = getStatusForDay(emp.id, day)
                      const config = status ? statusConfig[status] : null
                      const date = new Date(year, month, day)
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6
                      return (
                        <div
                          key={day}
                          className={`flex w-10 flex-shrink-0 items-center justify-center border-r border-border py-2 ${
                            isWeekend ? "bg-muted/30" : ""
                          }`}
                          title={`${emp.name} - Day ${day}: ${status || "No data"}`}
                        >
                          {config && (
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold ${config.color}`}
                            >
                              {config.short}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
