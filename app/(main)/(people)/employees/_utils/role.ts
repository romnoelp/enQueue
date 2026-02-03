
import type { UserRole } from "@/types/auth";


export const SELECTABLE_ROLES: UserRole[] = [
  "superAdmin",
  "admin",
  "cashier",
  "information",
  "pending"
];

export const ROLE_LABELS: Record<UserRole, string> = {
  superAdmin: "Super Admin",
  admin: "Admin",
  cashier: "Cashier",
  information: "Information",
  pending: "Pending",
};

export const getRoleLabel = (role: UserRole): string => ROLE_LABELS[role] ?? role;
