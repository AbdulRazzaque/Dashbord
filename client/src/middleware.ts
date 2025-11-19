import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Roles, RolesEnum } from "./constants";

// Define roles for type safety
type RoleType =
  | RolesEnum.ADMIN
  | RolesEnum.SUPER_ADMIN
  | RolesEnum.USER
  | RolesEnum.VENDOR
  | RolesEnum.RETAILER;

// This function can be marked async if using await inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/";
  const isDashboardPath = path.startsWith("/dashboard");

  // Check if path is one of the protected user routes
  const isProtectedUserRoute =
    path.startsWith("/my-orders") ||
    path === "/profile" ||
    path === "/checkout";

  // Get token and role from cookies
  const token = request.cookies.get("accessToken")?.value || "";
  const role = (request.cookies.get("userRole")?.value as RoleType) || "";

  // Check if user is admin or super admin
  const hasAdminAccess =
    role === Roles.ADMIN || role === Roles.SUPER_ADMIN || role === Roles.VENDOR;

  // If on public path and logged in, redirect to appropriate page
  if (isPublicPath && token && hasAdminAccess) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add a small delay for any processing if needed
  await new Promise((resolve) => setTimeout(resolve, 300));

  // If trying to access dashboard without token, redirect to login
  if (!token && isDashboardPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If trying to access protected user routes without token, redirect to login
  if (!token && isProtectedUserRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user role is USER and trying to access dashboard, redirect to unauthorized page
  if (token && isDashboardPath && role === Roles.USER) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token && isDashboardPath && role === Roles.RETAILER) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Continue with the request for valid scenarios
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/",
    "/my-orders",
    "/my-orders/:path*",
    "/profile",
    "/payment",
    "/checkout",
  ],
};
