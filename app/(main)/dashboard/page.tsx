"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
import { RecentActivity } from "@/components/ui/recent-activity";
import { UsersTable } from "@/components/ui/users-table";
import { useState } from "react";
import { Users, Activity, Eye, MapPin } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Employees",
      value: "—",
      change: "",
      changeType: "positive" as const,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Stations",
      value: "—",
      change: "",
      changeType: "positive" as const,
      icon: MapPin,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Active Counters",
      value: "—",
      change: "",
      changeType: "positive" as const,
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Recent Activities (7d)",
      value: "—",
      change: "",
      changeType: "negative" as const,
      icon: Eye,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ]);

  // useEffect(() => {
  //   let mounted = true;

  //   const fetchDashboard = async () => {
  //     try {
  //       const end = new Date().toISOString();
  //       const start = new Date(
  //         Date.now() - 7 * 24 * 60 * 60 * 1000
  //       ).toISOString();

  //       const [employeesJson, activitiesJson, stationsRaw] = await Promise.all([
  //         apiFetch<{ employees?: unknown[] }>("/admin/employees").catch(() => ({
  //           employees: [],
  //         })),
  //         apiFetch<{ data?: unknown[] }>("/admin/activity-logs", {
  //           query: { startDate: start, endDate: end },
  //         }).catch(() => ({
  //           data: [],
  //         })),
  //         apiFetch<unknown>("/stations").catch(() => null),
  //       ]);

  //       const totalEmployees = Array.isArray(employeesJson.employees)
  //         ? employeesJson.employees.length
  //         : 0;

  //       const stationsList: StationListItem[] = parseStationsResponse(
  //         stationsRaw
  //       ).map((station) => ({
  //         id: (station as Record<string, unknown>).id as
  //           | string
  //           | number
  //           | undefined,
  //       }));
  //       const stationsCount = stationsList.length;

  //       const activityCount = Array.isArray(activitiesJson.data)
  //         ? activitiesJson.data.length
  //         : 0;

  //       // Count active counters across all stations (active = has cashierUid)
  //       let activeCounters = 0;
  //       if (stationsList.length > 0) {
  //         const counterPromises = stationsList.map((station: StationListItem) =>
  //           apiFetch<{ counters?: CounterApiItem[] }>("/counters", {
  //             query: { stationId: station.id ?? "", limit: 200 },
  //           }).catch(() => ({ counters: [] }))
  //         );

  //         const counterResults = await Promise.all(counterPromises);

  //         for (let i = 0; i < counterResults.length; i++) {
  //           const station = stationsList[i];
  //           const res = counterResults[i];
  //           const list = Array.isArray(res.counters) ? res.counters : [];

  //           // Backend currently does not reliably filter by stationId; filter client-side.
  //           const stationCounters = list.filter(
  //             (c: CounterApiItem) =>
  //               String(c.stationId ?? "") === String(station?.id ?? "")
  //           );

  //           activeCounters += stationCounters.filter((c: CounterApiItem) =>
  //             Boolean(c.cashierUid)
  //           ).length;
  //         }
  //       }

  //       if (!mounted) return;

  //       setStats([
  //         {
  //           title: "Employees",
  //           value: totalEmployees.toLocaleString(),
  //           change: "",
  //           changeType: "positive" as const,
  //           icon: Users,
  //           color: "text-blue-500",
  //           bgColor: "bg-blue-500/10",
  //         },
  //         {
  //           title: "Stations",
  //           value: stationsCount.toLocaleString(),
  //           change: "",
  //           changeType: "positive" as const,
  //           icon: MapPin,
  //           color: "text-green-500",
  //           bgColor: "bg-green-500/10",
  //         },
  //         {
  //           title: "Active Counters",
  //           value: activeCounters.toLocaleString(),
  //           change: "",
  //           changeType: "positive" as const,
  //           icon: Activity,
  //           color: "text-purple-500",
  //           bgColor: "bg-purple-500/10",
  //         },
  //         {
  //           title: "Recent Activities (7d)",
  //           value: activityCount.toLocaleString(),
  //           change: "",
  //           changeType: "negative" as const,
  //           icon: Eye,
  //           color: "text-orange-500",
  //           bgColor: "bg-orange-500/10",
  //         },
  //       ]);
  //     } catch (err) {
  //       console.error("Error fetching dashboard data:", err);
  //     }
  //   };

  //   void fetchDashboard();

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  const handleAddUser = () => {
    console.log("Adding new user...");
  };

  return (
    <div className="flex flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
      <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-lg p-3 sm:rounded-xl sm:p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
          <div className="px-2 sm:px-0">
            {/* {session ? (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.25,
                  scale: { type: "spring", visualDuration: 0.2, bounce: 0.2 },
                }}
              >
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome Admin, {session?.user?.name}!
                </h1>
              </motion.div>
            ) : (
              <></>
            )} */}
            <p className="text-muted-foreground text-sm sm:text-base">
              Here&apos;s what&apos;s happening with the school&apos;s counters.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <DashboardCard key={stat.title} stat={stat} index={index} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2 items-stretch">
            <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
              <div className="h-full">
                <UsersTable onAddUser={handleAddUser} />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
