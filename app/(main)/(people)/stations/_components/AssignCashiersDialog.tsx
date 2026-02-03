"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import type { Dispatch, SetStateAction } from "react";
import { Cashier } from "@/types/cashier";
import { toast } from "sonner";
import { api } from "@/app/lib/config/api";
import { isAxiosError } from "axios";

interface AssignCashiersDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  availableCashiers: Cashier[];
  loadingCashiers: boolean;
  onRefresh: () => void;
  stationId: string;
}

const AssignCashiersDialog = ({
  open,
  setOpen,
  availableCashiers,
  loadingCashiers,
  onRefresh,
  stationId,
}: AssignCashiersDialogProps) => {
  const [localCashiers, setLocalCashiers] = useState<Cashier[]>([]);
  const [assigningById, setAssigningById] = useState<Record<string, boolean>>({});

  // Update local cashiers when availableCashiers changes
  useEffect(() => {
    setLocalCashiers(availableCashiers);
  }, [availableCashiers]);

  const handleAssignCashier = async (userId: string) => {
    setAssigningById((prev) => ({ ...prev, [userId]: true }));
    console.log(userId, stationId)
    try {
      await api.post("/admin/assign-cashier", {
        userId,
        stationId,
      });

      // Remove the cashier from the local list
      setLocalCashiers((prev) => prev.filter((c) => String(c.uid) !== userId));
      
      toast.success("Cashier assigned successfully");
      onRefresh();
    } catch (error) {
      console.error("Failed to assign cashier:", error);
      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to assign cashier");
      }
    } finally {
      setAssigningById((prev) => ({ ...prev, [userId]: false }));
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Cashiers</DialogTitle>
          <DialogDescription>
            Select a cashier to assign to this station.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Input placeholder="Search cashier..." className="flex-1" />
          <LiquidButton
            size="lg"
            variant="default"
            type="button"
            onClick={onRefresh}
            disabled={loadingCashiers}>
            Refresh
          </LiquidButton>
        </div>

        {loadingCashiers ? (
          <div className="flex justify-center items-center py-8">
            <BounceLoader />
          </div>
        ) : localCashiers.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No available cashiers found.
          </div>
        ) : (
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {localCashiers.map((cashier) => (
                <div
                  key={cashier.uid}
                  className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div>
                      <Label className="font-medium">
                        {cashier.name || cashier.email}
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        {cashier.email}
                      </div>
                    </div>
                  </div>
                  <LiquidButton
                    size="sm"
                    variant="default"
                    type="button"
                    onClick={() => handleAssignCashier(String(cashier.uid))}
                    disabled={assigningById[String(cashier.uid)]}>
                    {assigningById[String(cashier.uid)] ? "Assigning..." : "Assign"}
                  </LiquidButton>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AssignCashiersDialog;
