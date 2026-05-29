"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SuperAdminRole } from "@/types/profile";
import { Loader2Icon, Pencil } from "lucide-react";
import { useProfile } from "@/hooks/my-profile/useProfile";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AvatarUploader } from "./components/avatar-uploader";
import { ChangePasswordDialog } from "./components/change-password-dialog";

const initials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0).toUpperCase()}${lastName
    .charAt(0)
    .toUpperCase()}`;
};

const fullName = (firstName: string, lastName: string) => {
  return `${firstName} ${lastName}`.trim();
};

const getAdminRole = (role: SuperAdminRole | null) => {
  switch (role) {
    case SuperAdminRole.OWNER:
      return (
        <span className="text-muted-foreground truncate text-sm">Owner</span>
      );
    case SuperAdminRole.PARTNER:
      return (
        <span className="text-muted-foreground truncate text-sm">Partner</span>
      );
    case SuperAdminRole.MANAGER:
      return (
        <span className="text-muted-foreground truncate text-sm">Manager</span>
      );
    case SuperAdminRole.STAFF:
      return (
        <span className="text-muted-foreground truncate text-sm">Staff</span>
      );
    default:
      return (
        <span className="text-muted-foreground truncate text-sm">
          Unresolved
        </span>
      );
  }
};

const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
});
type Form = z.infer<typeof schema>;

const MyProfile = () => {
  const [openAvatarDialog, setOpenAvatarDialog] = useState<boolean>(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const {
    profile,
    profileLoading,
    profileError,
    refetchProfile,
    uploadProfile,
    updatingProfile,
    uploadProfileError,
    uploadAvatar,
    uploadingAvatar,
    uploadAvatarError,
    changePassword,
    changingPassword,
  } = useProfile();
  const { register, handleSubmit, reset } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phone: profile.phone ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: Form) => {
    const { firstName, lastName, phone } = values;
    try {
      await uploadProfile({ firstName, lastName, phone });
      toast.success("Profile updated successfully!");
      setEdit(false);
    } catch {
      toast.error("Failed to update profile!");
    }
  };

  useEffect(() => {
    if (profileError) toast.error(profileError);
  }, [profileError]);

  useEffect(() => {
    if (uploadProfileError) toast.error(uploadProfileError);
  }, [uploadProfileError]);

  const onUploaded = async () => {
    await refetchProfile();
    toast.success("Profile avatar updated!");
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Profile</h1>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4">
          {profileLoading && !profile ? (
            <Skeleton className="h-20 w-full rounded-xl" />
          ) : (
            <>
              <div className="relative">
                <Avatar className="h-16 w-16">
                  {/* Placeholder image for now; replace src when upload API is ready */}
                  <AvatarImage
                    src={profile?.avatar || ""}
                    alt={
                      fullName(
                        profile?.firstName ?? "",
                        profile?.lastName ?? "",
                      ) || profile?.email
                    }
                  />
                  <AvatarFallback className="text-lg">
                    {initials(
                      profile?.firstName ?? "",
                      profile?.lastName ?? "",
                    )}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => setOpenAvatarDialog(true)}
                  className="absolute bottom-0 right-0 bg-background border rounded-full p-1 shadow-sm hover:bg-muted transition"
                >
                  <Pencil className="h-2.5 w-2.5 text-muted-foreground" />
                </button>
                <AvatarUploader
                  open={openAvatarDialog}
                  onOpenChange={setOpenAvatarDialog}
                  onUploaded={onUploaded}
                  uploadAvatar={uploadAvatar}
                  loadingAvatar={uploadingAvatar}
                  error={uploadAvatarError}
                />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <CardTitle>
                  {fullName(
                    profile?.firstName ?? "",
                    profile?.lastName ?? "",
                  ) || "Unnamed User"}
                </CardTitle>
                <span className="text-muted-foreground truncate text-sm">
                  {profile?.email}
                </span>
                {getAdminRole(profile?.role ?? null)}
              </div>
            </>
          )}
        </CardHeader>

        <Separator />

        <CardContent className="grid gap-6 p-6">
          {profileLoading && !profile ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : edit ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-1">
                  <Label
                    htmlFor="firstName"
                    className="text-xs uppercase text-muted-foreground mb-1"
                  >
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="firstName"
                    {...register("firstName")}
                  />
                </div>
                <div className="grid gap-1">
                  <Label
                    htmlFor="lastName"
                    className="text-xs uppercase text-muted-foreground mb-1"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="lastName"
                    {...register("lastName")}
                  />
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Email
                  </span>
                  <span className="text-sm">{profile?.email}</span>
                </div>
                <div className="grid gap-1">
                  <Label
                    htmlFor="phone"
                    className="text-xs uppercase text-muted-foreground mb-1"
                  >
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="phone"
                    {...register("phone")}
                  />
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Role
                  </span>
                  <span className="text-sm">{profile?.role || "—"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Status
                  </span>
                  <span className="text-sm">{profile?.status || "—"}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={updatingProfile}>
                  {updatingProfile ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEdit(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    First name
                  </span>
                  <span className="text-sm">{profile?.firstName || "—"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Last name
                  </span>
                  <span className="text-sm">{profile?.lastName || "—"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Email
                  </span>
                  <span className="text-sm">{profile?.email}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Phone
                  </span>
                  <span className="text-sm">{profile?.phone || "—"}</span>
                </div>
                <div className="grid gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Role
                  </span>
                  <span className="text-sm">
                    {getAdminRole(profile?.role ?? null)}
                  </span>
                </div>
              </div>

              {/* Future: “Edit profile” + “Change password” actions */}
              <div className="flex gap-2">
                <Button onClick={() => setEdit(true)}>Edit Profile</Button>
                <Button
                  variant="outline"
                  onClick={() => setOpenPasswordDialog(true)}
                >
                  Change Password
                </Button>
              </div>
              <ChangePasswordDialog
                open={openPasswordDialog}
                onOpenChange={setOpenPasswordDialog}
                changePassword={changePassword}
                changingPassword={changingPassword}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProfile;
