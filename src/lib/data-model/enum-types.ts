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
// User Branches - Unified configuration with codes and display names
export const BRANCHES = {
  MHK: {
    code: "MHK" as const,
    displayName: "Manhattan" as const,
  },
  DEN: {
    code: "DEN" as const,
    displayName: "Denver" as const,
  },
  DSM: {
    code: "DSM" as const,
    displayName: "Des Moines" as const,
  },
} as const;

// Extract types
export type UserBranch = keyof typeof BRANCHES;
export type BranchCode = UserBranch; // Alias for backward compatibility

// Arrays for iteration
export const USER_BRANCHES = Object.keys(BRANCHES) as UserBranch[];
export const BRANCH_CODES = USER_BRANCHES; // Alias for backward compatibility

// Type guards for runtime validation
export const isUserBranch = (value: string): value is UserBranch => {
  return Object.keys(BRANCHES).includes(value as UserBranch);
};

export const isBranchCode = (value: string): value is BranchCode => {
  return isUserBranch(value);
};

// Helper functions
export const getBranchByCode = (code: UserBranch) => BRANCHES[code];

export const getUserBranchOptions = () => {
  return Object.entries(BRANCHES).map(([code, { displayName }]) => ({
    label: displayName,
    value: code,
  }));
};

export const getBranchCodeOptions = () => {
  return getUserBranchOptions(); // Same as above now
};

// Legacy enum objects for backward compatibility (DEPRECATED)
export const UserBranches = {
  MANHATTAN: "MHK",
  DENVER: "DEN", 
  DES_MOINES: "DSM",
} as const;

export const BranchCodes = {
  DENVER: "DEN",
  DES_MOINES: "DSM", 
  MANHATTAN: "MHK",
} as const;