"use client";

import { getStrictContext } from "@/lib/get-strict-context";

type StationsRefreshContextValue = {
  refresh: (showLoading?: boolean) => Promise<void>;
};

const [StationsRefreshProvider, useStationsRefresh] = getStrictContext<StationsRefreshContextValue>(
  "StationsRefreshProvider"
);

export { StationsRefreshProvider, useStationsRefresh };
