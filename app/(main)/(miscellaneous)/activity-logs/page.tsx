"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { fetchLogs, fetchUserEmail } from "./_utils/data";
import LogsTable from "./_components/LogsTable";
import LogRow from "./_components/LogRow";
import EmptyState from "./_components/EmptyState";
import ErrorState from "./_components/ErrorState";
import Actions from "./_components/Actions";
import type { ActivityLog } from "@/types/activity";

const ActivityLogs = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [startDate, setStartDate] = useState<Date | undefined>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmailMap, setUserEmailMap] = useState<Map<string, string>>(new Map());
  const fetchingEmails = useRef<Set<string>>(new Set());

  const loadLogs = useCallback(async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchLogs(startDate, endDate);
      setLogs(data);
    } catch {
      setError("Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const loadUserEmail = useCallback(async (userId: string) => {
    if (fetchingEmails.current.has(userId)) {
      return;
    }

    fetchingEmails.current.add(userId);
    const email = await fetchUserEmail(userId);
    if (email) {
      setUserEmailMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, email);
        return newMap;
      });
    }
    fetchingEmails.current.delete(userId);
  }, []);

  useEffect(() => {
    const uniqueUserIds = new Set(logs.map((log) => log.uid));
    uniqueUserIds.forEach((userId) => {
      if (!userEmailMap.has(userId) && !fetchingEmails.current.has(userId)) {
        loadUserEmail(userId);
      }
    });
  }, [logs, userEmailMap, loadUserEmail]);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) => {
      const details = (log.details ?? "").toLowerCase();
      const email = userEmailMap.get(log.uid) ?? log.uid;
      const emailLower = email.toLowerCase();
      const action = String(log.action ?? "").toLowerCase();
      return details.includes(q) || emailLower.includes(q) || action.includes(q);
    });
  }, [logs, searchQuery, userEmailMap]);

  if (loading) {
    return (
      <div className="h-full flex flex-col gap-y-4 p-4">
        <Actions
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <div className="flex-1 flex items-center justify-center">
          <BounceLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col gap-y-4 p-4">
        <Actions
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <div className="flex-1">
          <ErrorState message={error} onRetry={loadLogs} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-y-4 p-4">
      <Actions
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 overflow-hidden">
        {logs.length === 0 ? (
          <LogsTable>
            <EmptyState />
          </LogsTable>
        ) : filteredLogs.length === 0 ? (
          <LogsTable>
            <EmptyState />
          </LogsTable>
        ) : (
          <LogsTable>
            {filteredLogs.map((log) => (
              <LogRow
                key={`${log.timestamp}-${log.uid}-${String(log.action)}`}
                log={log}
                email={userEmailMap.get(log.uid)}
              />
            ))}
          </LogsTable>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
