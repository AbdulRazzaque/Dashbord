"use client";

import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SubCategory } from "@/types";
import { useRouter } from "next/navigation";
import DeleteSubCategory from "./delete-subCategory";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { changeSubCategoryStatus } from "@/lib/http/api";

interface Props {
  data: SubCategory[];
}

const SubCategoryTable = ({ data }: Props) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["changeSubCategoryStatus"],
    mutationFn: async (id: string) => {
      return await changeSubCategoryStatus(id);
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      return queryClient.invalidateQueries({
        queryKey: ["getSubCategoriesAdmin"],
      });
    },
    onError(error, variables, context) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.errors[0].msg);
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item: SubCategory) => (
          <TableRow key={item._id}>
            <TableCell className=" font-medium  text-card-foreground/80">
              <div className="flex gap-3 items-center">
                <Avatar className="rounded-full">
                  <AvatarImage src={item.image} />
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <span className=" text-sm   text-card-foreground">
                  {item.name}
                </span>
              </div>
            </TableCell>

            <TableCell>
              {item.description
                ? item.description.slice(0, 25) + "..."
                : item.description}
            </TableCell>

            <TableCell>
              {item.categoryId ? item.categoryId.name : "-"}
            </TableCell>

            <TableCell>{new Date(item.createdAt).toDateString()}</TableCell>

            <TableCell>
              <Switch
                checked={item.status === "active"}
                disabled={isPending}
                onCheckedChange={() => mutate(item._id)}
                aria-label={`Toggle status for ${item.name}`}
              />
            </TableCell>
            <TableCell className="flex">
              <div className="flex gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  color="secondary"
                  className=" h-7 w-7"
                  onClick={() =>
                    router.push(`/dashboard/sub-category/update?id=${item._id}`)
                  }
                >
                  <Icon icon="heroicons:pencil" className=" h-4 w-4  " />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className=" h-7 w-7"
                  color="secondary"
                  onClick={() =>
                    router.push(`/dashboard/sub-category/view?id=${item._id}`)
                  }
                >
                  <Icon icon="heroicons:eye" className="h-4 w-4" />
                </Button>
                <DeleteSubCategory id={item._id} name={item.name} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SubCategoryTable;
