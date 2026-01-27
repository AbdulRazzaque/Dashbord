"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import BreadCrumb from "@/components/ui/breadcrumb";
import { getSingleEmployee, singleAbsentEmployee } from "@/lib/http/api";

import SingleAbsentEmployeeTable from "@/components/absent/singleAbsnetEmployeeTable";
export default function Page() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const params = useSearchParams();
  const id = params.get("id");

  const { data = [], isLoading } = useQuery({
    queryKey: ["singleAbsentEmployee", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await singleAbsentEmployee(id!);
      return res.data; // ✅ ARRAY ONLY
    },
  });


 
  const breadcrumbItems = [
    { title: "Absent", link: "/dashboard/absent" },
    { title: "Absent Details", link: "#" },
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <BreadCrumb items={breadcrumbItems} />

      <div className="space-y-6">
        <Card>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
             
             
            </div>
          </div>

          <SingleAbsentEmployeeTable
            data={data}
            isLoading={isLoading}
            page={page}
            setPage={setPage}
            totalEmployee={data.length}
          />
        </Card>
      </div>
    </div>
  );
}
