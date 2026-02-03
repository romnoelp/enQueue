"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
// import { apiFetch } from "@/app/lib/backend/api";
import StationsGrid from "@/app/(main)/(people)/stations/_components/StationsGrid";
import AddStationDialog from "./_components/AddStationDialog";
import { api } from "@/app/lib/config/api";
import { isAxiosError } from "axios";
import { Station } from "@/types";
import { StationsRefreshProvider } from "./_contexts/StationsRefreshContext";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const LoadingState = () => (
  <div className="h-full flex items-center justify-center">
    <BounceLoader />
  </div>
);

const ErrorState = ({ message }: { message: string | null }) => (
  <div className="text-red-500">Error loading stations: {message}</div>
);

const Stations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get("/stations", {
        params: {
          limit: 6,
        },
      });
      const cursor = response.data?.nextCursor ?? null;
      setStations(response.data.stations);
      setNextCursor(cursor);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? String(err));
      if (isAxiosError(err)) {
        console.log(err.response?.data);
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const loadMoreStations = async () => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await api.get("/stations", {
        params: {
          cursor: nextCursor,
          limit: 6,
        },
      });

      const cursor = response.data?.nextCursor ?? null;
      setStations((prev) => [...prev, ...(response.data.stations ?? [])]);
      setNextCursor(cursor);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError((err as { message?: string })?.message ?? String(err));
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (mounted) void fetchStations();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <StationsRefreshProvider value={{ refresh: fetchStations }}>
      <div className="p-4 h-full flex flex-col gap-y-4">
        <div className="flex gap-x-4">
          <Input
            placeholder="Main Building..."
            className="text-muted-foreground w-92"
          />
          <AddStationDialog />
        </div>
        <div className="h-full flex flex-col gap-y-4">
          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} />}
          {!loading && !error && (
            <>
              <StationsGrid items={stations ?? []} />
              {nextCursor && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => void loadMoreStations()}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <>
                        <Spinner className="mr-2" /> Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </StationsRefreshProvider>
  );
};

export default Stations;
