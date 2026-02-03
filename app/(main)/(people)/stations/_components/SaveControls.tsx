"use client";

import {
  FlipButton,
  FlipButtonFront,
  FlipButtonBack,
} from "@/components/animate-ui/components/buttons/flip";

interface SaveControlsProps {
  isDirty: boolean;
  isSaving: boolean;
  isValid: boolean;
  onSave: () => void;
}

const SaveControls = ({
  isDirty,
  isSaving,
  isValid,
  onSave,
}: SaveControlsProps) => {
  return (
    <div className="flex justify-end pt-4">
      {isDirty && !isSaving && (
        <FlipButton disabled={isSaving || !isValid}>
          <FlipButtonFront size="lg" variant="outline">
            Hover to keep changes!
          </FlipButtonFront>
          <FlipButtonBack size="lg" onClick={() => void onSave()}>
            Save Changes
          </FlipButtonBack>
        </FlipButton>
      )}
    </div>
  );
};

export default SaveControls;
