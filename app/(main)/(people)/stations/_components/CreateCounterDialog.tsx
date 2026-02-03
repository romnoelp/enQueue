"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
  onCreate: (counterNumber: number) => Promise<void> | void;
  isCreating?: boolean;
  creating?: boolean;
};

export default function CreateCounterDialog({
  open,
  setOpen,
  onCreate,
  isCreating,
}: Props) {
  const [counterNumber, setCounterNumber] = useState<string>("");

  const handleCreate = async () => {
    const number = parseInt(counterNumber, 10);
    if (isNaN(number) || number <= 0) {
      return;
    }
    await onCreate(number);
    setCounterNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button asChild size={"lg"}>
          <span>Create</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Counter</DialogTitle>
          <DialogDescription>
            Create a new counter for this station.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="counterNumber">Counter Number</Label>
            <Input
              id="counterNumber"
              type="number"
              min="1"
              placeholder="Enter counter number"
              value={counterNumber}
              onChange={(e) => setCounterNumber(e.target.value)}
              disabled={isCreating}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={isCreating || !counterNumber || parseInt(counterNumber, 10) <= 0}
            onClick={() => void handleCreate()}
          >
            {isCreating ? (
              <>
                <Spinner className="mr-2" /> Creating...
              </>
            ) : (
              "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
