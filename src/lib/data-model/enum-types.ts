// User Roles with object-based enum pattern
export const UserRoles = {
  // SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  // MANAGER: "MANAGER",
  USER: "USER",
} as const;

// User Branches with object-based enum pattern
export const UserBranches = {
  DENVER: "DENVER",
  DES_MOINES: "DES_MOINES",
  MANHATTAN: "MANHATTAN",
} as const;

// Extract types from the objects
export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
export type UserBranch = (typeof UserBranches)[keyof typeof UserBranches];

// Arrays for iteration (backwards compatibility)
export const USER_ROLES = Object.values(UserRoles);
export const USER_BRANCHES = Object.values(UserBranches);

// Type guards for runtime validation
export const isUserRole = (value: string): value is UserRole => {
  return Object.values(UserRoles).includes(value as UserRole);
};

export const isUserBranch = (value: string): value is UserBranch => {
  return Object.values(UserBranches).includes(value as UserBranch);
};

// Helper functions for UI display
export const getUserRoleOptions = () => {
  return Object.entries(UserRoles).map(([key, value]) => ({
    label: key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
  }));
};

export const getUserBranchOptions = () => {
  return Object.entries(UserBranches).map(([key, value]) => ({
    label: key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
  }));
};
