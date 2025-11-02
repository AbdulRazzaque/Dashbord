"use server";

import { cookies } from "next/headers";

export const logoutAction = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/logout`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cookies().get("accessToken")?.value}`,
        cookie: `refreshToken=${cookies().get("refreshToken")?.value}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    return {
      type: "error",
      message: error.errors[0].msg,
    };
  }

  // Delete cookies with more specific options
  cookies().delete({
    name: "accessToken",
    domain: process.env.MAIN_DOMAIN,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookies().delete({
    name: "refreshToken",
    domain: process.env.MAIN_DOMAIN,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookies().delete({
    name: "userRole",
    domain: process.env.MAIN_DOMAIN,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return {
    type: "success",
    message: "Successfully Logged Out",
  };
};
