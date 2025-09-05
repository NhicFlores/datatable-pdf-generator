import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to access this resource.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild>
            <Link href="/fuel-report">Return to Fuel Reports</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/auth/signin">Sign In Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
