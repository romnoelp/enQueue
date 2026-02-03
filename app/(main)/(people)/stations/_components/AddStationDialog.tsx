"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Magnetic } from "@/components/motion-primitives/magnetic";
import { toast } from "sonner";
import { api } from "@/app/lib/config/api";
import { useStationsRefresh } from "../_contexts/StationsRefreshContext";
import { isAxiosError } from "axios";

const STATION_TYPES = [
  { value: "auditing", label: "Auditing" },
  { value: "clinic", label: "Clinic" },
  { value: "payment", label: "Payment" },
  { value: "registrar", label: "Registrar" },
] as const;

export default function AddStationDialog() {
  const { refresh } = useStationsRefresh();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [typeValue, setTypeValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const isValid =
    Boolean(name.trim()) && Boolean(description.trim()) && Boolean(typeValue);

  const resetForm = () => {
    setName("");
    setDescription("");
    setTypeValue("");
  };

  const handleCreate = async () => {
    if (isCreating) return;
    if (!name.trim() || !description.trim() || !typeValue) {
      toast.error("Name, description, and station type are required");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        type: typeValue,
      };

      await api.post("/stations", payload)

      toast.success("Station created successfully");
      setOpen(false);
      resetForm();
      await refresh();
    } catch (err) {
      console.error("Failed to create station:", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to create station");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Add Station</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new station</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new station.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="stationName" className="font-semibold">
              Name
            </Label>
            <Input
              id="stationName"
              placeholder="Enter station name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="stationDescription" className="font-semibold">
              Description
            </Label>
            <Textarea
              id="stationDescription"
              placeholder="Describe this station"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              rows={3}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="stationType" className="font-semibold">
                Station Type
              </Label>
              <Select
                value={typeValue}
                onValueChange={setTypeValue}
                disabled={isCreating}
              >
                <SelectTrigger id="stationType" className="w-full sm:w-50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {STATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Magnetic>
            <Button onClick={handleCreate} disabled={isCreating || !isValid}>
              {isCreating ? "Creating..." : "Create Station"}
            </Button>
          </Magnetic>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
