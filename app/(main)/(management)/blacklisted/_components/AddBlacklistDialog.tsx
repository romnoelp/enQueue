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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { auth } from "@/app/lib/config/firebase";


type AddBlacklistDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (email: string, reason: string, blockedBy: string) => void;
  isSaving?: boolean;
  errorMessage?: string | null;
};

export default function AddBlacklistDialog({
  open,
  onClose,
  onConfirm,
  isSaving,
  errorMessage,
}: AddBlacklistDialogProps) {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  const handleClose = () => {
    setEmail("");
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    const blockedBy = auth.currentUser?.uid || "";
    if (!blockedBy) {
      return;
    }
    onConfirm(email, reason, blockedBy);
  };

  const disabled = isSaving || !email.trim() || !reason.trim();

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? handleClose() : null)}>
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
          <DialogTitle>Blacklist a user</DialogTitle>
          <DialogDescription>
            Enter the email and reason for blacklisting this user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Reason</label>
            <Textarea
              placeholder="Enter the reason for blacklisting..."
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason(e.target.value)
              }
              disabled={isSaving}
              rows={4}
            />
          </div>

          {errorMessage ? (
            <p className="text-destructive text-sm">{errorMessage}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={disabled}
            aria-disabled={disabled}
            variant="destructive"
          >
            {isSaving ? "Blacklisting..." : "Blacklist User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
