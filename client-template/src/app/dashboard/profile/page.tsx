"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile } from "@/lib/http/api";
import { UserData } from "@/types";
import { toast } from "react-hot-toast";
import { ProfileUpdate } from "@/components/user/profile-update";
import { ProfileDisplay } from "@/components/user/profile-display";

export default function Page() {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["getProfile"],
    queryFn: async () => {
      return await getProfile().then((res) => res.data);
    },
  });

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

  useEffect(() => {
    if (data) {
      setProfile(data);
    }
  }, [data]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleUpdateSubmit = (formData: FormData) => {
    updateProfileMutation.mutate(formData);
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
    <div className="container mx-auto py-8 px-4">
      {isEditing ? (
        <ProfileUpdate
          profile={profile}
          onSubmit={handleUpdateSubmit}
          onCancel={handleCancel}
        />
      ) : (
        <ProfileDisplay profile={profile} onEditClick={handleEditClick} />
      )}
    </div>
  );
}
