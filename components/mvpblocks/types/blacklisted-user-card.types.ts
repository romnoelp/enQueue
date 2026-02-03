export type BlacklistedUserCardProps = {
  email: string;
  reason: string;
  blockedBy: string;
  blockedByEmail?: string;
  onRemove?: () => void;
  removeLabel?: string;
};
