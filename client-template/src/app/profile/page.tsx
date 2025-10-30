"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateAddress, updateProfile } from "@/lib/http/api";
import { UserData } from "@/types";
import { toast } from "react-hot-toast";
import { ProfileUpdate } from "@/components/user/profile-update";
import { ProfileDisplay } from "@/components/user/profile-display";
import { useAuthStore } from "@/store";
import logo from "@/public/logo.png";
import { HeaderLanding } from "@/components/landing-page/header-landing";
import Footer from "@/components/landing-page/footer";
import { AddAddress } from "../address/components/add-address";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddressFormValues } from "../address/components/address-form";
import { AxiosError } from "axios";

export default function Page() {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [getddressId, setAddressId] = React.useState("");
  const [editingAddress, setEditingAddress] = React.useState<{
    id: string;
    data: AddressFormValues;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["getProfile"],
    queryFn: async () => {
      return await getProfile().then((res) => res.data);
    },
  });

  const setUserData = useAuthStore((state) => state.setUserData);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProfile"] });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: (data, variables) => {
      const operationMessages = {
        add: "Address added successfully",
        update: "Address updated successfully",
        delete: "Address deleted successfully",
        setDefault: "Default address updated",
      };

      queryClient.invalidateQueries({ queryKey: ["getProfile"] });
      //@ts-ignore
      toast.success(operationMessages[variables.operation]);

      if (
        variables.operation === "delete" &&
        selectedId === variables.addressId
      ) {
        setSelectedId(null);
      }
    },
    onError(error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data.errors[0].msg || "Something went wrong!"
        );
      } else {
        toast.error("Something went wrong!");
      }
    },
  });

  useEffect(() => {
    if (data) {
      setProfile(data);
      setUserData(data);
    }
  }, [data]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdateSubmit = (formData: FormData) => {
    updateProfileMutation.mutate(formData);
  };

  const handleDelete = (addressId: string) => {
    setAddressId(addressId);
    if (!addressId) return;
    setShowDeleteDialog(true);
  };

  const handleSetDefault = (addressId: string) => {
    updateAddressMutation.mutate({
      operation: "setDefault",
      addressId,
    });
  };

  const confirmDelete = () => {
    if (!getddressId) return;

    updateAddressMutation.mutate({
      operation: "delete",
      addressId: getddressId,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="bg-white">
      <HeaderLanding logo={logo} />
      <div className="container mx-auto py-8 px-4">
        <>
          {isEditing ? (
            <ProfileUpdate
              profile={profile}
              onSubmit={handleUpdateSubmit}
              onCancel={handleCancel}
            />
          ) : (
            <ProfileDisplay profile={profile} onEditClick={handleEditClick} />
          )}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              <div className="md:col-span-2 space-y-4 mt-4">
                <AddAddress
                  onAdd={() => {
                    // Address is added via mutation in AddressForm
                  }}
                  editingAddress={editingAddress}
                  onEditComplete={() => setEditingAddress(null)}
                />

                {/* Address list */}
                <div className="space-y-4">
                  {profile &&
                    profile.address.length > 0 &&
                    profile.address.map((a) => (
                      <Card
                        key={a.id}
                        className={selectedId === a.id ? "border-primary" : ""}
                      >
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                          <Checkbox
                            checked={selectedId === a.id}
                            onCheckedChange={() => setSelectedId(a.id)}
                            aria-label={`Select address for ${a.firstName} ${a.lastName}`}
                          />
                          <CardTitle className="text-base">
                            {a.firstName} {a.lastName}
                            <span className="ml-2 text-muted-foreground">
                              ({a.tag})
                            </span>
                            {a.isDefault && (
                              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm leading-relaxed">
                          <p>
                            {a.flatBuildingCompany}
                            <br />
                            {a.streetArea}
                            {a.landmark ? (
                              <>
                                <br />
                                {a.landmark}
                              </>
                            ) : null}
                            <br />
                            {a.cityDistrict} - {a.pincode}
                            <br />
                            {a.state}, {a.country}
                            <br />
                            Mobile:{" "}
                            <span className="font-medium">
                              {a.phoneCountryCode} {a.phone}
                            </span>
                          </p>
                          <Separator className="my-4" />
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <button
                              className="hover:text-foreground"
                              onClick={() =>
                                setEditingAddress({ id: a.id, data: a })
                              }
                            >
                              Edit
                            </button>
                            <span className="h-4 w-px bg-border" aria-hidden />
                            <button
                              className="hover:text-foreground"
                              onClick={() => handleDelete(a.id)}
                              disabled={updateAddressMutation.isPending}
                            >
                              Delete
                            </button>
                            {!a.isDefault && (
                              <>
                                <span
                                  className="h-4 w-px bg-border"
                                  aria-hidden
                                />
                                <button
                                  className="hover:text-foreground"
                                  onClick={() => handleSetDefault(a.id)}
                                  disabled={updateAddressMutation.isPending}
                                >
                                  Set as Default
                                </button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      </div>
      <Footer />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
