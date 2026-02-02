"use client";

import { useState, useEffect, useCallback } from "react";
import BounceLoader from "@/components/mvpblocks/bouncing-loader";
import { DateRangeFilter } from "./_components/DateRangeFilter";
import {
  fetchAverageWaitTime,
  fetchCompletedThroughput,
  type AverageWaitTimeResponse,
  type CompletedThroughputResponse,
} from "./_utils/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle2 } from "lucide-react";

function formatWaitTime(value: AverageWaitTimeResponse[string]): string {
  if (value == null) return "—";
  const mins = value.averageWaitTimeMinutes ?? 0;
  if (mins < 1) return "< 1 min";
  return `${Math.round(mins)} min`;
}

const Analytics = () => {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [startDate, setStartDate] = useState<Date | undefined>(sevenDaysAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [waitTimeData, setWaitTimeData] = useState<AverageWaitTimeResponse | null>(null);
  const [throughputData, setThroughputData] = useState<CompletedThroughputResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setError(null);
    try {
      const [waitTimeResult, throughputResult] = await Promise.all([
        fetchAverageWaitTime(startDate, endDate),
        fetchCompletedThroughput(startDate, endDate),
      ]);
      setWaitTimeData(waitTimeResult);
      setThroughputData(throughputResult);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load analytics");
      setWaitTimeData(null);
      setThroughputData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const waitTimeEntries = waitTimeData ? Object.entries(waitTimeData) : [];
  const throughputEntries = throughputData ? Object.entries(throughputData) : [];

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Wait time and completed throughput per station for the selected date range.
        </p>
      </div>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <BounceLoader />
        </div>
      )}

      {error && !loading && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={loadData}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Average wait time</CardTitle>
                <CardDescription>
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                    : "Select a date range above."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {waitTimeEntries.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">
                  No data for this date range.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Station</TableHead>
                      <TableHead className="text-right">Avg. wait time</TableHead>
                      <TableHead className="text-right">Samples</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitTimeEntries.map(([stationId, value]) => (
                      <TableRow key={stationId}>
                        <TableCell className="font-medium">{value.stationName}</TableCell>
                        <TableCell className="text-right">
                          {formatWaitTime(value)}
                        </TableCell>
                        <TableCell className="text-right">
                          {value?.sampleCount ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Completed throughput</CardTitle>
                <CardDescription>
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                    : "Select a date range above."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {throughputEntries.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">
                  No data for this date range.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Station</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {throughputEntries.map(([stationId, entry]) => (
                      <TableRow key={stationId}>
                        <TableCell className="font-medium">
                          {entry?.stationName ?? stationId}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry?.completedCount ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;
