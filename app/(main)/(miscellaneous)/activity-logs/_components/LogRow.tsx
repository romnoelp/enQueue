import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant } from "../_utils/badge";
import type { ActivityLog } from "@/types/activity";

const LogRow = ({ log, email }: { log: ActivityLog; email?: string }) => (
  <TableRow key={`${log.timestamp}-${log.uid}-${log.action}`}>
    <TableCell className="font-medium">
      {new Date(log.timestamp).toLocaleString()}
    </TableCell>
    <TableCell>{email ?? log.uid}</TableCell>
    <TableCell>
      <Badge variant={getBadgeVariant(log.action)}>{log.action}</Badge>
    </TableCell>
    <TableCell>{log.details ?? "-"}</TableCell>
  </TableRow>
);

export default LogRow;
