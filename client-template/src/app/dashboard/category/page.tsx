"use client";

import React, { useEffect, useState } from "react";
import RowEditingDialog from "@/components/category/row-editing-dialog";
import BreadCrumb from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAdmin } from "@/lib/http/api";
import { CategoryData } from "@/types";
import { useRouter } from "next/navigation";

const Page = () => {
  const breadcrumbItems = [
    { title: "Categories", link: "/dashboard/category" },
  ];

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["getCategoriesAdmin"],
    queryFn: async () => {
      return await getCategoriesAdmin().then((res) => res.data);
    },
  });

  useEffect(() => {
    if (data) {
      setCategories(data.data);
    }
  }, [data]);

  return (
    <>
      <div className="flex items-center justify-between py-5">
        <BreadCrumb items={breadcrumbItems} />
        <Button onClick={() => router.push("/dashboard/category/new")}>
          <Plus className="w-4 h-4 text-primary-foreground mr-1" />
          Add Category
        </Button>
      </div>
      <Card title="">
        <RowEditingDialog data={categories} />
      </Card>
    </>
  );
};

export default Page;
