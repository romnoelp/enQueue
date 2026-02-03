"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LiquidButton } from "@/components/animate-ui/components/buttons/liquid";

interface StationFormProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  typeValue: string;
  setTypeValue: (v: string) => void;
  onOpenAssignDialog: () => void;
  onViewCashiers?: () => void;
}

const StationForm = ({
  name,
  setName,
  description,
  setDescription,
  typeValue,
  setTypeValue,
  onOpenAssignDialog,
  onViewCashiers,
}: StationFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="stationName" className="font-semibold">
          Name
        </Label>
        <Input
          id="stationName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter station name..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="stationDesc" className="font-semibold">
          Description
        </Label>
        <Textarea
          id="stationDesc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this station..."
          rows={3}
        />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2 sm:w-64">
          <Label className="font-semibold">Station Type</Label>
          <Select value={typeValue} onValueChange={setTypeValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select a station type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="auditing">Auditing</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="registrar">Registrar</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <LiquidButton
            size="lg"
            variant="default"
            type="button"
            onClick={onOpenAssignDialog}>
            Assign cashiers
          </LiquidButton>

          <LiquidButton
            size="lg"
            variant="ghost"
            type="button"
            onClick={onViewCashiers}>
            View cashiers
          </LiquidButton>
        </div>
      </div>
    </>
  );
};

export default StationForm;
