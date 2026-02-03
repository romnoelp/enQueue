import "./LogsTable.custom.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import React from "react";
const LogsTable = ({ children }: { children: React.ReactNode }) => (
  <ScrollArea className="h-[740px] md:h-[400px] lg:h-[500px] xl:h-[740px] height-1280x720">
    <Table className="h-[100px] md:h-[300px] lg:h-[100px] xl:h-[740px]">
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Details</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  </ScrollArea>
);

export default LogsTable;
