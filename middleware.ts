import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { UserRoles } from "@/lib/data-model/enum-types";
import {
  AdminRoute,
  AuthRoute,
  FuelReportRoute,
  HomeRoute,
} from "@/lib/routes";

// Define protected routes
const protectedRoutes = [
  FuelReportRoute.page,
  "/api/fuel-transactions",
  "/api/transactions",
];

const adminOnlyRoutes = [AdminRoute.page];

export default auth((req: NextRequest & { auth: Session | null }) => {
  const { pathname } = req.nextUrl;

  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAdminRoute = adminOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute || isAdminRoute) {
    // Redirect to signin if not authenticated
    if (!req.auth?.user) {
      const signInUrl = new URL(AuthRoute.signIn, req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check admin access for admin routes
    if (isAdminRoute && req.auth.user.role !== UserRoles.ADMIN) {
      return NextResponse.redirect(new URL(HomeRoute.page, req.url)); // Redirect to main page
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
