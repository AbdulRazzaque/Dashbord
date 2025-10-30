"use client";

import DatePickerWithRange from "@/components/date-picker-with-range";
import EcommerceStats from "@/components/ecommerce-stats";

import RevinueChart from "@/components/revinue-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getOrdersCount } from "@/lib/http/api";
import { useEffect, useState } from "react";
import { Counts } from "@/types";

const Page = () => {
  const [getData, setData] = useState<Counts>({
    totalSales: 0,
    todaysOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
  });

  const currentDate = new Date();
  const startOfDay = new Date(currentDate);
  startOfDay.setUTCHours(0, 0, 0, 0); // Set to 12:00:00 AM UTC
  const endOfDay = new Date(currentDate);

  const [startDate, setStartDate] = useState(startOfDay);
  const [endDate, setEndDate] = useState(endOfDay);

  const { data, isLoading } = useQuery({
    queryKey: ["getOrdersCount", endDate], // Depend on endDate
    queryFn: async () => {
      return await getOrdersCount({ endDate, startDate }).then(
        (res) => res.data
      );
    },
  });

  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="text-2xl font-medium text-default-800">Dashboard</div>
        {/* Pass startDate, endDate, and setEndDate */}
        <DatePickerWithRange
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      </div>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <EcommerceStats data={getData} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <Card>
            <CardHeader className="border-none pb-0 mb-0">
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="flex-1 whitespace-nowrap">
                  Average Revenue
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <RevinueChart />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
        
        </div>
      </div>
    </div>
  );
};

export default Page;
