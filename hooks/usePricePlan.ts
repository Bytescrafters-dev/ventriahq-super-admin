import { BILLING_CYCLE, PricePlan } from "@/types/pricePlan";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UsePricePlansParams {
  planName?: string;
  billingCycle?: BILLING_CYCLE;
  currency?: string;
  isActive?: string;
}

export interface CreatePricePlanInput {
  planName: string;
  billingCycle: BILLING_CYCLE;
  currency: "LKR" | "AUD" | "USD";
  amount: number;
  features: any;
}

export interface UpdatePricePlanInput {
  isActive?: boolean;
  amount: number;
  features: any;
}

export const usePricePlans = ({
  planName,
  billingCycle,
  currency,
  isActive,
}: UsePricePlansParams = {}) => {
  return useQuery({
    queryKey: ["price-plans", { planName, billingCycle, currency, isActive }],
    queryFn: async (): Promise<PricePlan[]> => {
      const params = new URLSearchParams({});
      if (planName) params.append("planName", planName);
      if (billingCycle) params.append("billingCycle", billingCycle);
      if (currency) params.append("currency", currency);
      if (isActive) params.append("isActive", isActive ? "true" : "false");

      const response = await fetch(
        `/api/proxy/super-admin/plan-prices?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch price plans");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePricePlan = (planId: string) => {
  return useQuery({
    queryKey: ["price-plan", planId],
    queryFn: async (): Promise<PricePlan> => {
      const response = await fetch(
        `/api/proxy/super-admin/plan-prices/${planId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch price plan");
      }

      return response.json();
    },
    enabled: !!planId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePricePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePricePlanInput) => {
      const response = await fetch(`/api/proxy/super-admin/plan-prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create price plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["price-plans"],
      });
    },
  });
};

export const useUpdatePricePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePricePlanInput;
    }) => {
      const response = await fetch(`/api/proxy/super-admin/plan-prices/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update price plan");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["price-plans"],
      });
      queryClient.invalidateQueries({
        queryKey: ["price-plan"],
      });
    },
  });
};

export const useDeleteTenant = () => {};
