export enum SUBSCRIPTION_STATUS {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
}

export interface Subscription {
  id: string;
  tenantId: string;
  planPriceId: string;
  status: SUBSCRIPTION_STATUS;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  endedAt?: string;
  cancelAtPeriodEnd: boolean;
  daysUntilDue: number;
  stripeSubscriptionId?: string;
  planPrice: {
    id: string;
    planName: string;
    currency: string;
    amount: number;
    features: {
      maxStaff: number;
      maxStores: number;
    };
  };
  createdById: string;
  createdBy: any;
}
