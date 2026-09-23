import { Invoice } from "@/types/invoice";
import { useQuery } from "@tanstack/react-query";

interface UseInvoicesParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  dateType?: "createdAt" | "dueDate";
  dateFrom?: Date;
  dateTo?: Date;
}

interface InvoicesResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
}

export const useTenantInvoices = (tenantId: string) => {
  return useQuery({
    queryKey: ["tenant-invoices", tenantId],
    queryFn: async (): Promise<Invoice[]> => {
      const response = await fetch(
        `/api/proxy/super-admin/tenants/${tenantId}/invoices`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tenant invoices");
      }

      return response.json();
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInvoices = ({
  page = 1,
  limit = 10,
  status,
  dateType = "createdAt",
  dateFrom,
  dateTo,
  q,
}: UseInvoicesParams = {}) => {
  return useQuery({
    queryKey: [
      "tenants",
      { page, limit, status, dateFrom, dateTo, dateType, q },
    ],
    queryFn: async (): Promise<InvoicesResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (status) params.append("status", status);
      if (q) params.append("q", q);
      if (dateFrom)
        params.append(
          dateType === "createdAt" ? "createdAtFrom" : "dueFrom",
          dateFrom.toISOString(),
        );
      if (dateTo)
        params.append(
          dateType === "createdAt" ? "createdAtTo" : "dueTo",
          dateTo.toISOString(),
        );

      const response = await fetch(
        `/api/proxy/super-admin/invoices?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
