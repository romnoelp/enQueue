"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/components/radix/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types/auth";
import { getRoleLabel, SELECTABLE_ROLES } from "@/app/(main)/(people)/employees/_utils/role";

type AssignRoleDialogProps = {
  open: boolean;
  userDisplay: string;
  selectedRole: UserRole | null;
  onSelectedRoleChange: (role: UserRole) => void;
  onClose: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

export default function AssignRoleDialog({
  open,
  userDisplay,
  selectedRole,
  onSelectedRoleChange,
  onClose,
  onConfirm,
  isSaving,
  errorMessage,
}: AssignRoleDialogProps) {
  const disabled = isSaving || !selectedRole;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent
        className="sm:max-w-md"
        from="bottom"
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          duration: 0.2,
        }}
      >
        <DialogHeader>
          <DialogTitle>Assign role</DialogTitle>
          <DialogDescription>
            Choose a role to assign to {userDisplay}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Role</label>
            <Select
              value={selectedRole ?? undefined}
              onValueChange={(val) => onSelectedRoleChange(val as UserRole)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent align="start">
                {SELECTABLE_ROLES.filter((role) => role !== "pending").map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            onClick={onConfirm}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {isSaving ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
