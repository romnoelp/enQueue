"use client";

import { useEffect, useState, useMemo } from "react";
import type { Station } from "@/types/station";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { api } from "@/app/lib/config/api";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import DetailHeader from "./DetailHeader";
import StationForm from "./StationForm";
import AssignCashiersDialog from "./AssignCashiersDialog";
import SaveControls from "./SaveControls";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Cashier } from "@/types/cashier";

interface DetailContentProps {
  initialData?: Partial<Station> | null;
  loading?: boolean;
  onSave?: (payload: Partial<Station>) => Promise<void>;
}

const DetailContent = ({
  initialData,
  loading = false,
  onSave,
}: DetailContentProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [availableCashiers, setAvailableCashiers] = useState<Cashier[]>([]);
  const [loadingCashiers, setLoadingCashiers] = useState(false);
  const [assignedCashiers, setAssignedCashiers] = useState<Cashier[]>([]);
  const [loadingAssignedCashiers, setLoadingAssignedCashiers] = useState(false);
  const [unassigningById, setUnassigningById] = useState<Record<string, boolean>>({});

  const isValid =
    Boolean(name.trim()) && Boolean(description.trim()) && Boolean(typeValue);

  // Sync local state whenever initialData changes (e.g. when selecting a new station)
  useEffect(() => {
    if (!initialData) {
      setName("");
      setDescription("");
      setTypeValue("");
      return;
    }

    queueMicrotask(() => {
      setName(initialData.name ?? "");
      setDescription(initialData.description ?? "");
      setTypeValue(initialData.type ?? "");
    });
  }, [initialData]);

  // Determine if form has unsaved changes
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      (initialData.name ?? "") !== name ||
      (initialData.description ?? "") !== description ||
      String(initialData.type ?? "") !== typeValue
    );
  }, [initialData, name, description, typeValue]);

  const handleSave = async () => {
    if (isSaving || !isDirty) return;
    if (!isValid) {
      toast.error("Name, description, and station type are required");
      return;
    }

    setIsSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      type: typeValue as Station["type"],
    };

    try {
      if (onSave) {
        await onSave(payload);
        toast.success("Station updated successfully");
      } else {
        toast.error("No save handler provided");
      }
    } catch (err) {
      console.error("Save failed:", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to save changes");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAssignDialog = async () => {
    setShowAssignDialog(true);
    setLoadingCashiers(true);
    try {
      const res = await api.get("/admin/available-cashiers");
      setAvailableCashiers(res.data.availableCashiers);
    } catch (err) {
      console.error("Failed to fetch available cashiers:", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to load available cashiers");
      }
      setAvailableCashiers([]);
    } finally {
      setLoadingCashiers(false);
    }
  };

  const handleViewCashiers = async () => {
    if (!initialData?.id) {
      toast.error("Station ID is required");
      return;
    }
    
    setShowViewDialog(true);
    setLoadingAssignedCashiers(true);
    try {
      const res = await api.get(`/admin/stations/${initialData.id}/cashiers`);
      setAssignedCashiers(res.data.cashiers);
    } catch (err) {
      console.error("Failed to fetch assigned cashiers:", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to load assigned cashiers");
      }
      setAssignedCashiers([]);
    } finally {
      setLoadingAssignedCashiers(false);
    }
  };

  const handleUnassignCashier = async (userId: string) => {
    setUnassigningById((prev) => ({ ...prev, [userId]: true }));

    try {
      await api.post("/admin/unassign-cashier", {
        userId,
      });

      // Remove the cashier from the local list
      setAssignedCashiers((prev) => prev.filter((c) => String(c.uid) !== userId));
      
      toast.success("Cashier unassigned successfully");
    } catch (error) {
      console.error("Failed to unassign cashier:", error);
      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to unassign cashier");
      }
    } finally {
      setUnassigningById((prev) => ({ ...prev, [userId]: false }));
    }
  };

  if (loading || (!initialData && loading !== false)) {
    return (
      <Card className="h-full p-4">
        <div className="h-full flex items-center justify-center">
          <BounceLoader />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full p-4">
      <div className="space-y-6">
        <DetailHeader />

        <StationForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          typeValue={typeValue}
          setTypeValue={setTypeValue}
          onOpenAssignDialog={() => void handleOpenAssignDialog()}
          onViewCashiers={() => void handleViewCashiers()}
        />

        <SaveControls
          isDirty={isDirty}
          isSaving={isSaving}
          isValid={isValid}
          onSave={() => void handleSave()}
        />

        <AssignCashiersDialog
          open={showAssignDialog}
          setOpen={setShowAssignDialog}
          availableCashiers={availableCashiers}
          loadingCashiers={loadingCashiers}
          onRefresh={() => void handleOpenAssignDialog()}
          stationId={initialData?.id ?? ""}
        />

        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>View Cashiers</DialogTitle>
              <DialogDescription>
                Manage cashiers assigned to this station.
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2 mb-4">
              <Input placeholder="Search cashier..." className="flex-1" />
              <LiquidButton
                size="lg"
                variant="default"
                type="button"
                disabled={loadingAssignedCashiers}
                onClick={() => {
                  void handleViewCashiers();
                }}>
                {loadingAssignedCashiers ? "Loading..." : "Refresh"}
              </LiquidButton>
            </div>

            {loadingAssignedCashiers ? (
              <div className="flex justify-center items-center py-8">
                <BounceLoader />
              </div>
            ) : assignedCashiers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No cashiers found.
              </div>
            ) : (
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {assignedCashiers.map((cashier) => (
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
                        variant="destructive"
                        type="button"
                        onClick={() => handleUnassignCashier(String(cashier.uid))}
                        disabled={unassigningById[String(cashier.uid)]}>
                        {unassigningById[String(cashier.uid)] ? "Unassigning..." : "Unassign"}
                      </LiquidButton>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
};

export default DetailContent;
