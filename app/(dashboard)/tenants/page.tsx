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
import { useTenants } from "@/hooks/useTenants";
import { TENANT_STATUS } from "@/types/tenant";
import { TenantsFilters } from "./components/TenantsFilter";
import { IconPlus } from "@tabler/icons-react";

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

function TenantsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const q = searchParams.get("q") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const plan = searchParams.get("plan") ?? undefined;

  const { data, isLoading, isError } = useTenants({
    page,
    limit: LIMIT,
    q,
    status,
    plan,
  });

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", next.toString());
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="text-destructive text-sm py-8 text-center">
        Failed to load tenants.
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Company</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Phone</TableHead>
              <TableHead className="font-bold">Plan</TableHead>
              <TableHead className="font-bold">Created By</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data?.length ? (
              data.data.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <Link href={`/tenants/update/${tenant.id}`}>
                      {tenant.companyName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {`${tenant.firstName} ${tenant.lastName}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.email || "—"}
                  </TableCell>
                  <TableCell>{tenant.phone || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant.currentPlanName ? (
                      <Badge variant="outline" className={`text-xs capitalize`}>
                        {tenant.currentPlanName}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {tenant?.createdBy?.firstName || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getStatusStyles(tenant.status)}`}
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center items-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/tenants/update/${tenant.id}`}>
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
                  colSpan={9}
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

export default function LeadsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <Button asChild size="sm">
          <Link href="/tenants/create">
            <IconPlus className="mr-2" />
            Create Tenant
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <TenantsFilters />
            </Suspense>
          </CardContent>
        </Card>

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <TenantsContent />
        </Suspense>
      </div>
    </div>
  );
}
