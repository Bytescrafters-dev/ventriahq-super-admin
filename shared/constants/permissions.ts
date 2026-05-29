export const PlatformPermission = {
  admins: {
    viewAdmins: "platform.admins.read",
    inviteAdmins: "platform.admins.invite",
    editAdmins: "platform.admins.update",
    deleteAdmins: "platform.admins.delete",
  },
  userRoles: {
    viewUserRoles: "platform.user_roles.read",
    createUserRoles: "platform.user_roles.create",
    editUserRoles: "platform.user_roles.update",
    updatePermissionsUserRoles: "platform.user_roles.update_permissions",
    deleteUserRoles: "platform.user_roles.delete",
  },
  tenants: {
    viewTenants: "platform.tenants.read",
    inviteTenants: "platform.tenants.invite",
    editTenants: "platform.tenants.update",
    editDiscountsTenants: "platform.tenants.updateDiscounts",
    deleteTenants: "platform.tenants.delete",
  },
  billing: {
    viewBillings: "platform.billing.view",
    actionBillings: "platform.billing.action",
  },
  reports: {
    viewReports: "platform.reports.view",
    actionReports: "platform.reports.action",
  },
};
