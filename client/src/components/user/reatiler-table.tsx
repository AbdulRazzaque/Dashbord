"use client";

import { useState } from "react";
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
import type { RetailerDetails } from "@/types";
import { Badge } from "../ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyRetailerDetails } from "@/lib/http/api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

interface Props {
  data: RetailerDetails[];
}

const RetailerTable = ({ data }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedRetailer, setSelectedRetailer] =
    useState<RetailerDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: verifyUserMutation, isPending: isVerifying } = useMutation({
    mutationKey: ["verifyRetailerDetails"],
    mutationFn: async (id: string) => {
      return await verifyRetailerDetails({ userId: id });
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["getRetailerDetails"] });
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

  const handleViewDetails = (retailer: RetailerDetails) => {
    setSelectedRetailer(retailer);
    setIsModalOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Verified By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Business Name</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item: RetailerDetails) => (
            <TableRow key={item._id}>
              <TableCell className=" font-medium  text-card-foreground/80">
                <div className="flex gap-3 items-center">
                  <Avatar className="rounded-full">
                    <AvatarImage
                      src={item.userId?.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <span className=" text-sm   text-card-foreground">
                    {item.userId?.firstName + " " + item.userId?.lastName}
                  </span>
                </div>
              </TableCell>

              <TableCell>{item.userId?.email}</TableCell>

              <TableCell>
                {item.verifiedBy
                  ? item.verifiedBy.firstName + " " + item.verifiedBy.lastName
                  : "-"}
              </TableCell>

              <TableCell>{new Date(item.createdAt).toDateString()}</TableCell>

              <TableCell>
                <Badge color="secondary" variant="soft">
                  {item.businessName}
                </Badge>
              </TableCell>

              <TableCell>
                <Button
                  onClick={() => verifyUserMutation(item.userId._id)}
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
                    size="icon"
                    variant="outline"
                    className=" h-7 w-7"
                    color="secondary"
                    onClick={() => handleViewDetails(item)}
                  >
                    <Icon icon="heroicons:eye" className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Icon
                icon="heroicons:building-storefront"
                className="h-6 w-6 text-primary"
              />
              Retailer Details
            </DialogTitle>
          </DialogHeader>

          {selectedRetailer && (
            <div className="space-y-6">
              {/* User Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="heroicons:user" className="h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={
                          selectedRetailer.userId?.avatar || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="text-lg">
                        {selectedRetailer.userId?.firstName?.[0]}
                        {selectedRetailer.userId?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Full Name
                          </label>
                          <p className="text-sm font-semibold">
                            {selectedRetailer.userId?.firstName}{" "}
                            {selectedRetailer.userId?.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Email Address
                          </label>
                          <p className="text-sm">
                            {selectedRetailer.userId?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon
                      icon="heroicons:building-office"
                      className="h-5 w-5"
                    />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Business Name
                      </label>
                      <p className="text-sm font-semibold">
                        {selectedRetailer.businessName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Tax ID
                      </label>
                      <p className="text-sm font-mono">
                        {selectedRetailer.taxId}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Business Address
                    </label>
                    <p className="text-sm">
                      {selectedRetailer.businessAddress}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Business Description
                    </label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedRetailer.businessDescription}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Business License
                    </label>
                    <div className="mt-2">
                      <Image
                        src={
                          selectedRetailer.businessLicense || "/placeholder.svg"
                        }
                        width={100}
                        height={100}
                        alt="Business License"
                        className="max-w-full h-auto rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        style={{ maxHeight: "200px" }}
                        onClick={() =>
                          window.open(
                            selectedRetailer.businessLicense,
                            "_blank"
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to view full size
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="heroicons:shield-check" className="h-5 w-5" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          color={
                            selectedRetailer.isVerified
                              ? "default"
                              : "destructive"
                          }
                          className="flex items-center gap-1"
                        >
                          <Icon
                            icon={
                              selectedRetailer.isVerified
                                ? "heroicons:check-circle"
                                : "heroicons:x-circle"
                            }
                            className="h-3 w-3"
                          />
                          {selectedRetailer.isVerified
                            ? "Verified"
                            : "Unverified"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Verified By
                      </label>
                      <p className="text-sm">
                        {selectedRetailer.verifiedBy
                          ? `${selectedRetailer.verifiedBy.firstName} ${selectedRetailer.verifiedBy.lastName}`
                          : "Not verified yet"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon icon="heroicons:clock" className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Created At
                      </label>
                      <p className="text-sm">
                        {new Date(selectedRetailer.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Last Updated
                      </label>
                      <p className="text-sm">
                        {new Date(selectedRetailer.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                {/* <Button
                  onClick={() =>
                    verifyUserMutation(selectedRetailer.userId._id)
                  }
                  disabled={isVerifying}
                  className="flex items-center gap-2"
                >
                  <Icon icon="heroicons:shield-check" className="h-4 w-4" />
                  {selectedRetailer.isVerified ? "Verified" : "Verify Retailer"}
                </Button> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RetailerTable;
