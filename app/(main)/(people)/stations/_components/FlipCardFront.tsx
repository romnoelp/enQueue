"use client";

import React, { useEffect, useState } from "react";
import type { Station as ImportedStation } from "@/types/station";
// import { apiFetch } from "@/app/lib/backend/api";
import { Info } from "lucide-react";

type Station = Partial<ImportedStation> & {
  id?: string | number;
  role?: string;
  email?: string;
  name?: string;
};

type CounterApiItem = {
  id?: string | number;
  stationId?: string | number;
  cashierUid?: string | null;
};

const FlipCardFront = ({
  title,
  station,
}: {
  title: string;
  station?: Station;
}) => {
  const [isStationActive, setIsStationActive] = useState(false);

  useEffect(() => {
    const stationId = station?.id;
    if (!stationId) {
      // setIsStationActive(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // Backend route is mounted at /counters
        // The backend currently ignores stationId filtering, so we filter client-side.
        // const data = await apiFetch<{ counters?: CounterApiItem[] }>(
        //   "/counters",
        //   {
        //     query: { stationId: String(stationId), limit: 200 },
        //   }
        // );

        // const counters = Array.isArray(data?.counters) ? data.counters : [];
        // const active = counters.some(
        //   (counter) =>
        //     String(counter.stationId ?? "") === String(stationId) &&
        //     Boolean(counter.cashierUid)
        // );

        // if (!cancelled) setIsStationActive(active);
      } catch {
        // Best-effort: if counters cannot be read, default to inactive.
        if (!cancelled) setIsStationActive(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [station?.id]);

  return (
    <div className="absolute inset-0 h-full w-full backface-hidden">
      <div className="rounded-2xl p-6 h-full flex flex-col bg-card text-card-foreground border border-border shadow-md">
        <div className="flex flex-col">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
            <Info className="h-5 w-5" aria-hidden />
          </div>
          <h3
            className="font-bold leading-tight overflow-hidden text-ellipsis"
            style={{
              fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)",
              maxWidth: "100%",
            }}
          >
            {title}
          </h3>

          <div
            className="flex items-center text-sm text-muted-foreground mt-2"
            style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
          >
            {isStationActive ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-primary/80"
                aria-hidden
              >
                <circle cx="12" cy="12" r="8" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-primary/80"
                aria-hidden
              >
                <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
              </svg>
            )}
            <span className="ml-2 capitalize">
              {isStationActive ? "active" : "inactive"}
            </span>
          </div>
        </div>

        <div className="h-px bg-border/50 my-2"></div>

        <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4 text-primary/70 shrink-0"
            aria-hidden
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span
            className="truncate capitalize"
            style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
          >
            {station?.role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FlipCardFront;
