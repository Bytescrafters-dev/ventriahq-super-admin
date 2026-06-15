import { Tenant } from "@/types/tenant";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseTenantsParams {
  page?: number;
  limit?: number;
  status?: string;
  plan?: string;
  q?: string;
}

interface TenantsResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTenantInput {
  email: string;
  companyName?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  planPriceId: string;
  status: string;
  trialEndsAt?: string;
  notes?: string;
}

export interface UpdateTenantInput {
  companyName?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
  trialEndsAt?: string;
  notes?: string;
}

export const useTenants = ({
  page = 1,
  limit = 10,
  status,
  plan,
  q,
}: UseTenantsParams = {}) => {
  return useQuery({
    queryKey: ["tenants", page, limit, status, plan, q],
    queryFn: async (): Promise<TenantsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) params.append("status", status);
      if (q) params.append("q", q);
      if (plan) params.append("plan", plan);

      const response = await fetch(
        `/api/proxy/super-admin/tenants?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leads");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTenant = (tenantId: string) => {
  return useQuery({
    queryKey: ["tenant", tenantId],
    queryFn: async (): Promise<Tenant> => {
      const response = await fetch(
        `/api/proxy/super-admin/tenants/${tenantId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tenant");
      }

      return response.json();
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTenantInput) => {
      const response = await fetch(`/api/proxy/super-admin/tenants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create tenant");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenants"],
      });
    },
  });
};

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTenantInput;
    }) => {
      const response = await fetch(`/api/proxy/super-admin/tenants/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update tenant");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenants"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tenant"],
      });
    },
  });
};

export const useDeleteTenant = () => {};
