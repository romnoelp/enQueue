"use client";

import { StationMorphingDialog} from "@/app/(main)/(people)/stations/_components/StationMorphDialog";
import { Station } from "@/types";
import * as motion from "motion/react-client";

const StationsGrid = ({
  items,
}: {
  items: Station[];
}) => {
  if (items.length === 0) {
    return (
      <motion.div
        className="flex justify-center items-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-gray-500 dark:text-gray-400">
          There is currently no station.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
      {items.map((station) => (
        <StationMorphingDialog
          key={String(station.id)}
          station={station}
        />
      ))}
    </div>
  );
};

export default StationsGrid;
