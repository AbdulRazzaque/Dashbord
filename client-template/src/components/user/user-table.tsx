"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import type { UserData } from "@/types";
import DeleteUser from "./delete-user";
import { Badge } from "../ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUserStatus, verifyUser } from "@/lib/http/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Skeleton } from "../ui/skeleton";

interface UserTableProps {
  data: UserData[];
  isLoading?: boolean;
}
const UserTable = ({ data, isLoading = false }: UserTableProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Mutation for changing user status (active/inactive)
  const { mutate: changeStatus, isPending: isChangingStatus } = useMutation({
    mutationKey: ["changeUserStatus"],
    mutationFn: async (id: string) => {
      return await changeUserStatus(id); // API to change status
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["getUsers"] }); // Refresh users data
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.errors?.[0]?.msg || "An error occurred"
        );
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  // Mutation for verifying user
  const { mutate: verifyUserMutation, isPending: isVerifying } = useMutation({
    mutationKey: ["verifyUser"],
    mutationFn: async (id: string) => {
      return await verifyUser({ userId: id }); // API to verify user
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["getUsers"] }); // Refresh users data
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.errors?.[0]?.msg || "An error occurred"
        );
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Added By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-6 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[200px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[100px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Added By</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Verified</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item: UserData) => (
          <TableRow key={item._id}>
            <TableCell className=" font-medium  text-card-foreground/80">
              <div className="flex gap-3 items-center">
                <Avatar className="rounded-full">
                  <AvatarImage src={item.avatar} />
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <span className=" text-sm   text-card-foreground">
                  {item.firstName + " " + item.lastName}
                </span>
              </div>
            </TableCell>

            <TableCell>{item.email}</TableCell>
            <TableCell>
              {item.addedBy
                ? item.addedBy.firstName + " " + item.addedBy.lastName
                : "-"}
            </TableCell>
            <TableCell>{new Date(item.createdAt).toDateString()}</TableCell>
            <TableCell>
              <Switch
                checked={item.status === "active"}
                disabled={isChangingStatus}
                onCheckedChange={() => changeStatus(item._id)} // Calls changeUserStatus API
                aria-label={`Toggle status for ${item.firstName}`}
              />
            </TableCell>
            <TableCell>
              <Badge color="secondary" variant="soft">
                {item.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                onClick={() => verifyUserMutation(item._id)} // Calls verifyUser API
                variant="soft"
                color={item.isVerified ? "success" : "destructive"}
                size="sm"
                disabled={isVerifying}
              >
                {item.isVerified ? "Verified" : "Unverified"}
              </Button>
            </TableCell>
            <TableCell className="flex">
              <div className="flex gap-3">
                <Button
                  onClick={() =>
                    router.push(`/dashboard/user/update?id=${item._id}`)
                  }
                  size="icon"
                  variant="outline"
                  color="secondary"
                  className=" h-7 w-7"
                >
                  <Icon icon="heroicons:pencil" className=" h-4 w-4  " />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className=" h-7 w-7 bg-transparent"
                  color="secondary"
                  onClick={() =>
                    router.push(`/dashboard/user/view?id=${item._id}`)
                  }
                >
                  <Icon icon="heroicons:eye" className="h-4 w-4" />
                </Button>
                <DeleteUser
                  id={item._id}
                  name={item.firstName + " " + item.lastName}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
