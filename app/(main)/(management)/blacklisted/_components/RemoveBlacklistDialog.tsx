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
import { useEffect, useState } from "react";
import { api } from "@/app/lib/config/api";

type RemoveBlacklistDialogProps = {
  open: boolean;
  userEmail: string;
  reason: string;
  blockedBy: string;
  onClose: () => void;
  onConfirm: () => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

export default function RemoveBlacklistDialog({
  open,
  userEmail,
  reason,
  blockedBy,
  onClose,
  onConfirm,
  isSaving,
  errorMessage,
}: RemoveBlacklistDialogProps) {
  const disabled = isSaving;
  const [blockedByUser, setBlockedByUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!blockedBy || !open) return;
      
      try {
        const response = await api.get(`/admin/users/${blockedBy}`);
        const userData = response.data?.data || response.data;
        const userName = userData?.name || userData?.email || userData?.displayName || blockedBy;
        setBlockedByUser(userName);
      } catch (error) {
        console.error(`Failed to fetch user data for ${blockedBy}`, error);
        setBlockedByUser(blockedBy); // Fallback to UID if fetch fails
      }
    };

    fetchUserDetails();
  }, [blockedBy, open]);

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
          <DialogTitle>Remove from blacklist</DialogTitle>
          <DialogDescription>
            Remove {userEmail} from the blacklist?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg bg-muted p-3 space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Reason: </span>
              {reason}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Blocked by: </span>
              {blockedByUser || "Loading..."}
            </p>
          </div>

          {errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={disabled}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {isSaving ? "Removing..." : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
