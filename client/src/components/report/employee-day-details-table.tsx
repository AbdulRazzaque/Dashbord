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
import type { ReportDailyRecord } from "@/lib/http/api";
import { formatTime12h } from "@/lib/utils";
import { Clock } from "lucide-react";

interface EmployeeDayDetailsTableProps {
  dailyRecords: ReportDailyRecord[];
  loading?: boolean;
  /** When true, only table/content is rendered (no Card) for embedding in another Card */
  embedded?: boolean;
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

const getStatusBadgeClass = (status: string) => {
  if (status === "present") return "bg-green-100 text-green-800 border-green-200";
  if (status === "absent") return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

export function EmployeeDayDetailsTable({
  dailyRecords,
  loading = false,
  embedded = false,
}: EmployeeDayDetailsTableProps) {
  const sorted = [...dailyRecords].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const loadingBlock = (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      Loading...
    </div>
  );
  const emptyBlock = (
    <p className="text-muted-foreground text-center py-8">
      No attendance records for this month.
    </p>
  );

  if (loading) {
    if (embedded) return loadingBlock;
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Day-wise details
          </CardTitle>
        </CardHeader>
        <CardContent>{loadingBlock}</CardContent>
      </Card>
    );
  }

  if (sorted.length === 0) {
    if (embedded) return emptyBlock;
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Day-wise details
          </CardTitle>
        </CardHeader>
        <CardContent>{emptyBlock}</CardContent>
      </Card>
    );
  }

  const tableContent = (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">Sr No</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Check In</TableHead>
            <TableHead className="font-semibold">Check Out</TableHead>
            <TableHead className="font-semibold">Total Hours</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((record, index) => {
            const isAbsent = record.status === "absent";
            const isPresent = record.status === "present";
            return (
              <TableRow
                key={record.date}
                className="border-border hover:bg-muted/30"
              >
                <TableCell className="font-medium text-card-foreground/80">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium text-card-foreground/80">
                  {formatDate(record.date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTime12h(record.checkIn || "") || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatTime12h(record.checkOut || "") || "—"}
                </TableCell>
                <TableCell className="font-medium text-card-foreground/80">
                  {formatHours(record.hoursWorked)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(
                      record.status || ""
                    )}`}
                  >
                    {isPresent ? "Present" : isAbsent ? "Absent" : record.status || "—"}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  if (embedded) return tableContent;

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
        <div className="rounded-b-lg">{tableContent}</div>
      </CardContent>
    </Card>
  );
}
