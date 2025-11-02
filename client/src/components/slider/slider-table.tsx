"use client";

import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import DeleteSlider from "./delete-slider";
import { ILanding } from "@/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeLandingStatus } from "@/lib/http/api";
import { AxiosError } from "axios";

interface PageProps {
  data: ILanding[];
}

const SliderTable = ({ data }: PageProps) => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["changeLandingStatus"],
    mutationFn: async (id: string) => {
      return await changeLandingStatus(id);
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      return queryClient.invalidateQueries({
        queryKey: ["getSliders"],
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
          <TableHead className="font-semibold">Image</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item: ILanding) => (
          <TableRow key={item._id}>
            <TableCell className=" font-medium  text-card-foreground/80">
              <div className="flex gap-3 items-center">
                <Avatar className="rounded-full">
                  <AvatarImage src={item.images[0]} />
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
              </div>
            </TableCell>

            <TableCell>
              {item.createdBy.firstName + " " + item.createdBy.lastName}
            </TableCell>
            <TableCell>{new Date(item.createdAt).toDateString()}</TableCell>
            <TableCell>
              <Switch
                checked={item.status === "active"}
                disabled={isPending}
                onCheckedChange={() => mutate(item._id)}
                aria-label={`Toggle status for ${item._id}`}
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
                    router.push(`/dashboard/slider/update?id=${item._id}`)
                  }
                >
                  <Icon icon="heroicons:pencil" className=" h-4 w-4  " />
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/dashboard/slider/view?id=${item._id}`)
                  }
                  size="icon"
                  variant="outline"
                  className=" h-7 w-7"
                  color="secondary"
                >
                  <Icon icon="heroicons:eye" className="h-4 w-4" />
                </Button>
                <DeleteSlider id={item._id} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SliderTable;
