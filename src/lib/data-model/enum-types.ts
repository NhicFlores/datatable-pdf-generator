// User Roles with object-based enum pattern
export const UserRoles = {
  // SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  // MANAGER: "MANAGER",
  USER: "USER",
} as const;

// Extract types from the objects
export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

// Arrays for iteration (backwards compatibility)
export const USER_ROLES = Object.values(UserRoles);

// Type guards for runtime validation
export const isUserRole = (value: string): value is UserRole => {
  return Object.values(UserRoles).includes(value as UserRole);
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
// User Branches with object-based enum pattern
export const UserBranches = {
  DENVER: "DENVER",
  DES_MOINES: "DES_MOINES",
  MANHATTAN: "MANHATTAN",
} as const;

export type UserBranch = (typeof UserBranches)[keyof typeof UserBranches];

export const USER_BRANCHES = Object.values(UserBranches);

export const isUserBranch = (value: string): value is UserBranch => {
  return Object.values(UserBranches).includes(value as UserBranch);
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

export const BranchCodes = {
  DENVER: "DEN",
  DES_MOINES: "DSM",
  MANHATTAN: "MHK",
} as const;

export type BranchCode = (typeof BranchCodes)[keyof typeof BranchCodes];

export const BRANCH_CODES = Object.values(BranchCodes);

export const isBranchCode = (value: string): value is BranchCode => {
  return Object.values(BranchCodes).includes(value as BranchCode);
}

export const getBranchCodeOptions = () => {
  return Object.entries(BranchCodes).map(([key, value]) => ({
    label: key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value,
  }));
};