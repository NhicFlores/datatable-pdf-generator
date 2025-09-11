import {
  type UserRole,
  type UserBranch,
  UserRoles,
  USER_BRANCHES,
} from "@/lib/data-model/enum-types";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branch: UserBranch;
}

/**
 * Check if user can access data from a specific branch
 * Admins can access all branches, users can only access their own branch
 */
export function canAccessBranch(user: User, targetBranch: UserBranch): boolean {
  return user.role === UserRoles.ADMIN || user.branch === targetBranch;
}

/**
 * Check if user can manage other users (create, update, delete)
 * Only admins can manage users
 */
export function canManageUsers(user: User): boolean {
  return user.role === UserRoles.ADMIN;
}

/**
 * Check if user can manage system settings (quarters, etc.)
 * Only admins can manage system settings
 */
export function canManageSettings(user: User): boolean {
  return user.role === UserRoles.ADMIN;
}

/**
 * Get list of branches the user can access
 * Admins can access all branches, users can only access their own
 */
export function getUserAccessibleBranches(user: User): UserBranch[] {
  return user.role === UserRoles.ADMIN ? [...USER_BRANCHES] : [user.branch];
}

/**
 * Check if user can view cross-branch reports
 * Only admins can view data across multiple branches
 */
export function canViewCrossBranchReports(user: User): boolean {
  return user.role === UserRoles.ADMIN;
}

/**
 * Check if user can edit data from a specific branch
 * Admins can edit all branches, users can only edit their own branch
 */
export function canEditBranchData(
  user: User,
  targetBranch: UserBranch
): boolean {
  return user.role === UserRoles.ADMIN || user.branch === targetBranch;
}

// /**
//  * Check if user is a super admin (can access everything)
//  * Currently same as admin, but separated for future role expansion
//  */
// export function isSuperAdmin(user: User): boolean {
//   return user.role === UserRoles.SUPER_ADMIN;
// }

/**
 * Get user's display name for branch
 * Converts "DES MOINES" to "Des Moines"
 */
export function getBranchDisplayName(branch: UserBranch): string {
  return branch
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get user's display name for role
 * Converts "ADMIN" to "Admin"
 */
export function getRoleDisplayName(role: UserRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}
