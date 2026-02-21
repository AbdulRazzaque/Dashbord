"use client";

import BreadCrumb from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import React, { useMemo, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AttendanceSummaryTable from "@/components/attendance/attendance-summary-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTodayAttendanceSummary, getEmployees, addManualPunch } from "@/lib/http/api";
import { SummaryRow } from "@/types";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const todayStr = () => new Date().toISOString().slice(0, 10);
const currentTimeStr = () => {
  const n = new Date();
  const h = n.getHours();
  const m = n.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const AttendancePage = () => {
  const breadcrumbItems = [
    { title: "Attendance", link: "/dashboard/attendance" },
  ];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualEmpCode, setManualEmpCode] = useState<string>("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualDate, setManualDate] = useState(todayStr);
  const [manualCheckIn, setManualCheckIn] = useState(() => currentTimeStr());
  const [manualCheckOut, setManualCheckOut] = useState(""); // unused; Check-out field removed

  const queryClient = useQueryClient();

  const { data: employeesRes } = useQuery({
    queryKey: ["getEmployees"],
    queryFn: async () => {
      const res = await getEmployees();
      const body = res?.data as { data?: unknown[] } | unknown[];
      if (Array.isArray(body)) return body;
      return Array.isArray(body?.data) ? body.data : [];
    },
    enabled: manualOpen,
  });
  const allEmployees = (employeesRes ?? []) as Array<{
    emp_code: number;
    first_name?: string;
    raw?: { first_name?: string; format_name?: string; full_name?: string };
  }>;
  const getEmployeeName = (emp: (typeof allEmployees)[0]) =>
    emp?.first_name ||
    emp?.raw?.first_name ||
    emp?.raw?.format_name ||
    emp?.raw?.full_name ||
    `Employee ${emp?.emp_code ?? ""}`;

  const filteredEmployeesForSuggestions = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return allEmployees.slice(0, 50);
    return allEmployees.filter(
      (emp) =>
        getEmployeeName(emp).toLowerCase().includes(q) ||
        String(emp.emp_code).includes(q)
    );
  }, [allEmployees, employeeSearch]);

  useEffect(() => {
    if (manualOpen) {
      setEmployeeSearch("");
      setManualEmpCode("");
      setShowSuggestions(false);
      setManualDate(todayStr());
      setManualCheckIn(currentTimeStr());
    }
  }, [manualOpen]);

  const { data, isLoading } = useQuery<SummaryRow[]>({
    queryKey: ["getTodayAttendanceSummary"],
    queryFn: async () => {
      const res = await getTodayAttendanceSummary();
      return res.data.data;
    },
  });

  const addPunchMutation = useMutation({
    mutationFn: addManualPunch,
    onSuccess: (res) => {
      if (res.data?.ok) {
        toast.success(
          `Punch added (${res.data.punchesSaved}). Absent removed: ${res.data.absentRemoved}`
        );
        queryClient.invalidateQueries({ queryKey: ["getTodayAttendanceSummary"] });
        setManualOpen(false);
        setManualEmpCode("");
        setEmployeeSearch("");
        setShowSuggestions(false);
        setManualDate(todayStr());
        setManualCheckIn(currentTimeStr());
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg =
        err?.response?.data?.message ?? "Manual punch add failed.";
      toast.error(msg);
    },
  });

  const employees = data || [];

  const filteredEmployees = useMemo(() => {
    let result = [...employees];
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (emp) =>
          (emp.first_name && emp.first_name.toLowerCase().includes(s)) ||
          String(emp.emp_code).toLowerCase().includes(s)
      );
    }
    if (filter !== "all") {
      result = result.filter((emp) => {
        const inStatus = emp?.checkIn?.status;
        const outStatus = emp?.checkOut?.status;
        return inStatus === filter || outStatus === filter;
      });
    }
    return result;
  }, [employees, search, filter]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const empCode = Number(manualEmpCode);
    if (!manualEmpCode || Number.isNaN(empCode)) {
      toast.error("Please select an employee.");
      return;
    }
    if (!manualDate || !manualCheckIn) {
      toast.error("Date and Check-in time are required.");
      return;
    }
    addPunchMutation.mutate({
      emp_code: empCode,
      date: manualDate,
      checkInTime: manualCheckIn,
    });
  };

  return (
    <>
      <div className="flex items-center justify-between py-5 gap-3 flex-wrap">
        <BreadCrumb items={breadcrumbItems} />
        <Button
          type="button"
          onClick={() => setManualOpen(true)}
          variant="outline"
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Manual Add Punch
        </Button>
      </div>
      <Card>
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Input
                placeholder="Search Employee Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 max-w-full"
              />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="State filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Checkout">Checkout</SelectItem>
                  <SelectItem value="Early Out">Early Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
           
          </div>
        </div>
        <AttendanceSummaryTable
          data={filteredEmployees || []}
          isLoading={isLoading}
          page={page}
          setPage={setPage}
          totalEmployee={0}
        />
      </Card>

      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>Manual Add Punch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name or employee code..."
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  // onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full"
                  autoComplete="off"
                />
                {showSuggestions && (
                  <ul
                    className="absolute z-[10001] mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover py-1 text-popover-foreground shadow-md"
                    role="listbox"
                  >
                    {filteredEmployeesForSuggestions.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-muted-foreground">No employee found.</li>
                    ) : (
                      filteredEmployeesForSuggestions.map((emp) => (
                        <li
                          key={emp.emp_code}
                          role="option"
                          className={cn(
                            "flex cursor-pointer items-center px-3 py-2 text-sm outline-none",
                            "hover:bg-accent hover:text-accent-foreground"
                          )}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setManualEmpCode(String(emp.emp_code));
                            setEmployeeSearch(`${getEmployeeName(emp)} (${emp.emp_code})`);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="font-medium">{getEmployeeName(emp)}</span>
                          <span className="ml-2 text-muted-foreground">({emp.emp_code})</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
              {!manualEmpCode && (
                <p className="text-xs text-muted-foreground">Type name or code and pick from suggestions</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Check-in time (HH:mm)</Label>
              <Input
                type="time"
                value={manualCheckIn}
                onChange={(e) => setManualCheckIn(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Defaults to current time; you can change it if needed.</p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setManualOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addPunchMutation.isPending}>
                {addPunchMutation.isPending ? "Adding…" : "Add Punch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default AttendancePage;
