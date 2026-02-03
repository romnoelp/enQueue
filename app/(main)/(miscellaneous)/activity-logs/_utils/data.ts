
import { api } from "@/app/lib/config/api";
import type { ActivityLog } from "@/types/activity";

export const fetchLogs = async (
  startDate: Date,
  endDate: Date
): Promise<ActivityLog[]> => {
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

    return res.data.activityLogs?? [];
  } catch {
    return [];
  }
};

export const fetchUserEmail = async (userId: string): Promise<string | null> => {
  try {
    const res = await api.get(`/admin/users/${userId}`);
    return res.data.user.email ?? null;
  } catch {
    return null;
  }
};
