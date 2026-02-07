"use client"

import { useMemo, useState, useEffect } from "react"
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
import { Search, Check, X, Loader2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getReportMonthlyMatrix, type ReportEmployee, type ReportDailyRecord } from "@/lib/http/api"
import { exportAttendanceMatrixToExcel } from "@/lib/excel-export"

interface AttendanceMatrixProps {
  selectedMonth: Date
  selectedEmployeeId?: string
  /** When provided (e.g. from employees/view), use this data and skip fetch */
  initialData?: {
    employees: ReportEmployee[]
    dailyRecords: ReportDailyRecord[]
  }
}

const statusConfig: Record<string, { icon: typeof Check; color: string; short: string }> = {
  present: { icon: Check, color: "bg-emerald-500/20 text-emerald-400", short: "P" },
  absent: { icon: X, color: "bg-red-500/20 text-red-400", short: "A" },
}

export function AttendanceMatrix({ selectedMonth, selectedEmployeeId = "all", initialData }: AttendanceMatrixProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const [statusFilter, setStatusFilter] = useState("all")
  const [employees, setEmployees] = useState<ReportEmployee[]>(initialData?.employees ?? [])
  const [dailyRecords, setDailyRecords] = useState<ReportDailyRecord[]>(initialData?.dailyRecords ?? [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  const year = selectedMonth.getFullYear()
  const month = selectedMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  useEffect(() => {
    if (initialData) {
      setEmployees(initialData.employees)
      setDailyRecords(initialData.dailyRecords)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getReportMonthlyMatrix({
      year,
      month,
      ...(selectedEmployeeId && selectedEmployeeId !== "all" ? { employeeId: selectedEmployeeId } : {}),
      search: searchTerm.trim() || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    })
      .then((res) => {
        if (res.data?.ok) {
          setEmployees(res.data.employees ?? [])
          setDailyRecords(res.data.dailyRecords ?? [])
        } else {
          setEmployees([])
          setDailyRecords([])
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message ?? "Failed to load attendance data")
        setEmployees([])
        setDailyRecords([])
      })
      .finally(() => setLoading(false))
  }, [year, month, selectedEmployeeId, searchTerm, statusFilter, initialData])
  const recordsByEmployee = useMemo(() => {
    const map = new Map<string, Map<number, ReportDailyRecord>>()
    for (const record of dailyRecords) {
      const day = new Date(record.date).getDate()
      if (!map.has(record.employeeId)) {
        map.set(record.employeeId, new Map())
      }
      map.get(record.employeeId)?.set(day, record)
    }
    return map
  }, [dailyRecords])


  const filteredEmployees = employees
  const getStatusForDay = (employeeId: string, day: number): ReportDailyRecord["status"] | null => {
    return recordsByEmployee.get(employeeId)?.get(day)?.status ?? null
  }

  const getRecordForDay = (employeeId: string, day: number): ReportDailyRecord | null => {
    return recordsByEmployee.get(employeeId)?.get(day) ?? null
  }

  const monthName = selectedMonth.toLocaleString("default", { month: "long", year: "numeric" })

  if (error) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="py-8 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    )
  }

  return (
    
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">
              All Employees Attendance - {monthName}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Loading..." : `Showing ${filteredEmployees.length} employees`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={loading || employees.length === 0}
              onClick={() =>
                exportAttendanceMatrixToExcel(
                  employees.map((e) => ({ id: e.id, name: e.name, employeeId: e.employeeId, emp_code: e.emp_code })),
                  dailyRecords.map((r) => ({ date: r.date, employeeId: r.employeeId, status: r.status })),
                  year,
                  month
                )
              }
            >
              <FileDown className="h-4 w-4" />
              Export to Excel
            </Button>
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
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!loading && (
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
                  return (
                    <div
                      key={day}
                      className="flex min-w-[2.7rem] flex-shrink-0 flex-col items-center justify-center border-r border-border py-2"
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
                      <p className="truncate text-[10px] text-muted-foreground">{emp.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {days.map((day) => {
                      const record = getRecordForDay(emp.id, day)
                      const status = record?.status ?? null
                      const hasTimes = record && (record.checkIn || record.checkOut)
                      return (
                        <div
                          key={day}
                          className="flex min-w-[2.7rem] flex-shrink-0 flex-col items-center justify-center gap-0.5 border-r border-border py-2"
                          title={`${emp.name} - Day ${day}: ${status ?? ""}${hasTimes ? ` | In: ${record.checkIn || "—"} Out: ${record.checkOut || "—"}` : ""}`}
                        >
                          {status && (status === "present" || status === "absent") && (
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-semibold ${
                                statusConfig[status]?.color ?? ""
                              }`}
                            >
                              {statusConfig[status]?.short}
                            </span>
                          )}
                          {hasTimes && (
                            <div className="flex flex-col items-center text-[9px] text-muted-foreground leading-tight">
                              <span>{record.checkIn || "—"}</span>
                              <span>{record.checkOut || "—"}</span>
                            </div>
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
        )}
      </CardContent>
    </Card>
  )
  
}
