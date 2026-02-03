"use client";

import { useState } from "react";
import type { Station } from "@/types/station";
import FlipCardFront from "./FlipCardFront";
import FlipCardBack from "./FlipCardBack";
import { toast } from "sonner";
import { api } from "@/app/lib/config/api";
import { useStationsRefresh } from "../_contexts/StationsRefreshContext";
import { isAxiosError } from "axios";
// import { apiFetch } from "@/app/lib/backend/api";

type Props = {
  station: Station;
  title: string;
};
const FlipCard = ({ station, title }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refresh } = useStationsRefresh();
  const CARD_HEIGHT = 200;
  const FLIP_DURATION = 300;

  const handleDelete = async () => {
    if (!station?.id) {
      toast.error("Station ID is missing");
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`/stations/${station.id}`)
      toast.success(`${station.name ?? "Station"} deleted`);
      await refresh(false);
    } catch (err) {
      console.error("Failed to delete station", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to delete station");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // delete handler and isDeleting are passed down to the back-face component

  return (
    <div
      className="group relative w-full max-w-md perspective-[2000px]"
      style={{ height: CARD_HEIGHT }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative h-full w-full transform-3d transition-all"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionDuration: `${FLIP_DURATION}ms`,
        }}
      >
        {/* Front face */}
        <FlipCardFront title={title} station={station} />

        {/* Back face */}
        <FlipCardBack
          onDialogOpenChange={(open) => {
            if (!open) setIsFlipped(false);
          }}
          isDeleting={isDeleting}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default FlipCard;
