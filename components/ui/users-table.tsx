"use client";

import { memo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/app/lib/config/api";
import type Employee from "@/types/employee";
import { isAxiosError } from "axios";

interface UsersTableProps {
  onAddUser?: () => void;
}

type EmployeeWithCreatedAt = Employee & {
  createdAt?: number | string;
};

export const UsersTable = memo(({}: UsersTableProps) => {
  const [users, setUsers] = useState<EmployeeWithCreatedAt[]>([]);
  const [loading, setLoading] = useState(true);

  const formatRole = (role?: string) => {
    if (!role) return "User";
    // Insert space before capital letters (e.g., superAdmin -> super Admin)
    const spaced = role.replace(/([a-z])([A-Z])/g, "$1 $2");
    // Capitalize each word
    return spaced
      .split(/\s|_|-/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  useEffect(() => {
    let mounted = true;

    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/employees", {
          params: {
            limit: 8,
          },
        });

        const employees: EmployeeWithCreatedAt[] = (response.data.employees ?? []) as EmployeeWithCreatedAt[];
        
        if (mounted) setUsers(employees);
      } catch (err) {
        console.error("Failed to load employees", err);
        if (isAxiosError(err)) {
          console.error("Error details:", err.response?.data);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="border-border bg-card/40 rounded-xl border p-3 sm:p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold sm:text-xl">Recent Users</h3>
          <p className="text-muted-foreground text-sm">
            Latest user registrations and activity
          </p>
        </div>
      </div>

      <div className="space-y-2 flex-1 overflow-auto">
        {loading ? (
          <div className="text-muted-foreground p-4">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="text-muted-foreground p-4">No users found</div>
        ) : (
          users.map((user, index) => (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group hover:bg-accent/50 flex items-center gap-4 rounded-lg p-3 transition-colors"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="relative shrink-0">
                  <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold">
                          {user.name ?? user.email ?? user.uid}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-500/10 text-purple-500"
                              : user.role === "superAdmin"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {formatRole(user.role)}
                        </span>
                      </div>

                      <div className="text-muted-foreground mt-1 text-xs truncate">
                        {user.email ?? "—"}
                      </div>
                    </div>

                    <div className="ml-4 shrink-0 text-right">
                      <div className="text-muted-foreground text-xs">
                        {user.createdAt
                          ? new Date(
                              typeof user.createdAt === "number"
                                ? user.createdAt
                                : user.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* action button removed by request */}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
});

UsersTable.displayName = "UsersTable";
