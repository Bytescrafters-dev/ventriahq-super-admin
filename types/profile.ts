export type User = {
  id: string;
  name: string;
  email: string;
  status: string;
};

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum SuperAdminRole {
  OWNER = "OWNER",
  PARTNER = "PARTNER",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  email: string;
  phone: string;
  avatar: string;
  role: SuperAdminRole;
};
