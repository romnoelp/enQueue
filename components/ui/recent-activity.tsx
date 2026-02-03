"use client";

import { memo, useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Activity, User, Download, Settings, Users } from "lucide-react";
import { api } from "@/app/lib/config/api";
import type { ActivityLog } from "@/types/activity";

type ActivityItem = {
  id?: string;
  uid?: string;
  action?: string;
  details?: unknown;
  timestamp?: number;
  displayName?: string;
  email?: string;
};

const timeAgo = (ts?: number) => {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const RecentActivity = memo(() => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmailMap, setUserEmailMap] = useState<Map<string, string>>(new Map());
  const fetchingEmails = useRef<Set<string>>(new Set());

  const fetchLogs = useCallback(async (startDate: Date, endDate: Date): Promise<ActivityLog[]> => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    try {
      const res = await api.get(
        "/admin/activity-logs",
        {
          params: {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
          },
        }
      );

      return res.data.activityLogs ?? [];
    } catch {
      return [];
    }
  }, []);

  const fetchUserEmail = useCallback(async (userId: string): Promise<string | null> => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data.user.email ?? null;
    } catch {
      return null;
    }
  }, []);

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
  }, [fetchUserEmail]);

  useEffect(() => {
    let mounted = true;

    const fetchActivities = async () => {
      try {
        // Set start date to today at hour 0
        const today = new Date();
        const startDate = new Date(today);
        startDate.setHours(0, 0, 0, 0);
        
        // Set end date to today at hour 23:59:59.999
        const endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999);

        const logs = await fetchLogs(startDate, endDate);

        // Convert ActivityLog[] to ActivityItem[]
        const items: ActivityItem[] = logs.map((log) => ({
          id: `${log.timestamp}-${log.uid}-${log.action}`,
          uid: log.uid,
          action: log.action,
          details: log.details,
          timestamp: log.timestamp,
          displayName: log.displayName,
          email: log.email,
        }));

        if (mounted) {
          // Limit to 4 items and sort by timestamp descending (most recent first)
          const sortedItems = items
            .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
            .slice(0, 4);
          
          setActivities(sortedItems);
        }
      } catch (err) {
        console.error("Failed to fetch recent activities", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchActivities();

    return () => {
      mounted = false;
    };
  }, [fetchLogs]);

  // Load user emails for unique UIDs when activities change
  useEffect(() => {
    const uniqueUserIds = new Set(
      activities
        .map((item) => item.uid)
        .filter((uid): uid is string => Boolean(uid))
    );
    uniqueUserIds.forEach((userId) => {
      if (!userEmailMap.has(userId) && !fetchingEmails.current.has(userId)) {
        loadUserEmail(userId);
      }
    });
  }, [activities, userEmailMap, loadUserEmail]);

  return (
    <div className="border-border bg-card/40 rounded-xl border p-6 h-full flex flex-col">
      <h3 className="mb-4 text-xl font-semibold">Recent Activity</h3>
      <div className="space-y-3 flex-1 overflow-auto">
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading…</div>
        ) : activities.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          activities.map((activity, index) => {
            // pick icon and color based on action keywords
            const actionLower = (activity.action || "").toLowerCase();
            const getMeta = () => {
              if (actionLower.includes("login"))
                return {
                  Icon: User,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                };
              if (actionLower.includes("export"))
                return {
                  Icon: Download,
                  color: "text-green-500",
                  bg: "bg-green-500/10",
                };
              if (
                actionLower.includes("setting") ||
                actionLower.includes("update")
              )
                return {
                  Icon: Settings,
                  color: "text-orange-500",
                  bg: "bg-orange-500/10",
                };
              if (
                actionLower.includes("register") ||
                actionLower.includes("user")
              )
                return {
                  Icon: Users,
                  color: "text-purple-500",
                  bg: "bg-purple-500/10",
                };
              return {
                Icon: Activity,
                color: "text-slate-600",
                bg: "bg-slate-600/10",
              };
            };

            const { Icon, color, bg } = getMeta();

            const userLabel = (() => {
              const email = activity.email ?? (activity.uid ? userEmailMap.get(activity.uid) : undefined);
              const v =
                activity.displayName ??
                email ??
                activity.uid ??
                (typeof activity.details === "object" &&
                activity.details !== null
                  ? (activity.details as Record<string, unknown>)?.user
                  : undefined);
              if (v === undefined || v === null) return "system";
              if (typeof v === "string") return v;
              try {
                return String(v);
              } catch {
                return "system";
              }
            })();

            const subtitle =
              typeof activity.details === "string" &&
              activity.details.trim().length > 0
                ? activity.details
                : userLabel;

            return (
              <motion.div
                key={activity.id ?? index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="hover:bg-accent/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
              >
                <div className={`${bg} rounded-lg p-2`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {subtitle}
                  </div>
                </div>
                <div className="text-muted-foreground text-xs flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(activity.timestamp)}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
});

RecentActivity.displayName = "RecentActivity";
