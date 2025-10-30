import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  UserCircle,
  ClockIcon,
  TagIcon,
  PencilIcon,
} from "lucide-react";
import { UserData } from "@/types";

interface ProfileDisplayProps {
  profile: UserData;
  onEditClick: () => void;
}

export function ProfileDisplay({ profile, onEditClick }: ProfileDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar} />
              <AvatarFallback>
                {profile.firstName[0]}
                {profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <Button
            className="bg-[#BD844C] hover:bg-[#9e6f3f] text-white border-[#BD844C] hover:border-[#BD844C]"
            variant="outline"
            onClick={onEditClick}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Personal Information</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Role:</span>
                <span className="ml-2 text-muted-foreground">
                  {profile.role}
                </span>
              </div>
              <div className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Mobile:</span>
                <span className="ml-2 text-muted-foreground">
                  {profile.mobileNo || "Not provided"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Account Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <TagIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Verification:</span>
                <Badge variant="outline" className="ml-2">
                  {profile.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div className="flex items-center">
                <TagIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status:</span>
                <Badge variant="outline" className="ml-2">
                  {profile.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Timestamps</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Created:</span>
                <span className="ml-2 text-muted-foreground">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last updated:</span>
                <span className="ml-2 text-muted-foreground">
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
