"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Mail, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BlacklistedUserCardProps } from "./types/blacklisted-user-card.types";

const CARD_HEIGHT = "260px";
const FLIP_DURATION = "700";

const CardFront = ({ email, reason, blockedByUser }: { email: string; reason: string; blockedByUser: string | null }) => (
  <div
    className={cn(
      "absolute inset-0 h-full w-full",
      "transform-[rotateY(0deg)] backface-hidden"
    )}
  >
    <div className="scale-in visible cursor-pointer h-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-6 shadow-md",
          "transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg",
          "bg-card text-card-foreground border border-border h-full flex flex-col"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-destructive" />

        <div className="relative flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Ban className="h-5 w-5" />
            </div>

            <h3
              className="font-sans font-semibold leading-tight truncate"
              style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)" }}
            >
              {email}
            </h3>

            <p
              className="text-sm text-muted-foreground line-clamp-2"
              style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
            >
              {reason}
            </p>
          </div>

          <div className="h-px bg-border/50 my-2" />

          <div className="space-y-1">
            <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
              <Mail className="mr-2 h-4 w-4 text-destructive/70 shrink-0" />
              <span
                className="truncate"
                style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
              >
                Blacklisted
              </span>
            </div>
            <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
              <span
                className="text-xs truncate"
                style={{ fontSize: "clamp(0.65rem, 1.5vw, 0.75rem)" }}
              >
                Blocked by: {blockedByUser || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CardBack = ({
  removeLabel,
  onRemove,
}: {
  removeLabel: string;
  onRemove?: () => void;
}) => (
  <div
    className={cn(
      "absolute inset-0 h-full w-full",
      "transform-[rotateY(180deg)] backface-hidden"
    )}
  >
    <div
      className={cn(
        "rounded-2xl p-4 h-full",
        "bg-linear-to-br from-white via-slate-50 to-slate-100",
        "dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800",
        "border border-slate-200 dark:border-zinc-800",
        "shadow-lg dark:shadow-xl flex flex-col items-center justify-center gap-4"
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/5 via-transparent to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10" />

      <div className="relative z-10 flex flex-col items-center gap-3">
        <h3 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white text-center">
          Remove user from blacklist?
        </h3>
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" onClick={onRemove} className="cursor-pointer">
            {removeLabel}
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default function BlacklistedUserCard({
  email,
  reason,
  blockedBy,
  blockedByEmail,
  onRemove,
  removeLabel = "Remove",
}: BlacklistedUserCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const blockedByUser = blockedByEmail || blockedBy || "Loading...";

  return (
    <div
      className="group relative w-full max-w-md p-2 perspective-[2000px]"
      style={{ height: CARD_HEIGHT }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative h-full w-full transform-3d transition-all"
        style={{
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transitionDuration: `${FLIP_DURATION}ms`,
        }}
      >
        <CardFront email={email} reason={reason} blockedByUser={blockedByUser} />
        <CardBack removeLabel={removeLabel} onRemove={onRemove} />
      </div>
    </div>
  );
}
