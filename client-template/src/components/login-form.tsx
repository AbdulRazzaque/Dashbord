"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/public/logo.png";
import { useFormState } from "react-dom";
import login from "@/lib/actions/login";
import { useAuthStore } from "@/store";
import { Roles } from "@/constants";

const LoginForm = () => {
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");
  const setUser = useAuthStore((state) => state.setUser);

  const router = useRouter();

  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };

  const initialState = {
    type: "",
    message: "",
  };

  const [state, formAction] = useFormState(login, initialState);

  // Handle post-login redirect and store update as a side effect
  useEffect(() => {
    if (state.type === "success") {
      setUser({ role: state.role });
      if (state.role === Roles.USER) {
        router.push("/");
      } else {
        router.push("/dashboard");
      }
    }
  }, [state.type, state.role, router, setUser]);




  return (
    <div className="w-full py-10">
      <Link href="/" className="inline-block">
        <Image
          src={logo}
          alt="logo"
          width={100}
          height={100}
          className="w-28"
        />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Hey, Hello 👋
      </div>
      <div className="2xl:text-lg text-base text-default-600 mt-2 leading-6">
        Enter the login information.
      </div>
      <form action={formAction} className="mt-5 2xl:mt-7">
        <div>
          <Label htmlFor="email" className="mb-2 font-medium text-default-600">
            Email
          </Label>
          <Input
            disabled={isPending}
            id="email"
            type="email"
            name="email"
            className={cn("", {
              "border-destructive": state.type === "error",
            })}
            size={!isDesktop2xl ? "xl" : "lg"}
            required
          />
        </div>
        {state.type === "error" && (
          <div className=" text-destructive mt-2">{state.message}</div>
        )}

        <div className="mt-3.5">
          <Label
            htmlFor="password"
            className="mb-2 font-medium text-default-600"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              disabled={isPending}
              id="password"
              name="password"
              type={passwordType}
              className="peer "
              size={!isDesktop2xl ? "xl" : "lg"}
              placeholder="Password@123"
              required
            />

            <div
              className="absolute top-1/2 -translate-y-1/2 right-4  cursor-pointer"
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
        </div>

        <div className="mt-5  mb-8 flex flex-wrap gap-2">
          <div className="flex-1 flex  items-center gap-1.5 ">
            <Checkbox
              size="sm"
              className="border-default-300 mt-[1px]"
              id="isRemebered"
              name="isRemebered"
              value="true"
            />
            <Label
              htmlFor="isRemebered"
              className="text-sm text-default-600 cursor-pointer whitespace-nowrap"
            >
              Remember me
            </Label>
          </div>

        </div>
        <Button
          className="bg-[#BD844C] hover:bg-[#9e6f3f] text-white border-[#BD844C] hover:border-[#BD844C] w-full"
          disabled={isPending}
          size={!isDesktop2xl ? "lg" : "md"}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? "Loading..." : "Sign In"}
        </Button>
     

        {/* <div className="mt-5 2xl:mt-8 text-center text-base text-default-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary">
            {" "}
            Sign Up{" "}
          </Link>
        </div> */}
      </form>
    </div>
  );
};

export default LoginForm;
