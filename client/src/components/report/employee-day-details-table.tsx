"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ReportDailyRecord } from "@/lib/http/api";
import { formatTime12h } from "@/lib/utils";
import { Clock, LogIn, LogOut } from "lucide-react";

interface EmployeeDayDetailsTableProps {
  dailyRecords: ReportDailyRecord[];
  loading?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHours(hours: number): string {
  if (hours <= 0) return "—";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function EmployeeDayDetailsTable({
  dailyRecords,
  loading = false,
}: EmployeeDayDetailsTableProps) {
  const sorted = [...dailyRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Day-wise details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sorted.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Day-wise details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No attendance records for this month.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Check In / Check Out & Total Hours
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Daily timings and hours for the selected month.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto rounded-b-lg">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">
                  <span className="flex items-center gap-1.5">
                    <LogIn className="h-4 w-4 text-muted-foreground" />
                    Check In
                  </span>
                </TableHead>
                <TableHead className="font-semibold">
                  <span className="flex items-center gap-1.5">
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    Check Out
                  </span>
                </TableHead>
                <TableHead className="font-semibold">Total Hours</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((record) => {
                const isAbsent = record.status === "absent";
                const isPresent = record.status === "present";
                return (
                  <TableRow
                    key={record.date}
                    className="border-border hover:bg-muted/30"
                  >
                    <TableCell className="font-medium text-foreground">
                      {formatDate(record.date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTime12h(record.checkIn || "") || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTime12h(record.checkOut || "") || "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatHours(record.hoursWorked)}
                    </TableCell>
                    <TableCell>
                      {isPresent && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                        >
                          Present
                        </Badge>
                      )}
                      {isAbsent && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/15 text-red-600 border-red-500/30"
                        >
                          Absent
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
