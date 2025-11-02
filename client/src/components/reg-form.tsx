"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import toast from "react-hot-toast";
import { Roles } from "@/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormState } from "react-dom";
import registerAPI from "@/lib/actions/regitser";
import { useAuthStore } from "@/store";
import logo from "@/public/logo.png";
import { Checkbox } from "./ui/checkbox";

const schema = z.object({
  firstName: z.string().min(2, {
    message: "firstName must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "lastName must be at least 2 characters.",
  }),
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
  mobileNo: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  role: z.string().min(1, { message: "Please select a role" }),
});

const RegForm = () => {
  const [passwordType, setPasswordType] = useState<string>("password");
  const [isPending, startTransition] = useTransition();
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const [selectedRole, setSelectedRole] = useState<string>(Roles.USER);
  const [address, setAddress] = useState({
    formatted_address: "",
    lat: 0,
    lng: 0,
  });

  // Track if we've already handled the current state to prevent multiple executions
  const handledStateRef = useRef<string>("");

  const setUser = useAuthStore((state) => state.setUser);

  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };

  const router = useRouter();
  const {
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: 0,
      password: "",
      role: Roles.USER as string,
    },
  });

  const initialState = {
    type: "",
    message: "",
  };

  const [state, formAction] = useFormState(registerAPI, initialState);

  // Handle success state
  useEffect(() => {
    if (
      state.type === "success" &&
      state.message &&
      handledStateRef.current !== `success-${state.message}`
    ) {
      handledStateRef.current = `success-${state.message}`;

      setUser({
        role: selectedRole,
      });
      reset();
      toast.success("Your account has been created successfully.");

      if (selectedRole === Roles.USER) {
        router.push("/");
      } else if (selectedRole === Roles.RETAILER) {
        router.push("/retailer-verification");
      }
    }
  }, [state.type, state.message, selectedRole, setUser, reset, router]);

  // Handle error state
  useEffect(() => {
    if (
      state.type === "error" &&
      state.message &&
      handledStateRef.current !== `error-${state.message}`
    ) {
      handledStateRef.current = `error-${state.message}`;
      toast.error(state.message);
    }
  }, [state.type, state.message]);

  const handleSubmit = (formData: FormData) => {
    handledStateRef.current = "";
    formData.set("role", selectedRole);
    formData.set("address", JSON.stringify(address));
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="w-full">
      <Link href="/" className="inline-block">
        <Image
          src={logo || "/placeholder.svg"}
          alt="logo"
          width={100}
          height={100}
          className="w-28"
        />
      </Link>

      <form action={handleSubmit} className="mt-5 xl:mt-7">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-default-600 mb-3">
                First Name
              </Label>
              <Input
                disabled={isPending}
                id="firstName"
                type="text"
                name="firstName"
                required
                size={!isDesktop2xl ? "xl" : "lg"}
                className={cn(" ", {
                  "border-destructive": errors.firstName,
                })}
              />
              {errors.firstName && (
                <div className="text-destructive mt-2">
                  {errors.firstName.message as string}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="lastName" className="text-default-600 mb-3">
                Last Name
              </Label>
              <Input
                disabled={isPending}
                id="lastName"
                type="text"
                name="lastName"
                required
                size={!isDesktop2xl ? "xl" : "lg"}
                className={cn(" ", {
                  "border-destructive": errors.lastName,
                })}
              />
              {errors.lastName && (
                <div className="text-destructive mt-2">
                  {errors.lastName.message as string}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="mobileNo" className="text-default-600 mb-3">
              Mobile Number
            </Label>
            <Input
              disabled={isPending}
              id="mobileNo"
              name="mobileNo"
              required
              type="tel"
              size={!isDesktop2xl ? "xl" : "lg"}
              className={cn(" ", {
                "border-destructive": errors.mobileNo,
              })}
            />
            {errors.mobileNo && (
              <div className="text-destructive mt-2">
                {errors.mobileNo.message as string}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-default-600 mb-3">
              Email
            </Label>
            <Input
              disabled={isPending}
              id="email"
              type="email"
              size={!isDesktop2xl ? "xl" : "lg"}
              name="email"
              required
              className={cn(" ", {
                "border-destructive": errors.email,
              })}
            />
            {errors.email && (
              <div className="text-destructive mt-2">
                {errors.email.message as string}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="role" className="text-default-600 mb-3">
              Register as
            </Label>
            <Select
              disabled={isPending}
              defaultValue={Roles.USER}
              onValueChange={(value) => {
                setSelectedRole(value);
                setValue("role", value);
              }}
            >
              <SelectTrigger
                className={cn("w-full", {
                  "border-destructive": errors.role,
                })}
              >
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Roles.USER}>User</SelectItem>
                <SelectItem value={Roles.RETAILER}>Retailer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <div className="text-destructive mt-2">
                {errors.role.message as string}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-default-600 mb-3">
              Password
            </Label>
            <div className="relative">
              <Input
                disabled={isPending}
                id="password"
                type={passwordType}
                size={!isDesktop2xl ? "xl" : "lg"}
                name="password"
                required
                className={cn(" ", {
                  "border-destructive": errors.password,
                })}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 right-4 cursor-pointer"
                onClick={togglePasswordType}
              >
                {passwordType === "password" ? (
                  <Icon
                    icon="heroicons:eye"
                    className="w-5 h-5 text-default-400"
                  />
                ) : (
                  <Icon
                    icon="heroicons:eye-slash"
                    className="w-5 h-5 text-default-400"
                  />
                )}
              </div>
            </div>
            {errors.password && (
              <div className=" text-destructive mt-2">
                {errors.password.message as string}
              </div>
            )}
          </div>
        </div>

        <div className="flex  items-center gap-1.5 mt-5 mb-6 ">
          <Checkbox
            size="sm"
            className="border-default-300 mt-[1px]"
            id="terms"
            defaultChecked={true}
          />
          <Label
            htmlFor="terms"
            className="text-sm text-default-600 cursor-pointer whitespace-nowrap"
          >
            By continunig, I agree to the{" "}
            <Link
              target="_blank"
              href="/terms-conditions"
              className="text-[#BD844C]"
            >
              Terms & Conditions
            </Link>{" "}
            &{" "}
            <Link
              target="_blank"
              href="/privacy-policy"
              className="text-[#BD844C]"
            >
              Privacy Policy.
            </Link>
          </Label>
        </div>

        <Button
          className="mt-5 bg-[#BD844C] hover:bg-[#9e6f3f] text-white border-[#BD844C] hover:border-[#BD844C] w-full"
          disabled={isPending}
          size="lg"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Registering..." : "Create an Account"}
        </Button>
      </form>

      <div className="mt-5 2xl:mt-8 text-center text-base text-default-600">
        Already Registered?{" "}
        <Link href="/login" className="text-primary">
          {" "}
          Sign In{" "}
        </Link>
      </div>
    </div>
  );
};

export default RegForm;
