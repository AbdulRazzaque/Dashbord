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

  // Delete cookies. Omit domain for localhost so host-only cookies are cleared.
  const cookieOpts: { name: string; path: string; domain?: string; secure?: boolean; sameSite: "lax" } = {
    name: "",
    path: "/",
    sameSite: "lax",
  };
  if (process.env.NODE_ENV === "production" && process.env.MAIN_DOMAIN && process.env.MAIN_DOMAIN !== "localhost") {
    cookieOpts.domain = process.env.MAIN_DOMAIN;
    cookieOpts.secure = true;
  }

  cookies().delete({ ...cookieOpts, name: "accessToken" });
  cookies().delete({ ...cookieOpts, name: "refreshToken" });
  cookies().delete({ ...cookieOpts, name: "userRole" });

  return {
    type: "success",
    message: "Successfully Logged Out",
  };
};
