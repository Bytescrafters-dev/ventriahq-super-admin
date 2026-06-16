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
import { useCreateTenant } from "@/hooks/useTenants";
import { Loader2Icon } from "lucide-react";
import PasswordInput from "@/components/common/PasswordInput";
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
import { usePricePlans } from "@/hooks/usePricePlan";
import { Skeleton } from "@/components/ui/skeleton";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string(),
    companyName: z.string(),
    email: z.email("Invalid email address"),
    phone: z.string(),
    notes: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

const CreateTenant = () => {
  const router = useRouter();

  const [status, setStatus] = useState<TENANT_STATUS>(TENANT_STATUS.PENDING);
  const [plan, setPlan] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const { data, isLoading, isError: pricePlanError } = usePricePlans();

  const { mutateAsync: createTenant, isPending, isError } = useCreateTenant();

  const onSubmit = async (values: Form) => {
    const { firstName, lastName, companyName, phone, notes, password, email } =
      values;

    if (!plan) {
      toast.error("Please select a price plan");
      return;
    }

    try {
      await createTenant({
        firstName,
        lastName,
        companyName,
        phone,
        notes,
        password,
        email,
        planPriceId: plan,
        status,
        trialEndsAt: trialEndDate,
      });
      toast.success("Tenant created successfully!");
      router.push("/tenants");
    } catch {}
  };

  useEffect(() => {
    if (isError) toast.error("Failed to create tenant!");

    if (pricePlanError) toast.error("Failed to load price plans!");
  }, [isError, pricePlanError]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Tenant</h1>
      </div>

      <Card className="max-w">
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full rounded-xl" />
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
                  {...register("email")}
                  placeholder="Tenant email"
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
                  htmlFor="password"
                  className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  Temporary password
                </Label>
                <PasswordInput
                  id="password"
                  {...register("password")}
                  placeholder="Password"
                />
              </div>

              <div className="flex gap-4">
                <Label
                  htmlFor="confirmPassword"
                  className="w-40 min-w-40 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
                >
                  Confirm password
                </Label>
                <div className="flex-1">
                  <PasswordInput
                    id="confirmPassword"
                    {...register("confirmPassword")}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
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
                    Price Plan
                  </Label>
                  <div className="flex gap-4">
                    <Select
                      value={plan ?? ""}
                      onValueChange={(val) => setPlan(val)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {data?.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.planName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                  {isPending ? "Creating..." : "Create Tenant"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTenant;
