import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/lib/image-upload";
import { Label } from "@/components/ui/label";
import { UserData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().optional(),
  image: z.any(),
  // .refine((files) => files?.[0], {
  //   message: "Image is required.",
  // })
  // .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, {
  //   message: "Image must be smaller than 500KB.",
  // })
  // .refine(
  //   (files) =>
  //     ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
  //   {
  //     message: "Only JPG, PNG, or WEBP formats are allowed.",
  //   }
  // ),
});

interface ProfileUpdateProps {
  profile: UserData;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

export function ProfileUpdate({
  profile,
  onSubmit,
  onCancel,
}: ProfileUpdateProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      mobileNo: profile.mobileNo?.toString() || "",
      image: profile.avatar || undefined,
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append("file", value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={value}
                      onChange={onChange}
                      className="max-w-[400px] mx-auto"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobileNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                className={cn(
                  "bg-black border-black text-white hover:bg-black hover:border-black"
                )}
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#BD844C] hover:bg-[#9e6f3f] text-white border-[#BD844C] hover:border-[#BD844C]"
                type="submit"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
