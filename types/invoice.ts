export enum INVOICE_STATUS {
  PENDING = "PENDING",
  PAST_DUE = "PAST_DUE",
  PAID = "PAID",
  VOID = "VOID",
}

export enum INVOICE_PAYMENT_METHOD {
  MANUAL = "MANUAL",
  STRIPE = "STRIPE",
}

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  subscription: any;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: INVOICE_STATUS;
  dueDate: string;
  paidAt?: string;
  paidById?: string;
  paidBy?: any;
  paymentMethod: INVOICE_PAYMENT_METHOD;
  notes?: string;
  stripeInvoiceId?: string;
  createdAt: string;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    companyName: string;
    phone: string;
    email: string;
  };
}
