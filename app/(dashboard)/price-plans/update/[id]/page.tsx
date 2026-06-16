"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { usePricePlan, useUpdatePricePlan } from "@/hooks/usePricePlan";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const featureSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

const formSchema = z.object({
  amount: z
    .number()
    .int("Amount must be an integer")
    .min(0, "Amount must be 0 or greater"),
  features: z.array(featureSchema),
});

type FormValues = z.infer<typeof formSchema>;

const UpdatePricePlan = () => {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const { data, isLoading, isError: fetchingError } = usePricePlan(planId);

  const {
    mutateAsync: updatePricePlan,
    isPending,
    isError,
  } = useUpdatePricePlan();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (data) {
      reset({
        amount: data.amount,
        features: Object.entries(
          (data.features as unknown as Record<string, unknown>) ?? {},
        ).map(([key, value]) => ({ key, value: String(value) })),
      });
    }
  }, [data, reset]);

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

    await updatePricePlan({
      id: planId,
      data: {
        isActive: data?.isActive,
        amount: values.amount,
        features,
      },
    });

    toast.success("Price plan updated successfully");
  };

  useEffect(() => {
    if (isError) {
      toast.error("Failed to udpate price plan!");
    }
    if (fetchingError) {
      toast.error("Failed to fetch price plan!");
    }
  }, [isError, fetchingError]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Update Price Plan</h1>
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
            {isLoading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input id="planName" value={data?.planName} disabled />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Billing Cycle</Label>
                    <Input
                      id="billingCycle"
                      value={data?.billingCycle}
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input id="currency" value={data?.currency} disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {data?.currency}
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
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-36 w-full rounded-xl" />
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Plan"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePricePlan;
