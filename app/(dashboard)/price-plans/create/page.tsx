"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useCreatePricePlan } from "@/hooks/usePricePlan";
import {
  BILLING_CYCLE,
  BILLING_CYCLE_OPTIONS,
  BILLING_CYCLE_VALUES,
} from "@/types/pricePlan";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CURRENCIES } from "@/shared/constants/common";

const featureSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const formSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
  billingCycle: z.enum(BILLING_CYCLE_VALUES),
  currency: z.enum(["LKR", "AUD", "USD"] as const),
  amount: z
    .number()
    .int("Amount must be an integer")
    .min(0, "Amount must be 0 or greater"),
  features: z.array(featureSchema),
});

type FormValues = z.infer<typeof formSchema>;

const CreatePricePlan = () => {
  const router = useRouter();
  const { mutateAsync: createPricePlan, isPending } = useCreatePricePlan();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planName: "",
      billingCycle: BILLING_CYCLE.MONTHLY,
      currency: "LKR",
      amount: 0,
      features: [
        { key: "maxStores", value: "3" },
        { key: "maxStaff", value: "10" },
      ],
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: "features",
  });

  const onSubmit = async (values: FormValues) => {
    const features = values.features.reduce<Record<string, string | number>>(
      (acc, { key, value }) => {
        const num = Number(value);
        acc[key] = isNaN(num) ? value : num;
        return acc;
      },
      {},
    );

    await createPricePlan({
      planName: values.planName,
      billingCycle: values.billingCycle,
      currency: values.currency,
      amount: values.amount,
      features,
    });

    toast.success("Price plan created successfully");
    router.push("/price-plans");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Price Plan</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Details</CardTitle>
            <CardDescription>
              Basic information about this price plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                placeholder="e.g. Starter, Pro, Enterprise"
                {...register("planName")}
              />
              {errors.planName && (
                <p className="text-sm text-destructive">
                  {errors.planName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Select
                  defaultValue={BILLING_CYCLE.MONTHLY}
                  onValueChange={(val) =>
                    setValue("billingCycle", val as BILLING_CYCLE)
                  }
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CYCLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.billingCycle && (
                  <p className="text-sm text-destructive">
                    {errors.billingCycle.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  defaultValue="LKR"
                  onValueChange={(val) =>
                    setValue("currency", val as "LKR" | "AUD" | "USD")
                  }
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-destructive">
                    {errors.currency.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {watch("currency")}
                </span>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step={1}
                  className="pl-14 w-64"
                  placeholder="0"
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Features</CardTitle>
            <CardDescription>
              Define the limits and capabilities included in this plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Feature key (e.g. maxStores)"
                    {...register(`features.${index}.key`)}
                  />
                  {errors.features?.[index]?.key && (
                    <p className="text-xs text-destructive">
                      {errors.features[index]?.key?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Value (e.g. 5)"
                    {...register(`features.${index}.value`)}
                  />
                  {errors.features?.[index]?.value && (
                    <p className="text-xs text-destructive">
                      {errors.features[index]?.value?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePricePlan;
