"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTenantInvoices } from "@/hooks/useInvoice";
import { INVOICE_STATUS } from "@/types/invoice";
import { format } from "date-fns";

interface TenantSubscriptionTabProps {
  tenantId: string;
}

export const getStatusStyles = (status: string) => {
  switch (status) {
    case INVOICE_STATUS.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case INVOICE_STATUS.VOID:
      return "bg-grey-100 text-grey-800";
    case INVOICE_STATUS.PAID:
      return "bg-green-100 text-green-800";
    case INVOICE_STATUS.PAST_DUE:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const TenantInvoiceTab = ({ tenantId }: TenantSubscriptionTabProps) => {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    buttonTitle: "",
    buttonLoadingTitle: "",
    onConfirm: () => {},
  });

  const {
    data,
    isLoading,
    isError: fetchingError,
  } = useTenantInvoices(tenantId);

  //   const { mutateAsync: activateSubscription, isPending: activatingPending } =
  //     useActivateSubscription();

  //   const { mutateAsync: updateSubscription, isPending: updatePending } =
  //     useUpdateSubscription();

  useEffect(() => {
    if (fetchingError) toast.error("Failed to fetch invoices!");
  }, [fetchingError]);

  //   const onClickActivate = () => {
  //     setConfirmDialog({
  //       isOpen: true,
  //       title: "Confirm Activation",
  //       description: "Are you sure you want to activate this subscription?",
  //       buttonTitle: "Activate",
  //       buttonLoadingTitle: "Activating...",
  //       onConfirm: () => activateSubscription(tenantId),
  //     });
  //   };

  const resetConfirmation = () => {
    setConfirmDialog({
      isOpen: false,
      title: "",
      description: "",
      buttonTitle: "",
      buttonLoadingTitle: "",
      onConfirm: () => {},
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center gap-4 py-12">
          <p className="text-muted-foreground text-sm">No invoices found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">Invoice Number</TableHead>
              <TableHead className="font-bold">Due Date</TableHead>
              <TableHead className="font-bold">Payment Method</TableHead>
              <TableHead className="font-bold">Paid By</TableHead>
              <TableHead className="font-bold">Notes</TableHead>
              <TableHead className="font-bold">Amount</TableHead>
              <TableHead className="font-bold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 20 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.length ? (
              data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(invoice.dueDate, "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.paymentMethod}
                  </TableCell>
                  <TableCell>
                    {invoice.paidBy
                      ? `${invoice.paidBy.firstName} ${invoice.paidBy.lastName}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {invoice.notes ?? "-"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {`${invoice.currency} ${invoice.amount}`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs capitalize ${getStatusStyles(invoice.status)}`}
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-10"
                >
                  No invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
