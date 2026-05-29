import { AdminRole } from "@/types/profile";
import { useProfile } from "../my-profile/useProfile";

export const usePermissions = () => {
  const { profile } = useProfile();
  const role = profile?.role;

  return {
    isOwner: role === AdminRole.OWNER,
    isManager: role === AdminRole.MANAGER,
    isStaff: role === AdminRole.VIEWER,
    canCreateStores: role === AdminRole.OWNER,
    canEditStores: role === AdminRole.OWNER || role === AdminRole.MANAGER,
    canCreateStaff: role === AdminRole.OWNER || role === AdminRole.MANAGER,
    canEditManagers: role === AdminRole.OWNER,
    canEditStaff: role === AdminRole.OWNER || role === AdminRole.MANAGER,
  };
};
