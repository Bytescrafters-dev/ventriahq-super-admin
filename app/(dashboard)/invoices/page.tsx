"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { TENANT_STATUS } from "@/types/tenant";
import { InvoicesFilters } from "./components/InvoicesFilter";
import { IconPlus } from "@tabler/icons-react";
import { useInvoices } from "@/hooks/useInvoice";
import { format, parse, isValid } from "date-fns";

export const getStatusStyles = (status: string) => {
  switch (status) {
    case TENANT_STATUS.SUSPENDED:
      return "bg-yellow-100 text-yellow-800";
    case TENANT_STATUS.PENDING:
      return "bg-grey-100 text-grey-800";
    case TENANT_STATUS.ACTIVE:
      return "bg-green-100 text-green-800";
    case TENANT_STATUS.CANCELED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const LIMIT = 10;

function InvoicesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(searchParams?.get("page") ?? "1"));
  const q = searchParams?.get("q") ?? undefined;
  const status = searchParams?.get("status") ?? undefined;
  const dateType = (searchParams?.get("dateType") ?? "createdAt") as
    | "createdAt"
    | "dueDate";

  const parseDateParam = (str: string | null): Date | undefined => {
    if (!str) return undefined;
    const d = parse(str, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  };

  const dateFrom = parseDateParam(searchParams?.get("dateFrom") ?? "");
  const dateTo = parseDateParam(searchParams?.get("dateTo") ?? "");

  const { data, isLoading, isError } = useInvoices({
    page,
    limit: LIMIT,
    q,
    status,
    dateType,
    dateFrom,
    dateTo,
  });

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", next.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load invoices.
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Invoice Number</TableHead>
              <TableHead className="font-bold">Company Name</TableHead>
              <TableHead className="font-bold">Contact Name</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Subscription</TableHead>
              <TableHead className="font-bold">Amount</TableHead>
              <TableHead className="font-bold">Created Date</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 11 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data?.length ? (
              data.data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link href={`/invoices/update/${invoice.id}`}>
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.tenant.companyName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {`${invoice.tenant.firstName} ${invoice.tenant.lastName}`}
                  </TableCell>
                  <TableCell>{invoice.tenant.phone || "-"}</TableCell>
                  <TableCell>{invoice.tenant.email || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.subscription.planPrice.planName || "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {`${invoice.subscription.planPrice.currency} ${invoice.subscription.planPrice.amount}` ||
                      "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(invoice.createdAt), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(invoice.dueDate), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getStatusStyles(invoice.status)}`}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center items-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/invoices/update/${invoice.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {}}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={11}
                  className="text-center text-muted-foreground py-10"
                >
                  No tenants found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.total > LIMIT && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * LIMIT + 1}–
            {Math.min(page * LIMIT, data.total)} of {data.total} tenants
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page * LIMIT >= data.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default function InvoicesPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild size="sm">
          <Link href="/invoices/create">
            <IconPlus className="mr-2" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <InvoicesFilters />
            </Suspense>
          </CardContent>
        </Card>

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <InvoicesContent />
        </Suspense>
      </div>
    </div>
  );
}
