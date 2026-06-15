export enum TENANT_PLAN {
  TRIAL = "TRIAL",
  BASIC = "BASIC",
  PLUS = "PLUS",
  ENTERPRISE = "ENTERPRISE",
}

export enum TENANT_STATUS {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  CANCELED = "CANCELED",
}

export const TENANT_STATUS_OPTIONS = [
  { label: "Pending", value: TENANT_STATUS.PENDING },
  { label: "Active", value: TENANT_STATUS.ACTIVE },
  { label: "Suspended", value: TENANT_STATUS.SUSPENDED },
  { label: "Canceled", value: TENANT_STATUS.CANCELED },
];

export const TENANT_PLAN_OPTIONS = [
  { label: "Trial", value: TENANT_PLAN.TRIAL },
  { label: "Basic", value: TENANT_PLAN.BASIC },
  { label: "Plus", value: TENANT_PLAN.PLUS },
  { label: "Enterprise", value: TENANT_PLAN.ENTERPRISE },
];

export interface Tenant {
  id: string;
  companyName: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email: string;
  currentPlanName?: string;
  status: TENANT_STATUS;
  trialEndsAt?: string;
  notes?: string;
  createdById: string;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}
