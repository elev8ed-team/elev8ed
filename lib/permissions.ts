// ==============================================================================
// ELEV8ED ROLE-BASED ACCESS CONTROL (RBAC) ENGINE
// ==============================================================================

import { UserRole } from "./types"

export type AppPermission =
  | "committee:edit"
  | "committee:delete"
  | "member:invite"
  | "member:remove"
  | "member:change_role"
  | "department:create"
  | "department:edit"
  | "department:delete"
  | "task:create"
  | "task:assign"
  | "task:update_any"
  | "task:delete"
  | "event:create"
  | "event:edit"
  | "event:delete"
  | "announcement:create"
  | "announcement:delete"
  | "analytics:view"

const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
  owner: [
    "committee:edit",
    "committee:delete",
    "member:invite",
    "member:remove",
    "member:change_role",
    "department:create",
    "department:edit",
    "department:delete",
    "task:create",
    "task:assign",
    "task:update_any",
    "task:delete",
    "event:create",
    "event:edit",
    "event:delete",
    "announcement:create",
    "announcement:delete",
    "analytics:view",
  ],
  admin: [
    "committee:edit",
    "member:invite",
    "member:remove",
    "department:create",
    "department:edit",
    "task:create",
    "task:assign",
    "task:update_any",
    "task:delete",
    "event:create",
    "event:edit",
    "announcement:create",
    "announcement:delete",
    "analytics:view",
  ],
  head: [
    "member:invite",
    "task:create",
    "task:assign",
    "event:create",
    "announcement:create",
    "analytics:view",
  ],
  member: [
    "task:create",
  ],
}

/**
 * Checks if a given role possesses a specific permission.
 */
export function hasPermission(role: UserRole | undefined, permission: AppPermission): boolean {
  if (!role) return false
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission)
}

/**
 * Returns a human-friendly label for a role.
 */
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "owner":
      return "President / Owner"
    case "admin":
      return "Committee Admin"
    case "head":
      return "Department Head"
    case "member":
      return "Committee Member"
  }
}

/**
 * Returns a styling badge class for a role.
 */
export function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case "owner":
      return "bg-lime-400/10 text-lime-400 border border-lime-400/30"
    case "admin":
      return "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
    case "head":
      return "bg-fuchsia-400/10 text-fuchsia-400 border border-fuchsia-400/30"
    case "member":
      return "bg-neutral-800 text-neutral-300 border border-neutral-700"
  }
}
