"use server";

import { Roles } from "@/constants";
import * as cookie from "cookie";
import { cookies } from "next/headers";

export default async function registerAPI(state: any, formdata: FormData) {
  const email = formdata.get("email");
  const password = formdata.get("password");
  const firstName = formdata.get("firstName");
  const lastName = formdata.get("lastName");
  const mobileNo = formdata.get("mobileNo");
  const role = formdata.get("role");
  const address = formdata.get("address");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          mobileNo,
          role,
          address,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        type: "error",
        message: error.errors[0].msg,
      };
    }

    const responseData = await response.json();

    const roleCheck = responseData.role;

    const allowedRoles = [
      Roles.ADMIN,
      Roles.SUPER_ADMIN,
      Roles.VENDOR,
      Roles.USER,
      Roles.RETAILER,
    ];

    if (!allowedRoles.includes(roleCheck)) {
      return {
        type: "error",
        message: "You do not have access!",
      };
    }

    const c = response.headers.getSetCookie();
    const accessToken = c.find((cookie) => cookie.includes("accessToken"));
    const refreshToken = c.find((cookie) => cookie.includes("refreshToken"));

    if (!accessToken || !refreshToken) {
      return {
        type: "error",
        message: "No cookies were found!",
      };
    }

    const parsedAccessToken = cookie.parse(accessToken);
    const parsedRefreshToken = cookie.parse(refreshToken);

    cookies().set({
      name: "accessToken",
      value: parsedAccessToken.accessToken as string,
      // expires: new Date(parsedAccessToken.expires!),
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 hour
      httpOnly: (parsedAccessToken.httpOnly as unknown as boolean) || true,
      path: parsedAccessToken.Path,
      domain: parsedAccessToken.Domain,
      sameSite: parsedAccessToken.SameSite as "lax",
    });

    cookies().set({
      name: "refreshToken",
      value: parsedRefreshToken.refreshToken as string,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 hour
      // expires: new Date(parsedRefreshToken.expires!),
      httpOnly: (parsedRefreshToken.httpOnly as unknown as boolean) || true,
      path: parsedRefreshToken.Path,
      domain: parsedRefreshToken.Domain,
      sameSite: parsedRefreshToken.SameSite as "lax",
    });

    if (role == Roles.USER || role == Roles.RETAILER) {
      cookies().set({
        name: "userRole",
        value: role as string,
        expires: new Date(parsedRefreshToken.expires!),
        httpOnly: (parsedRefreshToken.httpOnly as unknown as boolean) || true,
        path: parsedRefreshToken.Path,
        domain: parsedRefreshToken.Domain,
        sameSite: parsedRefreshToken.SameSite as "lax",
      });
    }

    return {
      type: "success",
      message: "Login successful!",
      role: role,
    };
  } catch (err: any) {
    return {
      type: "error",
      message: err.message,
    };
  }
}
