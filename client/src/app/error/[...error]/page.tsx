"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React from "react";

interface PageProps {
  params: {
    error: string;
  };
}
const ErrorPage = ({ params }: PageProps) => {
  const { error } = params;

  const router = useRouter();

  return (
    <>
      <Card className=" min-h-screen flex items-center">
        <div className="container mx-auto p-4 flex flex-wrap items-center">
          <div className="w-full  text-center  p-4">
            <div className="text-xl md:text-3xl font-medium mb-4">Oops!</div>
            <div className="text-lg mb-8">
              {error != undefined &&
                error.length > 0 &&
                decodeURIComponent(error[0])}
            </div>
            <Button
              onClick={() => router.push("/")}
              className="border border-white rounded p-2"
            >
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ErrorPage;
