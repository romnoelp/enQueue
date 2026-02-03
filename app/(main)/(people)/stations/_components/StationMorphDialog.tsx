"use client";

import { useState } from "react";
import type { Station } from "@/types/station";
import {
  MorphingDialog,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
} from "@/components/motion-primitives/morphing-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DetailContent from "./DetailContent";
import FlipCard from "./FlipCard";
import CounterContent from "./CounterContent";
import { api } from "@/app/lib/config/api";

export const StationMorphingDialog = ({
  station,
}: {
  station: Station;
}) => {
  const [initialData, setInitialData] = useState<Station | null>(station);
  const [currentStation, setCurrentStation] = useState<Station>(
    station
  );
  const [activeTab, setActiveTab] = useState<string>("details");

  return (
    <MorphingDialog
      transition={{
        type: "spring",
        bounce: 0.05,
        duration: 0.25,
      }}
    >
      <FlipCard
        station={currentStation}
        title={currentStation?.name}
      />

      <MorphingDialogContainer>
        <MorphingDialogContent
          className={`p-4 rounded-lg pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900 ${
            activeTab === "counters"
              ? "h-170 w-175 sm:h-165 sm:w-190"
              : "sm:h-132.5 sm:w-132.5"
          }`}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v)}
            className="h-full flex flex-col items-center"
          >
            <TabsList className="details">
              <TabsTrigger className="w-xs" value="details">
                Details
              </TabsTrigger>
              <TabsTrigger value="counters">Counters</TabsTrigger>
            </TabsList>

            <TabsContent className="w-full" value="details">
              <DetailContent
                initialData={initialData}
                onSave={async (payload: Partial<Station>) => {
                  if (!station?.id) throw new Error("Station ID is missing");

                  await api.put(`/stations/${station.id}`, payload);

                  // Update both states with the same payload
                  const updatedStation = { ...currentStation, ...payload } as Station;
                  setInitialData(updatedStation);
                  setCurrentStation(updatedStation);

                  // Close dialog after successful save
                  const closeBtn = document.querySelector(
                    'button[aria-label="Close dialog"]'
                  ) as HTMLButtonElement | null;
                  closeBtn?.click();
                }}
              />
            </TabsContent>
            <TabsContent value="counters" className="w-full">
              <CounterContent
                stationId={currentStation.id!}
              />
            </TabsContent>
          </Tabs>
          <MorphingDialogClose className="text-zinc-50" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};
