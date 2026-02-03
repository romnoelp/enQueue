import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import CreateCounterDialog from "./CreateCounterDialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/animate-ui/components/radix/alert-dialog";
import CounterCard from "./CounterCard";
// API helpers are provided by ./counterActions
// import {
//   fetchAssignedUserLabels,
//   fetchCountersApi,
//   createCounterApi,
//   deleteCounterApi,
// } from "../_utils/counterActions";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useStationsRefresh } from "../_contexts/StationsRefreshContext";
import { Counter } from "@/types/counter";
import { api } from "@/app/lib/config/api";
import { isAxiosError } from "axios";

type Props = {
  stationId: string
};

const CounterContent = ({ stationId }: Props) => {
  const { refresh } = useStationsRefresh();
  const [open, setOpen] = useState(false);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeDialogCounter, setActiveDialogCounter] = useState<string | null>(
    null
  );
  const [assignedEmails, setAssignedEmails] = useState<Record<string, string>>(
    {}
  );
  const [isCreating, setIsCreating] = useState(false);
  type LoadingAction =
    | { type: "create" }
    | { type: "delete"; id: string }
    | { type: null };
  const [loadingAction, setLoadingAction] = useState<LoadingAction>({
    type: null,
  });
  const [deleteConfirmCounter, setDeleteConfirmCounter] = useState<
    string | null
  >(null);

  // Fetch user email for a cashier UID
  const fetchUserEmail = useCallback(async (cashierUid: string) => {
    try {
      const response = await api.get(`/admin/user/${cashierUid}`);
      const email = response.data?.email || response.data?.data?.email;
      if (email) {
        setAssignedEmails((prev) => ({
          ...prev,
          [cashierUid]: email,
        }));
      }
    } catch (err) {
      console.error(`Failed to fetch user data for ${cashierUid}`, err);
      // Silently fail - don't show toast for individual user fetches
    }
  }, []);

  // Initial fetch of counters for the station
  const fetchCounters = useCallback(async () => {

    setIsInitialLoading(true);
    try {
      const response = await api.get(`/counters/${stationId}`, {
        params: {
          limit: 6,
        },
      });
  
      const cursor = response.data?.nextCursor ?? null;
      const counterList = (response.data.counters ?? []) as Counter[];
      
      setCounters(counterList);
      setNextCursor(cursor);

      // Fetch user emails for counters with cashierUid
      const cashierUids = counterList
        .map((counter: Counter) => counter.cashierUid)
        .filter((uid: string | undefined): uid is string => !!uid);
      const uniqueCashierUids = Array.from(new Set(cashierUids));
      
      // Fetch emails for all unique cashier UIDs
      await Promise.all(
        uniqueCashierUids.map((uid: string) => fetchUserEmail(uid))
      );
    } catch (err) {
      console.error("Failed to fetch counters", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to fetch counters");
      }
    } finally {
      setIsInitialLoading(false);
    }
  }, [stationId, fetchUserEmail]);

  // Load more counters using cursor
  const loadMoreCounters = useCallback(async () => {
    if (!stationId || !nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const response = await api.get(`/counters/${stationId}`, {
        params: {
          cursor: nextCursor,
          limit: 6,
        },
      });
      
      const counterList = (response.data?.counters ?? []) as Counter[];
      const cursor = response.data?.nextCursor ?? null;
      
      setCounters((prev) => [
        ...prev,
        ...counterList.map((counterFromApi) => ({
          id: String(counterFromApi.id ?? ""),
          number: counterFromApi.number ?? 0,
          stationId: String(counterFromApi.stationId ?? stationId),
          cashierUid: counterFromApi.cashierUid ?? undefined,
        })),
      ]);
      setNextCursor(cursor);

      // Fetch user emails for counters with cashierUid that we haven't fetched yet
      const cashierUids = counterList
        .map((counter: Counter) => counter.cashierUid)
        .filter((uid: string | undefined): uid is string => !!uid);
      const uniqueCashierUids = Array.from(new Set(cashierUids));
      
      // Fetch emails for all unique cashier UIDs (duplicates will be skipped by state)
      await Promise.all(
        uniqueCashierUids.map((uid: string) => fetchUserEmail(uid))
      );
    } catch (err) {
      console.error("Failed to load more counters", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to load more counters");
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [stationId, nextCursor, isLoadingMore, fetchUserEmail]);

  useEffect(() => {
    let mounted = true;
    const loadCounters = async () => {
      if (mounted) {
        await fetchCounters();
      }
    };
    void loadCounters();
    return () => {
      mounted = false;
    };
  }, [fetchCounters, open]);

  const handleCreate = async (counterNumber: number) => {
    if (isCreating) return;
    if (!stationId) {
      toast.error("Station not selected");
      return;
    }
    if (!counterNumber || counterNumber <= 0) {
      toast.error("Counter number must be a positive number");
      return;
    }

    setIsCreating(true);
    try {
      setLoadingAction({ type: "create" });
      
      await api.post("/counters", {
        number: counterNumber,
        stationId
      });

      toast.success("Counter created");
      setOpen(false);
      await refresh(false);
      await fetchCounters();
    } catch (err) {
      console.error("Create counter flow failed", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to create counter");
      }
    } finally {
      setIsCreating(false);
      setLoadingAction({ type: null });
    }
  };

  const handleDelete = async (counterId: string) => {
    if (!stationId) {
      toast.error("Station not selected");
      return;
    }
    if (!counterId) {
      toast.error("Counter missing");
      return;
    }

    try {
      setLoadingAction({ type: "delete", id: counterId });
      
      await api.delete(`/counters/${counterId}`, {
        params: {
          stationId
        }
      });

      toast.success("Counter deleted");
      setDeleteConfirmCounter(null);
      // Close the per-counter management dialog and refresh
      setActiveDialogCounter(null);
      await refresh(false);
      await fetchCounters();
      setLoadingAction({ type: null });
    } catch (err) {
      console.error("Failed to delete counter", err);
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to delete counter");
      }
      setLoadingAction({ type: null });
    }
  };

  return (
    <Card className="h-full w-full p-4">
      <div className="flex flex-col gap-y-4">
        {/* Header */}
        <div className="flex flex-col gap-y-1">
          <p className="font-bold text-lg">Counters</p>
          <p className="font-light text-sm text-muted-foreground">
            Manage each counter in the selected station
          </p>
        </div>

        <div className="flex w-full gap-x-2">
          <Input placeholder="Search for counter..." />

          <CreateCounterDialog
            open={open}
            setOpen={setOpen}
            onCreate={handleCreate}
            isCreating={isCreating || loadingAction.type === "create"}
          />
        </div>
        <div className="h-full w-full">
          <ScrollArea className="h-105 w-full border rounded-md">
            <div className="p-2">
              {isInitialLoading ? (
                <div className="col-span-2 flex items-center justify-center h-full text-sm text-muted-foreground">
                  <Spinner className="mr-2" />
                  <p className="font-semibold text-base text-muted-foreground">
                    Loading counters...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 min-h-90">
                  {counters.length === 0 ? (
                    <div className="col-span-2 flex items-center justify-center h-full text-sm text-muted-foreground">
                      <p className="font-semibold text-base text-muted-foreground">
                        No counters
                      </p>
                    </div>
                  ) : (
                    <>
                      {counters.map((counter) => {
                    const counterId = counter.id ?? "";
                    const assignedEmailLabel = counter?.cashierUid
                      ? assignedEmails[counter.cashierUid] ?? ""
                      : "";

                    return (
                      <Dialog
                        key={counterId}
                        open={activeDialogCounter === counterId}
                        onOpenChange={(v) => {
                          if (v) {
                            setActiveDialogCounter(counterId);
                          } else {
                            setActiveDialogCounter(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <CounterCard
                            counterNumber={Number(counter.number ?? 0)}
                            employeeEmail={assignedEmailLabel || undefined}
                          />
                        </DialogTrigger>

                        <DialogContent className="w-105 sm:w-120">
                          <DialogHeader>
                            <DialogTitle>
                              Manage Counter {counter.number}
                            </DialogTitle>
                            <DialogDescription>
                              View counter status and delete this counter
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4 mt-2">
                            <div className="text-sm">
                              <strong>Assigned:</strong>{" "}
                              {counter.cashierUid
                                ? assignedEmailLabel || counter.cashierUid
                                : "No employee assigned"}
                            </div>

                            <div className="flex justify-end">
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  setDeleteConfirmCounter(counterId)
                                }
                              >
                                Delete Counter
                              </Button>
                            </div>
                            {/* Delete confirmation alert dialog (per-counter) */}
                            <AlertDialog
                              open={deleteConfirmCounter === counterId}
                              onOpenChange={(v) => {
                                if (!v) setDeleteConfirmCounter(null);
                              }}
                            >
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete counter
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    disabled={
                                      loadingAction.type === "delete" &&
                                      loadingAction.id === counterId
                                    }
                                    onClick={async () => {
                                      if (!deleteConfirmCounter) return;
                                      await handleDelete(deleteConfirmCounter);
                                    }}
                                    >
                                    {loadingAction.type === "delete" &&
                                    loadingAction.id === counterId ? (
                                      <>
                                        <Spinner className="mr-2" /> Deleting...
                                      </>
                                    ) : (
                                      "Confirm"
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </DialogContent>
                      </Dialog>
                    );
                      })}
                      {nextCursor && (
                        <div className="col-span-2 flex justify-center pt-2">
                          <Button
                            variant="outline"
                            onClick={() => void loadMoreCounters()}
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
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
};

export default CounterContent;
