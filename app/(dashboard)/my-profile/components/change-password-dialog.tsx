"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/common/PasswordInput";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Form = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<boolean>;
  changingPassword: boolean;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
  changePassword,
  changingPassword,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const onSubmit = async ({ currentPassword, newPassword }: Form) => {
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label
              htmlFor="currentPassword"
              className="text-xs uppercase text-muted-foreground"
            >
              Current Password
            </Label>
            <div className="flex-1">
              <PasswordInput
                id="currentPassword"
                placeholder="Enter current password"
                error={errors.currentPassword?.message}
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="newPassword"
              className="text-xs uppercase text-muted-foreground"
            >
              New Password
            </Label>
            <div className="flex-1">
              <PasswordInput
                id="newPassword"
                placeholder="Enter new password"
                error={errors.newPassword?.message}
                {...register("newPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-1">
            <Label
              htmlFor="confirmPassword"
              className="text-xs uppercase text-muted-foreground"
            >
              Confirm New Password
            </Label>
            <div className="flex-1">
              <PasswordInput
                id="confirmPassword"
                placeholder="Confirm new password"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              disabled={changingPassword}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Please wait
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
