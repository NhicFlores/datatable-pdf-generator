import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateUserForm } from "@/components/create-user-form";

export default async function Home() {
  // Check if user is already authenticated
  const session = await auth();

  if (session?.user) {
    // Redirect authenticated users to fuel reports
    redirect("/fuel-report");
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

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-2 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Automatically match fuel receipts with expense transactions
                using intelligent algorithms
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">Easy Reporting</h3>
              <p className="text-gray-600">
                Generate comprehensive fuel reports organized by driver, state,
                and time period
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">CSV Import/Export</h3>
              <p className="text-gray-600">
                Seamlessly import data and export reports in standard CSV format
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-2">Audit Ready</h3>
              <p className="text-gray-600">
                Maintain detailed records with full audit trails for compliance
                requirements
              </p>
            </div>
          </div>

          {/* Temporary User Creation Form */}
          <CreateUserForm />

          {/* Call to Action */}
          <div className="pt-8">
            <Button asChild size="lg">
              <Link href="/auth/signin">Sign In to Get Started</Link>
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
