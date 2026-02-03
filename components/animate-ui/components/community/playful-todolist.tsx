"use client";

import * as React from "react";
import { motion, type Transition } from "motion/react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";

const checkboxItems = [
  {
    id: 1,
    label: "Code in Assembly 💾",
    defaultChecked: false,
  },
  {
    id: 2,
    label: "Present a bug as a feature 🪲",
    defaultChecked: false,
  },
  {
    id: 3,
    label: "Push to prod on a Friday 🚀",
    defaultChecked: false,
  },
];

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 1, ease: "easeInOut" },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 1,
  },
});

type PlayfulTodolistItem = {
  id: string | number;
  label: React.ReactNode;
  defaultChecked?: boolean;
};

type PlayfulTodolistProps = {
  items?: PlayfulTodolistItem[];
  className?: string;
  onCheckedChange?: (checkedIds: Array<string | number>) => void;
};

function PlayfulTodolist({
  items = checkboxItems,
  className,
  onCheckedChange,
}: PlayfulTodolistProps) {
  const [checkedById, setCheckedById] = React.useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(items.map((i) => [String(i.id), !!i.defaultChecked])),
  );

  React.useEffect(() => {
    setCheckedById(
      Object.fromEntries(items.map((i) => [String(i.id), !!i.defaultChecked])),
    );
  }, [items]);

  const notifyCheckedChange = React.useCallback(
    (next: Record<string, boolean>) => {
      if (!onCheckedChange) return;
      const checkedIds = items
        .filter((i) => next[String(i.id)])
        .map((i) => i.id);
      onCheckedChange(checkedIds);
    },
    [items, onCheckedChange],
  );

  return (
    <div
      className={[
        "bg-neutral-100 dark:bg-neutral-900 rounded-2xl p-6 space-y-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}>
      {items.map((item, idx) => (
        <div key={item.id} className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              variant="accent"
              checked={!!checkedById[String(item.id)]}
              onCheckedChange={(val) => {
                const next = {
                  ...checkedById,
                  [String(item.id)]: val === true,
                };
                setCheckedById(next);
                notifyCheckedChange(next);
              }}
              id={`checkbox-${item.id}`}
            />
            <div className="relative inline-block">
              <Label htmlFor={`checkbox-${item.id}`}>{item.label}</Label>
              <motion.svg
                width="340"
                height="32"
                viewBox="0 0 340 32"
                className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-10">
                <motion.path
                  d="M 10 16.91 s 79.8 -11.36 98.1 -11.34 c 22.2 0.02 -47.82 14.25 -33.39 22.02 c 12.61 6.77 124.18 -27.98 133.31 -17.28 c 7.52 8.38 -26.8 20.02 4.61 22.05 c 24.55 1.93 113.37 -20.36 113.37 -20.36"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeMiterlimit={10}
                  fill="none"
                  initial={false}
                  animate={getPathAnimate(!!checkedById[String(item.id)])}
                  transition={getPathTransition(!!checkedById[String(item.id)])}
                  className="stroke-neutral-900 dark:stroke-neutral-100"
                />
              </motion.svg>
            </div>
          </div>
          {idx !== items.length - 1 && (
            <div className="border-t border-neutral-300 dark:border-neutral-700" />
          )}
        </div>
      ))}
    </div>
  );
}

export { PlayfulTodolist, type PlayfulTodolistItem, type PlayfulTodolistProps };
