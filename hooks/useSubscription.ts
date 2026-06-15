import { BILLING_CYCLE, PricePlan } from "@/types/pricePlan";
import { Subscription } from "@/types/subscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// interface UsePricePlansParams {
//   planName?: string;
//   billingCycle?: BILLING_CYCLE;
//   currency?: string;
//   isActive?: string;
// }

// export interface CreatePricePlanInput {
//   planName: string;
//   billingCycle: BILLING_CYCLE;
//   currency: "LKR" | "AUD" | "USD";
//   amount: number;
//   features: any;
// }

export interface UpdateSubscriptionInput {
  daysUntilDue?: number;
  cancelAtPeriodEnd?: boolean;
}

// export const usePricePlans = ({
//   planName,
//   billingCycle,
//   currency,
//   isActive,
// }: UsePricePlansParams = {}) => {
//   return useQuery({
//     queryKey: ["price-plans", { planName, billingCycle, currency, isActive }],
//     queryFn: async (): Promise<PricePlan[]> => {
//       const params = new URLSearchParams({});
//       if (planName) params.append("planName", planName);
//       if (billingCycle) params.append("billingCycle", billingCycle);
//       if (currency) params.append("currency", currency);
//       if (isActive) params.append("isActive", isActive ? "true" : "false");

//       const response = await fetch(
//         `/api/proxy/super-admin/plan-prices?${params.toString()}`,
//       );

//       if (!response.ok) {
//         throw new Error("Failed to fetch price plans");
//       }

//       return response.json();
//     },
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// };

export const useCurrentSubscription = (tenantId: string) => {
  return useQuery({
    queryKey: ["tenant-subscription", tenantId],
    queryFn: async (): Promise<Subscription> => {
      const response = await fetch(
        `/api/proxy/super-admin/tenants/${tenantId}/subscriptions/current`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch price plan");
      }

      return response.json();
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenantId: string) => {
      const response = await fetch(
        `/api/proxy/super-admin/tenants/${tenantId}/subscriptions/activate`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to activate subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenant-subscription"],
      });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSubscriptionInput;
    }) => {
      const response = await fetch(
        `/api/proxy/super-admin/tenants/${id}/subscriptions/current/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to activate subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenant-subscription"],
      });
    },
  });
};
