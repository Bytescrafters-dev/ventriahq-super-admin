"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2Icon } from "lucide-react";
import {
  useActivateSubscription,
  useCurrentSubscription,
  useUpdateSubscription,
} from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SUBSCRIPTION_STATUS } from "@/types/subscription";
import ConfirmDialog from "@/components/activity-confirmation-dialog";

interface TenantSubscriptionTabProps {
  tenantId: string;
}

export const TenantSubscriptionTab = ({
  tenantId,
}: TenantSubscriptionTabProps) => {
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
  } = useCurrentSubscription(tenantId);

  const { mutateAsync: activateSubscription, isPending: activatingPending } =
    useActivateSubscription();

  const { mutateAsync: updateSubscription, isPending: updatePending } =
    useUpdateSubscription();

  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [daysUntilDue, setDaysUntilDue] = useState<number>(0);

  useEffect(() => {
    if (data) {
      setCancelAtPeriodEnd(data.cancelAtPeriodEnd ?? false);
      setDaysUntilDue(data.daysUntilDue ?? 0);
    }
  }, [data]);

  useEffect(() => {
    if (fetchingError) toast.error("Failed to fetch subscription!");
  }, [fetchingError]);

  const handleToggleCancelAtPeriodEnd = async (checked: boolean) => {
    setCancelAtPeriodEnd(checked);
    try {
      await updateSubscription({
        id: tenantId,
        data: { cancelAtPeriodEnd: checked },
      });
      toast.success("Subscription updated!");
    } catch {
      setCancelAtPeriodEnd(!checked);
      toast.error("Failed to update subscription!");
    }
  };

  const handleDaysUntilDueBlur = async () => {
    try {
      await updateSubscription({
        id: tenantId,
        data: { daysUntilDue },
      });
      toast.success("Subscription updated!");
    } catch {
      toast.error("Failed to update subscription!");
    }
  };

  const onClickActivate = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Activation",
      description: "Are you sure you want to activate this subscription?",
      buttonTitle: "Activate",
      buttonLoadingTitle: "Activating...",
      onConfirm: () => activateSubscription(tenantId),
    });
  };

  const onClickUpdate = (keyword: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title: "Confirm Update",
      description: `Are you sure you want to ${keyword} this subscription?`,
      buttonTitle: "Update",
      buttonLoadingTitle: "Updating...",
      onConfirm,
    });
  };

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

  const isTrial = !data || data.status === SUBSCRIPTION_STATUS.TRIAL;

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
          <p className="text-muted-foreground text-sm">
            No active subscription found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Subscription Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Label className="w-40 min-w-40 text-sm font-medium flex items-center">
              Plan Status
            </Label>
            <div className="flex items-center gap-8">
              <Badge
                variant="outline"
                className={
                  isTrial
                    ? "bg-yellow-100 text-yellow-800 w-28"
                    : "bg-green-100 text-green-800 w-28"
                }
              >
                {data.status ?? "Trial"}
              </Badge>
              {isTrial && (
                <Button
                  size="sm"
                  onClick={onClickActivate}
                  disabled={activatingPending}
                >
                  {activatingPending && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Activate
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            <Label className="w-40 min-w-40 text-sm font-medium flex items-center">
              Plan Name
            </Label>
            <Input value={data.planPrice.planName ?? "—"} disabled />
          </div>

          <div className="flex gap-4">
            <Label className="w-40 min-w-40 text-sm font-medium flex items-center">
              Currency
            </Label>
            <Input
              value={data.planPrice.currency ?? "—"}
              disabled
              className="w-32"
            />
          </div>

          <div className="flex gap-4">
            <Label className="w-40 min-w-40 text-sm font-medium flex items-center">
              Amount
            </Label>
            <Input
              value={data.planPrice.amount ?? "—"}
              disabled
              className="w-32"
            />
          </div>
          {!isTrial && (
            <>
              <Separator />

              <div className="flex gap-4">
                <Label className="w-40 min-w-40 text-sm font-medium flex items-center">
                  Current Period Start
                </Label>
                <Input
                  value={
                    data.currentPeriodStart
                      ? format(new Date(data.currentPeriodStart), "PPP")
                      : "—"
                  }
                  disabled
                />
              </div>

              <div className="flex gap-4">
                <Label className="w-40 min-w-40 text-sm font-medium flex items-center">
                  Current Period End
                </Label>
                <Input
                  value={
                    data.currentPeriodEnd
                      ? format(new Date(data.currentPeriodEnd), "PPP")
                      : "—"
                  }
                  disabled
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <Label className="w-40 min-w-40 text-sm font-medium">
              Cancel at Period End
            </Label>
            <Switch
              checked={cancelAtPeriodEnd}
              onCheckedChange={(checked) =>
                onClickUpdate(
                  cancelAtPeriodEnd ? "re-activate" : "cancel",
                  () => handleToggleCancelAtPeriodEnd(checked),
                )
              }
              disabled={updatePending}
            />
          </div>

          <div className="flex gap-4 items-center">
            <Label
              htmlFor="daysUntilDue"
              className="w-40 min-w-40 text-sm font-medium"
            >
              Days Until Due
            </Label>
            <Input
              id="daysUntilDue"
              type="number"
              min={0}
              className="w-32"
              value={daysUntilDue}
              onChange={(e) => setDaysUntilDue(Number(e.target.value))}
              onBlur={() =>
                onClickUpdate("update", () => handleDaysUntilDueBlur())
              }
              disabled={updatePending}
            />
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        {...confirmDialog}
        isLoading={activatingPending || updatePending}
        onOpenChange={resetConfirmation}
      />
    </div>
  );
};
