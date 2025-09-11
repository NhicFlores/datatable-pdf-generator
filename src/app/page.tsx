import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthRoute, FuelReportRoute } from "@/lib/routes";

export default async function Home() {
  // Check if user is already authenticated
  const session = await auth();

  if (session?.user) {
    // Redirect authenticated users to fuel reports
    redirect(FuelReportRoute.page);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Fuel Report Management
            </h1>
            <p className="text-xl text-gray-600">
              Streamline your IFTA reporting with automated fuel transaction
              matching
            </p>
          </div>

          {/* Temporary User Creation Form */}
          {/* <CreateUserForm /> */}

          {/* Call to Action */}
          <div className="pt-8">
            <Button asChild size="lg">
              <Link href={AuthRoute.signIn}>Sign In to Get Started</Link>
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Contact your administrator for account access
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
