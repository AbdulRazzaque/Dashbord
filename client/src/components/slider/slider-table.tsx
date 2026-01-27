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

import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AxiosError } from "axios";



const SliderTable = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

 

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
     
    </Table>
  );
};

export default SliderTable;
