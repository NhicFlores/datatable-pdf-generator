import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/drizzle";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { UserRoles } from "@/lib/data-model/enum-types";
import { AuthRoute, HomeRoute } from "@/lib/routes";

// Extend the built-in session types
declare module "next-auth" {
  interface User {
    role: string;
    branch: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      branch: string;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: AuthRoute.signIn,
    // error: AuthRoute.error,
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email as string))
            .limit(1);

          if (!user[0]) {
            return null;
          }

          // Check if user is active
          if (!user[0].isActive) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user[0].hashedPassword
          );

          if (!isPasswordValid) {
            return null;
          }

          // Update last login
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, user[0].id));

          // Return user object for session
          return {
            id: user[0].id,
            email: user[0].email,
            name: user[0].name,
            role: user[0].role,
            branch: user[0].branch,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role and branch to JWT token
      if (user) {
        token.role = user.role;
        token.branch = user.branch;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add role, branch and id to session from token
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.branch = token.branch as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`);
    },
  },
});

// Helper function to get current user server-side
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

// Helper function to require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(AuthRoute.signIn);
  }
  return user;
}

// Helper function to require admin role
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(AuthRoute.signIn);
  }
  if (user.role !== UserRoles.ADMIN) {
    redirect(HomeRoute.page); // Redirect to main page for non-admin users
  }
  return user;
}
