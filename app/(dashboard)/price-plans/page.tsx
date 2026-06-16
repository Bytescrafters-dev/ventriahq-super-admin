"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

import { PricePlanFilters } from "./components/PricePlanFilter";
import { IconPlus } from "@tabler/icons-react";
import { usePricePlans } from "@/hooks/usePricePlan";
import { BILLING_CYCLE } from "@/types/pricePlan";

export const getCampaignStyles = (campaign: string) => {
  switch (campaign) {
    // case LEAD_CAMPAIGN.FACEBOOK:
    //   return "bg-blue-800 text-white";
    // case LEAD_CAMPAIGN.INSTAGRAM:
    //   return "bg-pink-800 text-white";
    // case LEAD_CAMPAIGN.TIKTOK:
    //   return "bg-black text-white";
    // case LEAD_CAMPAIGN.WHATSAPP:
    //   return "bg-green-800 text-white";
    // case LEAD_CAMPAIGN.GOOGLE:
    //   return "bg-gray-100 text-red-800";
    // case LEAD_CAMPAIGN.OTHER:
    //   return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getBillingCycleName = (billingCyle: BILLING_CYCLE) => {
  switch (billingCyle) {
    case BILLING_CYCLE.MONTHLY:
      return "Monthly";
    case BILLING_CYCLE.QUARTERLY:
      return "Quarterly";
    case BILLING_CYCLE.SEMI_ANNUAL:
      return "Semi annual";
    case BILLING_CYCLE.ANNUAL:
      return "Annual";
    default:
      return null;
  }
};

const LIMIT = 10;

function PricePlanContent() {
  const searchParams = useSearchParams();

  const planName = searchParams.get("planName") ?? undefined;
  const billingCycle = (searchParams.get("billingCycle") ?? undefined) as
    | BILLING_CYCLE
    | undefined;
  const currency = searchParams.get("currency") ?? undefined;
  const isActive = searchParams.get("isActive") ?? undefined;

  const { data, isLoading, isError } = usePricePlans({
    planName,
    billingCycle,
    currency,
    isActive,
  });

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
              <TableHead className="font-bold">Plan Name</TableHead>
              <TableHead className="font-bold">Billing Cycle</TableHead>
              <TableHead className="font-bold">Currency</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Price</TableHead>
              <TableHead className="font-bold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.length ? (
              data.map((pricePlan) => (
                <TableRow key={pricePlan.id}>
                  <TableCell className="font-medium">
                    <Link href={`/price-plans/update/${pricePlan.id}`}>
                      {pricePlan.planName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getBillingCycleName(pricePlan.billingCycle)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pricePlan.currency || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pricePlan.isActive ? (
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize bg-green-600 text-white`}
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize bg-gray-600 text-white`}
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {pricePlan.amount || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center items-center">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/price-plans/update/${pricePlan.id}`}>
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
                  No price plans found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default function LeadsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Price Plans</h1>
        <Button asChild size="sm">
          <Link href="/price-plans/create">
            <IconPlus className="mr-2" />
            Create Price Plan
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <PricePlanFilters />
            </Suspense>
          </CardContent>
        </Card>

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <PricePlanContent />
        </Suspense>
      </div>
    </div>
  );
}
