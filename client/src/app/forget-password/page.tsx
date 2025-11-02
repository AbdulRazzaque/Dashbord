"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  KeyRound,
  Check,
  Lock,
  Loader,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import bg from "@/public/images/auth/bg-2.jpg";
import logo from "@/public/logo.png";

const Page = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current one is filled
    if (value && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep(2);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep(3);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast.success("Password has been updated successfully.");
    router.push("/login");
  };

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div
          className="h-full w-full absolute inset-0 bg-no-repeat bg-center bg-cover hidden lg:block"
          style={{ backgroundImage: `url(${bg.src})` }}
        />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="inline-block">
            <Image
              src={logo}
              alt="logo"
              width={100}
              height={100}
              className="w-28"
            />
          </Link>
          Alnawayath
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              This platform has transformed how we handle our authentication
              process. The step-by-step password reset flow is intuitive and
              secure.
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className={cn("w-[350px]")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                {step > 1 && (
                  <Button
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                <div className="flex-1 text-center">
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          step >= i ? "bg-primary" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
                {step > 1 && <div className="w-14" />}
              </div>
              <CardTitle className="text-2xl text-center">
                Reset Password
              </CardTitle>
              <CardDescription className="text-center">
                {step === 1 &&
                  "Enter your email to receive a verification code"}
                {step === 2 && "Enter the verification code sent to your email"}
                {step === 3 && "Create a new password for your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <form onSubmit={handleEmailSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          placeholder="name@example.com"
                          type="email"
                          autoCapitalize="none"
                          autoComplete="email"
                          autoCorrect="off"
                          disabled={isLoading}
                          className="pl-9"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button disabled={isLoading}>
                      {isLoading && (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Send Reset Link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleOtpSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Verification Code</Label>
                      <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                          <Input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={1}
                            className="w-12 h-12 text-center text-lg"
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            ref={(input) => {
                              if (input) {
                                otpInputs.current[index] = input;
                              }
                            }}
                            disabled={isLoading}
                            required
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        Didn&apos;t receive the code?{" "}
                        <Button
                          variant="outline"
                          className="p-0 h-auto font-normal"
                          disabled={isLoading}
                        >
                          Resend
                        </Button>
                      </p>
                    </div>
                    <Button disabled={isLoading || otp.some((digit) => !digit)}>
                      {isLoading && (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Verify Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          disabled={isLoading}
                          className="pl-9"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          disabled={isLoading}
                          className="pl-9"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button
                      disabled={
                        isLoading ||
                        !password ||
                        !confirmPassword ||
                        password !== confirmPassword
                      }
                    >
                      {isLoading && (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Reset Password
                      <Check className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;
