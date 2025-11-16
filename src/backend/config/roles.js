// src/backend/config/roles.js

export const Roles = {
  ADMIN: "admin",
  STAFF: "staff",
  USER: "user",
};

// Define what each role can do
export const RolePermissions = {
  [Roles.ADMIN]: {
    canManageOrders: true,
    canChangeOrderStatus: true,
    canCancelOrders: true,
    canViewAllUsers: true,
  },
  [Roles.STAFF]: {
    canManageOrders: true,
    canChangeOrderStatus: true,
    canCancelOrders: false, // staff may not cancel
    canViewAllUsers: false,
  },
  [Roles.USER]: {
    canManageOrders: false,
    canChangeOrderStatus: false,
    canCancelOrders: true, // only their own
    canViewAllUsers: false,
  },
};
