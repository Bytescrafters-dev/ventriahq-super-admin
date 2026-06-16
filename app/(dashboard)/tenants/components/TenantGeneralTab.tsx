"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTenant, useUpdateTenant } from "@/hooks/useTenants";
import { Loader2Icon } from "lucide-react";
import { DatePicker } from "@/components/common/DatePicker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TENANT_STATUS,
  TENANT_STATUS_OPTIONS,
} from "@/types/tenant";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string(),
  companyName: z.string(),
  phone: z.string(),
  notes: z.string(),
});

type Form = z.infer<typeof schema>;

interface TenantGeneralTabProps {
  tenantId: string;
}

export const TenantGeneralTab = ({ tenantId }: TenantGeneralTabProps) => {
  const router = useRouter();

  const [status, setStatus] = useState<TENANT_STATUS>(TENANT_STATUS.PENDING);
  const [trialEndDate, setTrialEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const { register, handleSubmit, reset } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const { data, isLoading, isError: fetchingError } = useTenant(tenantId);
  const { mutateAsync: updateTenant, isPending, isError } = useUpdateTenant();

  useEffect(() => {
    if (data) {
      reset({
        companyName: data.companyName,
        firstName: data.firstName,
        lastName: data.lastName,
        notes: data.notes,
        phone: data.phone,
      });
      setTrialEndDate(data.trialEndsAt ?? format(new Date(), "yyyy-MM-dd"));
      setStatus(data.status);
    }
  }, [data, reset]);

  const onSubmit = async (values: Form) => {
    const { firstName, lastName, companyName, phone, notes } = values;
    try {
      await updateTenant({
        id: tenantId,
        data: {
          firstName,
          lastName,
          companyName,
          phone,
          notes,
          status,
          trialEndsAt: trialEndDate,
        },
      });
      toast.success("Tenant updated successfully!");
    } catch {}
  };

  useEffect(() => {
    if (isError) toast.error("Failed to update tenant!");
    if (fetchingError) toast.error("Failed to fetch tenant!");
  }, [isError, fetchingError]);

  return (
    <Card className="max-w">
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <Label
                htmlFor="companyName"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Company Name
              </Label>
              <Input
                id="companyName"
                {...register("companyName")}
                placeholder="Company name"
                required
              />
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="firstName"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="First name"
                required
              />
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="lastName"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Last name"
              />
            </div>

            <p className="mb-4 text-sm text-muted-foreground mt-8">
              The tenant should use this email address as their username when
              signing in.
            </p>
            <div className="flex gap-4">
              <Label
                htmlFor="email"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Email
              </Label>
              <Input
                id="email"
                value={data?.email}
                placeholder="Tenant email"
                disabled
              />
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="phone"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Phone
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Contact phone"
              />
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="notes"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Notes
              </Label>
              <Textarea id="notes" {...register("notes")} />
            </div>

            <div className="flex justify-start gap-8">
              <div className="flex gap-4 h-10">
                <Label className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                  Plan
                </Label>
                <div className="w-48 flex items-center text-sm font-medium">
                  {data?.currentPlanName ?? "Trial"}
                </div>
              </div>

              {data?.trialEndsAt && (
                <div className="flex gap-4">
                  <Label className="w-40 min-w-40 text-sm font-medium leading-none flex items-center">
                    Trial ends at
                  </Label>
                  <DatePicker
                    value={new Date(trialEndDate)}
                    onChange={(date) => {
                      if (date) setTrialEndDate(format(date, "yyyy-MM-dd"));
                    }}
                    placeholder="Select delivery date"
                    disablePast
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Label
                htmlFor="status"
                className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
              >
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (value) setStatus(value as TENANT_STATUS);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TENANT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/suppliers")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2Icon className="animate-spin" />}
                {isPending ? "Updating..." : "Update Tenant"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
