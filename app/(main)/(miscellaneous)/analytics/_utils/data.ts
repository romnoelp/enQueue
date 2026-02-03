import { api } from "@/app/lib/config/api";

/** Per-station result from /analytics/average-wait-time */
export type AverageWaitTimeEntry = {
  averageWaitTimeMinutes: number;
  sampleCount: number;
  stationName: string;
};

/** Response shape: station id -> { averageWaitTimeMinutes, sampleCount } */
export type AverageWaitTimeResponse = Record<string, AverageWaitTimeEntry>;

const toDateRangeParams = (startDate: Date, endDate: Date) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

export const fetchAverageWaitTime = async (
  startDate: Date,
  endDate: Date
): Promise<AverageWaitTimeResponse> => {
  const res = await api.get<AverageWaitTimeResponse>("/analytics/average-wait-time", {
    params: toDateRangeParams(startDate, endDate),
  });
  return res.data ?? {};
};

/** Per-station result from /analytics/completed-throughput */
export type CompletedThroughputEntry = {
  stationName: string;
  completedCount: number;
};

/** Response shape: station id -> { stationName, completedCount } */
export type CompletedThroughputResponse = Record<string, CompletedThroughputEntry>;

export const fetchCompletedThroughput = async (
  startDate: Date,
  endDate: Date
): Promise<CompletedThroughputResponse> => {
  const res = await api.get<CompletedThroughputResponse>("/analytics/completed-throughput", {
    params: toDateRangeParams(startDate, endDate),
  });
  return res.data ?? {};
};
