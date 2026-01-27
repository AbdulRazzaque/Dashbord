

"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";

interface DatePickerWithRangeProps {
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  className?: string;
  maxDate?: Date;
}

export default function DatePickerWithRange({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  className,
  maxDate,
}: DatePickerWithRangeProps) {
  const { theme: mode } = useTheme();

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            color={mode === "dark" ? "secondary" : "default"}
            className={cn(" font-normal", {
              " bg-white text-default-600": mode !== "dark",
            })}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? (
              endDate ? (
                <>
                  {format(startDate, "LLL dd, y")} -{" "}
                  {format(endDate, "LLL dd, y")}
                </>
              ) : (
                format(startDate, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={startDate}
            selected={{ from: startDate, to: endDate }}
            onSelect={(range) => {
              if (range?.from) setStartDate(range.from);
              if (range?.to) setEndDate(range.to || range.from);
            }}
            numberOfMonths={2}
            disabled={(date) => {
              if (maxDate) {
                return date > maxDate;
              }
              return false;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
