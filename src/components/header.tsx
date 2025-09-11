"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserRoles } from "@/lib/data-model/enum-types";
import { AdminRoute, AuthRoute, FuelReportRoute, FuelReportSummaryRoute } from "@/lib/routes";

export default function Header() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Fuel Report Management</h1>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </header>
    );
  }

  if (!session) {
    return (
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Fuel Report Management</h1>
            <Button asChild>
              <Link href={AuthRoute.signIn}>Sign In</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold">
              <Link href={FuelReportRoute.page} className="hover:text-blue-600">
                Fuel Report Management
              </Link>
            </h1>

            <nav className="flex items-center space-x-4">
              <Link
                href={FuelReportRoute.page}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Reports
              </Link>
              <Link
                href={FuelReportSummaryRoute.page}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Quarterly Summary
              </Link>
              {session.user.role === UserRoles.ADMIN && (
                <Link
                  href={AdminRoute.page}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{session.user.name}</span>
              {session.user.role === UserRoles.ADMIN && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Admin
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: AuthRoute.signIn })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
