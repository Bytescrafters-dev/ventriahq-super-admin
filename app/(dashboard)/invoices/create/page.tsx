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
import { TENANT_STATUS, TENANT_STATUS_OPTIONS } from "@/types/tenant";
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

const CreateInvoice = () => {
  const router = useRouter();

  const [status, setStatus] = useState<TENANT_STATUS>(TENANT_STATUS.PENDING);
  const [plan, setPlan] = useState<string | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  //   const {
  //     register,
  //     handleSubmit,
  //     formState: { errors },
  //   } = useForm<Form>({
  //     resolver: zodResolver(schema),
  //   });

  //   const { data, isLoading, isError: pricePlanError } = usePricePlans();

  //   const { mutateAsync: createTenant, isPending, isError } = useCreateTenant();

  //   const onSubmit = async (values: Form) => {
  //     const { firstName, lastName, companyName, phone, notes, password, email } =
  //       values;

  //     if (!plan) {
  //       toast.error("Please select a price plan");
  //       return;
  //     }

  //     try {
  //       await createTenant({
  //         firstName,
  //         lastName,
  //         companyName,
  //         phone,
  //         notes,
  //         password,
  //         email,
  //         planPriceId: plan,
  //         status,
  //         trialEndsAt: trialEndDate,
  //       });
  //       toast.success("Tenant created successfully!");
  //       router.push("/tenants");
  //     } catch {}
  //   };

  //   useEffect(() => {
  //     if (isError) toast.error("Failed to create tenant!");

  //     if (pricePlanError) toast.error("Failed to load price plans!");
  //   }, [isError, pricePlanError]);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Invoice</h1>
      </div>
    </div>
  );
};

export default CreateInvoice;
