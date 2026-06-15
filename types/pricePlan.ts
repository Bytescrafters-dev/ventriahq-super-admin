export enum BILLING_CYCLE {
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  SEMI_ANNUAL = "SEMI_ANNUAL",
  ANNUAL = "ANNUAL",
}

export const BILLING_CYCLE_OPTIONS = [
  { label: "Monthly", value: BILLING_CYCLE.MONTHLY },
  { label: "Quaterly", value: BILLING_CYCLE.QUARTERLY },
  { label: "Semi Annual", value: BILLING_CYCLE.SEMI_ANNUAL },
  { label: "Annual", value: BILLING_CYCLE.ANNUAL },
];

export interface PricePlan {
  id: string;
  planName: string;
  billingCycle: BILLING_CYCLE;
  currency: string;
  amount: number;
  features: JSON;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const BILLING_CYCLE_VALUES = Object.values(BILLING_CYCLE) as [
  BILLING_CYCLE,
  ...BILLING_CYCLE[],
];
