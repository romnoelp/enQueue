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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const waitTimeChartConfig = {
  waitTime: {
    label: "Avg. Wait Time (min)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const throughputChartConfig = {
  completed: {
    label: "Completed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

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
  const [waitTimeData, setWaitTimeData] =
    useState<AverageWaitTimeResponse | null>(null);
  const [throughputData, setThroughputData] =
    useState<CompletedThroughputResponse | null>(null);
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
  const throughputEntries = throughputData
    ? Object.entries(throughputData)
    : [];

  // Transform data for charts
  const waitTimeChartData = waitTimeEntries.map(([stationId, value]) => ({
    station: value.stationName,
    waitTime: Math.round(value.averageWaitTimeMinutes ?? 0),
  }));

  const throughputChartData = throughputEntries.map(([stationId, entry]) => ({
    station: entry?.stationName ?? stationId,
    completed: entry?.completedCount ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Wait time and completed throughput per station for the selected date
          range.
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
              onClick={loadData}>
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
                      <TableHead className="text-right">
                        Avg. wait time
                      </TableHead>
                      <TableHead className="text-right">Samples</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitTimeEntries.map(([stationId, value]) => (
                      <TableRow key={stationId}>
                        <TableCell className="font-medium">
                          {value.stationName}
                        </TableCell>
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

      {/* Charts Section */}
      {!loading &&
        !error &&
        (waitTimeChartData.length > 0 || throughputChartData.length > 0) && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Radar Chart - Wait Time per Station */}
            <Card>
              <CardHeader className="items-center">
                <CardTitle>Wait Time Distribution</CardTitle>
                <CardDescription>
                  Average wait time per station (in minutes)
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                {waitTimeChartData.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No wait time data available.
                  </p>
                ) : (
                  <ChartContainer
                    config={waitTimeChartConfig}
                    className="mx-auto aspect-square max-h-[250px]">
                    <RadarChart data={waitTimeChartData}>
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <PolarAngleAxis dataKey="station" />
                      <PolarGrid />
                      <Radar
                        dataKey="waitTime"
                        fill="var(--color-waitTime)"
                        fillOpacity={0.6}
                        dot={{
                          r: 4,
                          fillOpacity: 1,
                        }}
                      />
                    </RadarChart>
                  </ChartContainer>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                    : "Select a date range"}
                </div>
              </CardFooter>
            </Card>

            {/* Bar Chart - Throughput per Station */}
            <Card>
              <CardHeader>
                <CardTitle>Completed Throughput</CardTitle>
                <CardDescription>
                  Number of completed transactions per station
                </CardDescription>
              </CardHeader>
              <CardContent>
                {throughputChartData.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No throughput data available.
                  </p>
                ) : (
                  <ChartContainer config={throughputChartConfig}>
                    <BarChart
                      accessibilityLayer
                      data={throughputChartData}
                      margin={{
                        left: 12,
                        right: 12,
                      }}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="station"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) =>
                          value.length > 10 ? value.slice(0, 10) + "..." : value
                        }
                      />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <defs>
                        <linearGradient
                          id="fillCompleted"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1">
                          <stop
                            offset="5%"
                            stopColor="var(--color-completed)"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--color-completed)"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                      <Bar
                        dataKey="completed"
                        fill="url(#fillCompleted)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    {startDate && endDate
                      ? `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`
                      : "Select a date range"}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
    </div>
  );
};

export default Analytics;
